var simpleCMS = (function() {
    window.onclick = function(event) {

        for (var i = 0; i < event.path.length -4; i++) { //-4: Window, Document, HTML and Body are ignored
            if (event.path[i].href != undefined) {
                simpleCMS.setPage(event.path[i].href, true);
                break;
            }
        }

        event.preventDefault();
    };

    //catch history change events
    window.onpopstate = function() {
        simpleCMS.setPage(window.location.href, false);
    };




    ////////////////////////////////////////////////////////////////////////////
    /// GLOBAL STUFF                                                         ///
    ////////////////////////////////////////////////////////////////////////////

    var simpleCMS = {
        init : function({homedir} = {}) {
            _homedir = homedir || 'home';

            console.log("Setting up CMS ...");

            this.registerTemplate('error404', 0, undefined, '/src/templates/error404.html', 'content');
            this.setPage(window.location.href, true);
        },
        setPage : function(url, newState) {
            //getting relative url: bla.com/abc/def --> abc/def
            var rel_url = url.substr( url.indexOf(window.location.hostname) + window.location.hostname.length + 1 );

            if (rel_url.length <= 0) { //navigate to default location if no location is set
                url += _homedir;
                rel_url = url.substr( url.indexOf(window.location.hostname) + window.location.hostname.length + 1 );
            }

            var _urlData = _getUrlData(rel_url);

            //check if last value is in templates
            if (!(_urlData[_urlData.length -1] in _templates)) {
                url = '/error404';
                rel_url = 'error404';
                _urlData.push(rel_url);
            }

            var this_template = _templates[ _urlData[_urlData.length -1] ];

            //check if requiredUrl is fitting
            var required_rel_url = '/' + rel_url.substr(0, rel_url.indexOf( _urlData[_urlData.length -1] ));
            if (this_template.requiredUrl != undefined && this_template.requiredUrl != required_rel_url) {
                url = '/error404';
                rel_url = 'error404';
                _urlData.push(rel_url);
                this_template = _templates[ _urlData[_urlData.length -1] ];
            }

            if (newState == true)
                window.history.pushState("object or string", "title", url);

            //CHANGE CONTENT
            simpleAJAX.request(null, this_template.templateUrl, function(data) {
                document.getElementById(this_template.insertionId).innerHTML = data;
            });
        },
        registerTemplate : function(urlArgument, urlLevel, requiredUrl, templateUrl, insertionId, modifyCallback) {
            _templates[urlArgument] = {
                level          : urlLevel,
                requiredUrl    : requiredUrl,
                templateUrl    : templateUrl,
                insertionId    : insertionId,
                modifyCallback : modifyCallback
            };
        }
	};


    ////////////////////////////////////////////////////////////////////////////
    /// LOCAL STUFF                                                          ///
    ////////////////////////////////////////////////////////////////////////////

    var _homedir = '';
    var _templates = {};

    var _getUrlData = function(url) {
        return url.split('/');
    }

    //return Object for global Usage
	return simpleCMS;
})();
