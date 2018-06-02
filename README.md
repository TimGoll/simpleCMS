# simpleCMS

SimpleCMS ist eine Bibliothek zur einfachen Erstellung eines Content Management Systems, welches komplett Clientseitig verarbeitet wird. Dabei wird komplett auf Neuladen der Seite verzichtet und nur der Inhalt ausgetauscht. Vor- und Zurücknavigation in der Browsinghistorie wird aber weiterhin gewährleistet.

Es Wird die Bibliothek [simpleAJAX](https://github.com/TimGoll/simpleAJAX) benötigt.

## Einbinden
Nach dem Download der aktuellsten Version (es empfiehlt sich die min-Version zu laden), muss die Datei auf den eigenen Webserver gespeichert werden und anschließend im Header der HTML Datei eingebunden werden. Hierbei muss die Bibliothek vor allen Dateien, die auf diese zurückgreifen, eingebunden werden.

```html
<script type="text/javascript" src="your/path/simpleAJAX.min.js"></script>
<script type="text/javascript" src="your/path/simpleCMS.min.js"></script>
```

## Setup
Beim initialen Seitenladen muss einiges eingerichtet werden. Zuerst müssen die Templates eingerichtet werden, anschließend die Initfunktion ausgeführt werden. Im Nachhinein (während er Laufzeit) können auch weitere Templates registriert werden, jedoch sollte das entsprechende Template für die angesteuerte Website **vor** der `init()`-Funktion registriet werden.

### registerTemplate
```javascript
simpleCMS.registerTemplate : function(urlArgument, templateUrl, insertionElementId, {requiredUrl, insertIntoParentTemplate, hasTemplate, hasChild}, modifyCallback);
// urlArgument              : String after the last '/' which is linked to this template
// templateUrl              : path to the template
// insertionElementId       : html element ID to insert the template into

// requiredUrl              : path before the urlArgument, can be 'undefined'
//                            if isset to '/home/' domain.com/contact will redirect to 'error404', because domain.com/home/contact is needed
// insertIntoParentTemplate : defines if a template is inserted into a parent one or is a mastertemplates, default is false
// hasTemplate              : defines if this argument has its own template or if it uses the parent one, default is true
// hasChild                 : defines if this template is used with different data inside (like articles loaded by IDs), default is false

// modifyCallback           : a callback function, which is called after the loading of the template is finished, can be 'undefined'
```

### init
```javascript
simpleCMS.init({homedir, errorPath});
// homedir   : path to redirect to if just domain.com is entered (domain.com --> domain.com/home)
// errorPath : path to the error404.html template
```

### Beispiel

```javascript
window.onload = function() {
    simpleCMS.registerTemplate('home', '/src/templates/home.html', 'content');
    simpleCMS.registerTemplate('contact', '/src/templates/contact.html', 'subcontent', {requiredUrl: '/home/', insertIntoParentTemplate: true});
    simpleCMS.init({homedir: 'home', errorPath: '/src/templates/error404.html'});
};
```

### Beispiel mit Callback
Es ist außerdem möglich eine Callbackfunktion zu registrieren, die **nach** dem Erfolgreichen Laden und Einbinden des Templates ausgeführt wird. Dies ist gedacht für Code, der nach dem Laden einmalig ausgeführt werden soll.

#### Der data-Parameter
Die Callbackfunktion bekommt beim Ausführen stets Daten mitgegeben:
```
data = {
    lastUrlParameter //the last parameter of the url as string
    urlParameter //all parameters as string array
    lastPage : {
        urlParameter //the last parameter of the previous visited page as string
        lastUrlParameter //all of the last parameters of the previous visited page as string arra
    }
}
```

```javascript
// ...
simpleCMS.registerTemplate('webmail', '/src/templates/webmail.html', 'subcontent', {requiredUrl: '/home/contact/', insertIntoParentTemplate: true}, function(data) {
    console.log(data);
});
// ...
```

### Beispiel mit hasChild
HasChild wird auf `true` gesetzt, wenn man möchte, dass das folgende URL-Argument eine Variable ist, die beispielsweise den Inhalt der Seite definiert, ohne jedoch ein weiteres Template zu laden. `domain.com/home/article/9` würde zum Beispiel das articles template in das home template einbinden und anschließend Artikel Nummer 9 aus einer Datenbank auslesen. Für letzteres eignet sich der `modifyCallback`.

```javascript
// ...
simpleCMS.registerTemplate('article', '/src/templates/article.html', 'subcontent', {requiredUrl: '/home/', insertIntoParentTemplate: true, hasChild: true}, function(data) {
    //eg: request article from server
    var formData = new FormData();
    formData.append('article', data.lastUrlParameter);
    simpleAJAX.request(formData, '/src/php/requestArticle.php', function(data) {
        //process article
    });
});
// ...
```
Nach dem Laden und Einbinden aller Templates wird die Callback-Funktion ausgeführt. Um eine Anfrage an den Server zu stellen, erzeugen wir ein neues `FormData` Objekt und übergeben diese die ID. Die ID ist das letzte Element in der URL und ist daher mit `data.lastUrlParameter` abfragbar. Die Anfrage wird an ein PHP Skript auf unserem Server geschickt, welcher als Antwort den Artikel sendet. Dieser wird nun einfach per Javascript eingebunden.

## Navigation
Klassische Links mittels `<a href="/home/contact">Contact</a>` sind weiterhin möglich und werden abgefangen ohne die Seite neu zu laden. Außerdem kann die Seite geändert werden mittels Javascript. Dazu ist der Befehl `simpleCMS.setPage(url)` von nöten.

## WebsiteContent
Per Standard müssen sich alle Dateien im `/src/`-Ordner auf dem Webserver befinden, damit der Apache-Server die URL nicht umschreibt (URL-Rewriting ist hier nötig um Pfade wie `domain.com/home/contact` ohne `?` zu nutzen und ohne dass die Pfade tatsächlich existieren müssen).

Dies lässt sich in der `.htaccess`-Datei ändern.
```htaccess
1. #always redirect to basefile (index.html)
2. RewriteEngine On
3. RewriteBase /
4. RewriteCond %{REQUEST_URI} !.*/src/.*
5. RewriteRule ^(.*)$ index.html [L,QSA,NE]
```
Interessant ist hier Zeile `4`. Diese bringt das Skript zum Abbruch, wenn der angefragte Pfad mit `/src/` beginnt. Man kann auch meherere `RewriteCond` untereinander schreiben, um verschiedene ignorierte Pfade hinzuzufügen. Man beachte jedoch, dass dann all diese nicht mehr in den URLs vorkommen dürfen.
