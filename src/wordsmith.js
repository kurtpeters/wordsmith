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
