(function(root) {

    'use strict';

    var wordsmith, ws, FILTERS = {}, DEFAULTS = {
        "deafultText": 'Missing phrase: ',
        "filter": '|',
        "locale": 'en',
        "notation": '.',
        "throwError": true
    };

    function trim(string) {
        var regExp = /^\s+|\s+$/g;
        return string.replace(regExp, '');
    }

    function Wordsmith() {
        this.attributes = {};
        this.phrases = {};
        this.sequence = [];
    }

    Wordsmith.prototype.set = function(attributes) {

        for (var property in attributes) {
            this.attributes[property] = attributes[property];
        }

        return this;
    };

    Wordsmith.prototype.restore = function() {
        this.constructor.call(this);
        return this;
    };

    Wordsmith.prototype.parse = function(phrase) {

        var filters = phrase.split(this.attributes.filter),
            filter = filters.length - 1;

        phrase = trim(filters[0]);
        filters = (this.attributes.filters || []).concat(filters.slice(1));

        while (filter--) {
            this.sequence.push(trim(filters[filter]));
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

    wordsmith = new Wordsmith();
    wordsmith.filters = {};

    root.wordsmith = root.ws = ws = function(phrase, expressions) {
        phrase = wordsmith.parse(phrase);
        return wordsmith.process(phrase, expressions) || (ws.get('throwError') ? ws.get('deafultText') + phrase : '');
    };

    ws.extend = function(phrase, value) {

        var phrases = {};

        if (phrase && phrase.constructor === String) {
            phrases[phrase] = value;
        } else {
            phrases = phrase || phrases;
        }

        wordsmith.extend(phrases);

        return this;
    };

    ws.set = function(attribute, value) {

        var attributes = {};

        if (attribute && attribute.constructor === String) {
            attributes[attribute] = value;
        } else {
            attributes = attribute || attributes;
        }

        wordsmith.set(attributes);

        return this;
    };

    ws.get = function(property) {
        return wordsmith.attributes[property];
    };

    ws.replace = function(phrases) {
        wordsmith.phrases = phrases || {};
        return this;
    };

    ws.restore = function() {
        wordsmith.restore();
        this.set(DEFAULTS);
        return this;
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

    ws.restore();

})(this);
