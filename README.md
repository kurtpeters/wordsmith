wordsmith
=========
JS filter registry for string utility helpers.

###Bower installation
```
bower install wordsmith
```
===

Standardization is one of the hardest principles to define amongst a team of developers. Too many cooks is the epitome of large team collaboration, especially when dealing with global dependencies. WordSmith is designed to help consolidate standards by centralizing string utility methods and application phrases, not to mention it’s i18n compliant.

###Example

```javascript
ws.extend({
    "greeting": "Welcome to the %{location}"
});

// following example uses the expression filter and returns "Welcome to the ThunderDOM"
ws('gretting', ['expression'], {
    "location": 'ThunderDOM'
});
```

```javascript
ws.extend({
    "scream": "ahh!"
});

// creating a filter
ws.registerFilter('toUpper', function(phrase) {
    return phrase.toUpperCase();
});

// following example will return "AHH!"
ws('scream', ['toUpper']);
```
