(function(root) {

    'use strict';

    var ws = root.wordsmith, variants = [
        // icelandic
        [function(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }, 'is'],
        // polish
        [function(n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); }, 'pl'],
        // czech
        [function(n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; }, 'cs'],
        // russian
        [function(n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; }, 'hr', 'ru'],
        // french
        [function(n) { return n > 1 ? 1 : 0; }, 'fr', 'tl', 'pt-br'],
        // german
        [function(n) { return n !== 1 ? 1 : 0; }, 'da', 'de', 'en', 'es', 'fi', 'gb', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv', 'uk'],
        // chinese
        [function(n) { return 0; }, 'fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh']
    ];

    function pluralizationRule(rule) {

        var locale = ws.get('locale') || 'en',
            codes,
            index,
            variant;

        for (variant = variants.length - 1; variant; variant--) {
            codes = variants[variant].slice(1);
            index = codes.length;
            while (index--) {
                if (codes[index] === locale) {
                    return variants[variant][0](rule);
                }
            }
        }
    }

    function filterPhrase(phrase, expressions) {

        var expression, rule, property;

        phrase = phrase.split(',');

        expression = ws.utils.trim(phrase[1] || '');
        phrase = phrase[0].split('||');

        if (!isNaN(expressions)) {

            rule = +expressions;

        } else {

            if (expression && expressions[expression]) {

                rule = +expressions[expression];

            } else {

                for (property in expressions) {

                    if (!isNaN(expressions[property])) {
                        rule = +expressions[property];
                        break;
                    }
                }
            }
        }

        return phrase[pluralizationRule(rule || 0)];
    }

    ws.set({
        "pluralize": /p\((.*?)\)/g
    });

    ws.registerFilter('pluralize', function(phrase, expressions) {

        var delimiter = ws.get('pluralize');

        if (!delimiter.test(phrase)) {
            return phrase;
        }

        return phrase.replace(delimiter, function(exp, match) {
            return filterPhrase(match, expressions);
        });

    });

})(this);
