(function(root) {

    'use strict';

    var wordsmith, ws, DEFAULTS = {
        "deafultText": 'Missing phrase: ',
        "filter": '|',
        "filters": [],
        "locale": 'en',
        "notation": '.',
        "throwError": true
    };

    function trim(string) {
        var regExp = /^\s+|\s+$/g;
        return string.replace(regExp, '');
    }

    function reformat(property, value) {

        var properties = {};

        if (property && property.constructor === String) {
            properties[property] = value;
        } else {
            properties = property || properties;
        }

        return properties;
    }

    function Wordsmith() {
        this.attributes = {};
        this.filters = {};
        this.phrases = {};
        this.sequence = [];
    }

    Wordsmith.prototype.extend = function(phrases, prefix) {

        var item, phrase;

        for (item in phrases) {

            phrase = phrases[item];

            if (prefix !== void 0) {
                item = prefix + this.attributes.notation + item;
            }

            if (phrase instanceof Object) {
                this.extend(phrase, item);
                continue;
            }

            this.phrases[item] = phrase;
        }

        return this;
    };

    Wordsmith.prototype.parse = function(phrase, definedFilters) {

        var filters = phrase.split(this.attributes.filter);

        phrase = trim(filters[0]);
        filters = this.attributes.filters.concat(filters.slice(1), definedFilters || []);
        definedFilters = filters.length;

        while (definedFilters--) {
            this.sequence.push(trim(filters[definedFilters]));
        }

        return phrase;
    };

    Wordsmith.prototype.process = function(phrase, expressions) {

        var index = this.sequence.length,
            filter;

        phrase = this.phrases[phrase];

        if (phrase !== void 0) {

            while (index--) {

                filter = this.filters[this.sequence[index]];

                if (filter instanceof Function) {

                    phrase = filter.call({

                    }, phrase, expressions || {});
                }
            }

            phrase = trim(phrase);
        }

        this.sequence = [];

        return phrase;
    };

    Wordsmith.prototype.restore = function() {
        this.constructor.call(this);
        return this;
    };

    wordsmith = new Wordsmith();

    root.wordsmith = root.ws = ws = function(phrase, filters, expressions) {

        if (filters && !(filters.sort instanceof Function)) {
            expressions = filters;
            filters = [];
        }

        phrase = wordsmith.parse(phrase, filters);

        return wordsmith.process(phrase, expressions) || (ws.get('throwError') ? ws.get('deafultText') + phrase : '');
    };

    ws.extend = function() {
        wordsmith.extend(reformat.apply(this, arguments));
        return this;
    };

    ws.get = function(property) {
        return wordsmith.attributes[property];
    };

    ws.registerFilter = function(property, filter) {

        if (property && property.constructor === String) {
            wordsmith.filters[property] = filter;
            return this;
        }

        for (filter in property) {
            wordsmith.filters[filter] = property[filter];
        }

        return this;
    };

    ws.empty = function(phrases) {
        wordsmith.phrases = phrases || {};
        return this;
    };

    ws.restore = function() {
        wordsmith.restore();
        this.set(DEFAULTS);
        return this;
    };

    ws.set = function() {

        var attributes = reformat.apply(this, arguments),
            property;

        for (property in attributes) {
            wordsmith.attributes[property] = attributes[property];
        }

        return this;
    };

    return ws.restore();

})(this);

(function(root) {

    'use strict';

    var ws = root.wordsmith;

    ws.set('expression', /%\{(.*?)\}/g);

    ws.registerFilter('expression', function(phrase, expressions) {

        var regExp = ws.get('expression');

        if (regExp.test(phrase)) {

            return phrase.replace(regExp, function(expression, property) {
                return expressions[property] || '';
            });
        }

        return phrase;
    });

})(this);

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

    ws.set({
        "delimiter": '||'
    });

    ws.registerFilter('pluralize', function(phrase, expressions) {

        var delimiter = ws.get('delimiter'),
            property, rule;

        if (~phrase.indexOf(delimiter)) {
            phrase = phrase.split(delimiter);
            if (!isNaN(expressions)) {
                rule = +expressions;
            } else {
                for (property in expressions) {
                    if (!isNaN(expressions[property])) {
                        rule = +expressions[property];
                        break;
                    }
                }
            }

            phrase = phrase[pluralizationRule(rule || 0)];
        }

        return phrase;
    });

})(this);
