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
simpleCMS.registerTemplate(urlArgument, urlDepth, requiredPath, templatePath, htmlElement);
// urlArgument  : String after the last '/' which is linked to this template
// urlDepth     : number of leading url argument (domain.com/home: 0, domain.com/home/contact: 1)
// requiredPath : path before the urlArgument, can be 'undefined' (if isset to '/home/' domain.com/contact will redirect to 'error404', because domain.com/home/contact is needed)
// templatePath : path to the template
// htmlElement  : html element to insert the template into
```

### init
```javascript
simpleCMS.init({homedir});
// homedir : path to redirect to if just domain.com is entered (domain.com --> domain.com/home)
```

### Beispiel

```javascript
window.onload = function() {
    simpleCMS.registerTemplate('home', 0, undefined, '/src/templates/home.html', 'content');
    simpleCMS.registerTemplate('contact', 1, '/home/', '/src/templates/contact.html', 'content');
    simpleCMS.init({homedir: 'home'});
};
```

## WebsiteContent
Per Standard sind müssen sich alle Dateien im `/src/`-Ordner auf dem Webserver befinden, damit der Apache-Server die URL nicht umschreibt (URL-Rewriting ist hier nötig um Pfade wie `domain.com/home/contact` ohne `?` zu nutzen und ohne dass die Pfade tatsächlich existieren müssen).

Dies lässt sich in der `.htaccess`-Datei ändern.
```htaccess
1. #always redirect to basefile (index.html)
2. RewriteEngine On
3. RewriteBase /
4. RewriteCond %{REQUEST_URI} !.*/src/.*
5. RewriteRule ^(.*)$ index.html [L,QSA,NE]
```
Interessant ist hier Zeile `4`. Diese bringt das Skript zum Abbruch, wenn der angefragte Pfad mit `/src/` beginnt. Man kann auch meherere `RewriteCond` untereinander schreiben, um verschiedene ignorierte Pfade hinzuzufügen. Man beachte jedoch, dass dann all diese nicht mehr in den URLs vorkommen dürfen.
