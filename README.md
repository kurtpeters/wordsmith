wordsmith
=========
JS filter registry for i18n, markdown, and other string helpers.

###Bower installation
```
bower install wordsmith
```
===

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
