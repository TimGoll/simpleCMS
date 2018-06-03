var simpleCMS = (function() {
    window.onclick = function(event) {
        for (var i = 0; i < event.path.length -4; i++) { //-4: Window, Document, HTML and Body are ignored
            //check for link
            if (event.path[i].href == undefined)
                break;

            //check for target
            var target = event.path[i].target == '' ? '_self' : event.path[i].target;

            //check for external links
            var http_link  = event.path[i].href.indexOf('http://') == 0;
            var https_link = event.path[i].href.indexOf('https://') == 0;
            var external = http_link || https_link;

            if (external) {
                window.open(event.path[i].href, target);
            } else {
                if (target == '_self') {
                    simpleCMS.setPage(event.path[i].href, true);
                    event.preventDefault();
                    break;
                } else {
                    window.open(event.path[i].href, target);
                }
            }
        }
    };

    //catch history change events
    window.onpopstate = function() {
        simpleCMS.setPage(window.location.href, false);
    };




    ////////////////////////////////////////////////////////////////////////////
    /// GLOBAL STUFF                                                         ///
    ////////////////////////////////////////////////////////////////////////////

    var simpleCMS = {
        init : function({homedir, errorPath} = {}) {
            _homedir = homedir || 'home';

            console.log("Setting up CMS ...");

            this.registerTemplate('error404', errorPath, 'content');
            this.setPage(window.location.href, true);
        },
        setPage : function(url, newState) {
            //getting relative url: bla.com/abc/def --> abc/def
            var rel_url = url.substr( url.indexOf(window.location.hostname) + window.location.hostname.length + 1 );

            //remove '/' at the end
            if (rel_url.charAt(rel_url.length -1) == '/')
                rel_url = rel_url.substr(0, rel_url.length -1);

            if (rel_url.length <= 0 || rel_url == 'index.html' || rel_url == 'index.php') { //navigate to default location if no location is set
                url += _homedir;
                rel_url = url.substr( url.indexOf(window.location.hostname) + window.location.hostname.length + 1 );
            }

            var urlData = _getUrlData(rel_url);
            var urlDataForCallback = _getUrlData(rel_url);

            var this_template = {};

            //check if last value is in templates
            if (!(urlData[urlData.length -1] in _templates)) {
                for (var offset = 0; offset < urlData.length; offset++) {
                    //iterate backwarts through the url arguments
                    if ((urlData[urlData.length - offset -1] in _templates)) { //valid template found
                        if (offset <= _templates[urlData[urlData.length - offset -1]].hasChild) {
                            for (var i = 0; i < offset; i++) {
                                urlData.pop();
                            }
                            this_template = _templates[ urlData[urlData.length -1] ];
                        } else { //template child are not valid
                            url = '/error404';
                            rel_url = 'error404';
                            urlData = [rel_url];
                            this_template = _templates[rel_url];
                        }
                    }
                }
            } else { //default case
                this_template = _templates[ urlData[urlData.length -1] ];
            }

            //check if requiredUrl is fitting
            var required_rel_url = '/' + rel_url.substr(0, rel_url.indexOf( urlData[urlData.length -1] ));
            if (this_template.requiredUrl != undefined && this_template.requiredUrl != required_rel_url) {
                url = '/error404';
                rel_url = 'error404';
                urlData = [rel_url];
                this_template = _templates[rel_url];
            }

            if (newState == true) //should add entry to browser history
                window.history.pushState("object or string", "title", url);

            //CHANGE CONTENT
            var templateListTmp = [];
            if (this_template.insertIntoParentTemplate) { //insert template into parent one
                for (var i = 0; i < urlData.length; i++)
                    templateListTmp.push( _templates[ urlData[i] ] );

                var nextTemplateTmp = templateListTmp.shift();
            } else { //just load the new template and use it as main template
                var nextTemplateTmp = this_template;
            }

            var data = { //values for callback
                lastUrlParameter : urlDataForCallback[urlDataForCallback.length -1],
                urlParameter     : urlDataForCallback,
                lastPage         : {
                    urlParameter : _lastPage,
                    lastUrlParameter : _lastPage[_lastPage.length -1]
                }
            }

            _loadCascadingTemplate(templateListTmp, nextTemplateTmp, data);

            _lastPage = urlData;
        },
        registerTemplate : function(urlArgument, templateUrl, insertionElementId, {requiredUrl, insertIntoParentTemplate, hasTemplate, hasChild} = {}, modifyCallback) {
            _templates[urlArgument] = {
                templateUrl              : templateUrl,
                insertionElementId       : insertionElementId,
                modifyCallback           : modifyCallback,

                requiredUrl              : requiredUrl,
                insertIntoParentTemplate : insertIntoParentTemplate || false,
                hasTemplate              : hasTemplate || true,
                hasChild                 : hasChild || 0,

                modifyCallback           : modifyCallback
            };
        }
	};


    ////////////////////////////////////////////////////////////////////////////
    /// LOCAL STUFF                                                          ///
    ////////////////////////////////////////////////////////////////////////////

    var _homedir = '';
    var _templates = {};
    var _lastPage = [];

    var _getUrlData = function(url) {
        return url.split('/');
    }

    //loads and inserts multiple templates after one another
    var _loadCascadingTemplate = function(templateList, nextTemplate, dataForCallback) {
        simpleAJAX.request(null, nextTemplate.templateUrl, function(data) {
            document.getElementById(nextTemplate.insertionElementId).innerHTML = data;

            if (templateList.length > 0) {
                var nextTemplateTmp = templateList.shift();
                _loadCascadingTemplate(templateList, nextTemplateTmp, dataForCallback);
            } else if (nextTemplate.modifyCallback != undefined) {
                nextTemplate.modifyCallback(dataForCallback);
            }
        });
    };

    //return Object for global Usage
	return simpleCMS;
})();
