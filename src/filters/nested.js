(function(root) {

    'use strict';

    var ws = root.wordsmith;

    ws.set('nested', /ws\((.*?)\)/g);

    ws.registerFilter('nested', function(phrase, expressions) {

        var regExp = ws.get('nested');

        return phrase.replace(regExp, function(expression, args) {
            return ws(args, expressions);
        });
    });

})(this);
