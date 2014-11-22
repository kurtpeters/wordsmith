(function(root) {

    'use strict';

    var ws = root.wordsmith,
        argumentSearch = /,\s*(?=\[|\{)/g;

    function rewriteExpressions(notations, expressions) {

        if (notations === void 0) {
            return expressions;
        }

        notations = notations.replace(/\s+|\{|\}/g, '').split(',');

        var newExpressions = {},
            index = notations.length,
            expression;

        while (index--) {
            expression = notations[index].split(':');
            newExpressions[expression[0]] = expressions[expression[1]];
        }

        return newExpressions;
    }

    function evalArguments(argument, expressions) {

        var filters = argument[1];

        if (filters !== void 0) {

            if (~filters.indexOf('[')) {
                argument[1] = filters.replace(/\s+|\[|\]/g, '').split(',');
                argument[2] = rewriteExpressions(argument[2], expressions);

            } else {

                argument[1] = rewriteExpressions(filters, expressions);
            }

        } else {

            argument[1] = expressions;
        }

        return argument;
    }

    ws.set('nested', /ws\((.*?)\)/g);

    ws.registerFilter('nested', function(phrase, expressions) {

        var regExp = ws.get('nested');

        if (regExp.test(phrase)) {

            return phrase.replace(regExp, function(expression, argument) {
                return ws.apply(ws, evalArguments(argument.split(argumentSearch), expressions));
            });
        }

        return phrase;
    });

})(this);
