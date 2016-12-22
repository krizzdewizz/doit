var fs = require('fs');
var path = require('path');

var DEFAULT_LANG = 'de';

function readMessages(i18n) {
    var all = fs.readdirSync(i18n);
    var obj = {};
    all.forEach(function (it) {
        var lang = it.match(/messages(.*)\.properties/)[1];
        var key = lang[0] === '_' ? lang.substring(1) : DEFAULT_LANG;
        obj[key] = JSON.parse(fs.readFileSync(path.join(i18n, it)));
    });
    return JSON.stringify(obj);
}

function inlineMessages(src, file) {
    var translate = /\I18N\(__moduleName\)/;
    if (src.match(translate)) {
        // console.log('inlining messages: ' + file);
        var i18n = path.join(path.dirname(file), 'i18n');
        var msgs = readMessages(i18n);
        src = src.replace(translate, 'I18N(' + msgs + ')');
    }
    return src;
}

function inlineTemplatesAndStyles(src, file) {
    var parser = require('./parser');
    return parser({ contents: src, path: file }, { useRelativePaths: true });
}

function inlineResources(src, file) {
    return inlineTemplatesAndStyles(inlineMessages(src, file), file);
}

module.exports = {
    inlineResources: inlineResources
}