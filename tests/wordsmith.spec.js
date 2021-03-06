var ws = require('../build/wordsmith.js').ws,
    expect = require('expect.js');

describe('wordsmith', function() {

    'use strict';

    it('should extend interanal phrase library', function() {

        ws.extend('level1.level2', 'test phrase');
        expect(ws('level1.level2')).to.equal('test phrase');

        ws.extend({
            "level1": {
                "level2": 'phrase test'
            }
        });
        expect(ws('level1.level2')).to.equal('phrase test');
    });

    it('should set nested phrase based on notation setting', function() {
        ws.set('notation', ':');
        ws.extend({"first": {"second": 'second level'}});
        expect(ws('first:second')).to.equal('second level');
    });

    it('should set internal configuration settings', function() {

        ws.set('apple', true);
        expect(ws.get('apple')).to.equal(true);

        ws.set({
            "one": '1',
            "two": 2
        });
        expect(ws.get('one')).to.equal('1');
        expect(ws.get('two')).to.equal(2);
    });

    it('should retrieve internal configuration attribute', function() {
        ws.set('apple', true);
        expect(ws.get('apple')).to.equal(true);
    });

    it('should retrieve internal phrase lookup', function() {
        ws.extend('test', 'this is a test');
        expect(ws('test')).to.equal('this is a test');
    });

    it('should return default text if phrase does not exist', function() {
        expect(ws('test')).to.equal('Missing phrase: test');
    });

    it('should return empty string if throwError setting is turned off', function() {
        ws.set('throwError', false);
        expect(ws('test')).to.equal('');
    });

    it('should register assigned filters', function() {
        ws.registerFilter('test1', function(phrase) {
            return 'test: ' + phrase;
        });
        ws.extend('content', 'content phrase');
        expect(ws('content | test1')).to.equal('test: content phrase');

        ws.registerFilter({
            "test2": function(phrase) {
                return phrase.replace(/\s+/g, '');
            }
        });
        expect(ws('content | test2')).to.equal('contentphrase');
    });

    it('should apply requested filters to phrase', function() {
        ws.extend('content', 'content phrase');
        expect(ws('content | test1 | test2')).to.equal('test:contentphrase');
        expect(ws('content | test1', ['test2'])).to.equal('test:contentphrase');
        expect(ws('content', ['test1', 'test2'])).to.equal('test:contentphrase');
    });

    it('should apply default filters from attribute settings', function() {
        ws.set('defaultFilters', ['test1']);
        ws.extend('content', 'content phrase');
        expect(ws('content')).to.equal('test: content phrase');
        expect(ws('content | test2')).to.equal('test:contentphrase');
        ws.set('defaultFilters', []);
    });

    afterEach(function() {
        ws.empty();
    });

});

describe('filter:expression', function() {

    'use strict';

    beforeEach(function() {
        ws.extend('test', 'Welcome to the %{place}');
    });

    it('should replace expression with provided property', function() {
        expect(ws('test | expression', {
            "place": 'ThunderDOM'
        })).to.equal('Welcome to the ThunderDOM');
    });

    it('should replace expression with nothing if property does not exist', function() {
        expect(ws('test | expression', {
            "places": 'ThunderDOM'
        })).to.equal('Welcome to the');
    });

    afterEach(function() {
        ws.empty();
    });

});

describe('filter:pluralization', function() {

    'use strict';

    beforeEach(function() {
        ws.extend({
            "apple": "p(apple || apples, n)"
        });
    });

    it('should return pluralized variation of phrase', function() {
        expect(ws('apple | pluralize')).to.equal('apples');
        expect(ws('apple | pluralize', 1)).to.equal('apple');
        expect(ws('apple | pluralize', 2)).to.equal('apples');
    });

    afterEach(function() {
        ws.empty();
    });
});

describe('filter:nested', function() {

    'use strict';

    beforeEach(function() {
        ws.extend({
            "book": "p(goosebump || goosebumps, n)",
            "gerd": "oh mer gerd ws(book, [pluralize])!",
            "reverse": '%{n} number',
            "nested": "number %{number}, ws(reverse, [expression], {n: number})",
            "nestedWithoutArray": "number %{number}, ws(reverse | expression, {n: number})"
        });
    });

    it('should perform nested phrase lookups', function() {
        expect(ws('gerd | nested')).to.equal('oh mer gerd goosebumps!');
    });

    it('should reassign nested arguments', function() {
        expect(ws('gerd', ['nested'], 1)).to.equal('oh mer gerd goosebump!');
        expect(ws('gerd', ['nested'], {"number": 0})).to.equal('oh mer gerd goosebumps!');
        expect(ws('gerd', ['nested'], {"n": 1})).to.equal('oh mer gerd goosebump!');
        expect(ws('gerd', ['nested'], {"number": 0, "n": 1})).to.equal('oh mer gerd goosebump!');
        expect(ws('nested', ['expression', 'nested'], {"number": 1})).to.equal('number 1, 1 number');
        expect(ws('nestedWithoutArray', ['expression', 'nested'], {"number": 1})).to.equal('number 1, 1 number');
    });

    afterEach(function() {
        ws.empty();
    });
});

describe('wordsmith:restore', function() {

    'use strict';

    it('should restore to original library defaults', function() {

        ws.extend('test', 'this is a test');
        expect(ws('test')).to.equal('this is a test');

        ws.set('apple', true);
        expect(ws.get('apple')).to.equal(true);

        ws.restore();
        expect(ws('test')).to.equal('Missing phrase: test');
        expect(ws.get('apple')).to.equal(void 0);
    });

});
