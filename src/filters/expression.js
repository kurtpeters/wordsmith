(function(root) {

    'use strict';

    var ws = root.wordsmith;

    ws.set('expression', /%\{(.*?)\}/g);

    ws.registerFilter('expression', function(phrase, expressions) {
        var regExp = ws.get('expression');
        return phrase.replace(regExp, function(expression, property) {
            return expressions[property] || '';
        });
    });

})(this);
