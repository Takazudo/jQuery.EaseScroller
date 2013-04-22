# jQuery.EaseScroller

Simple smooth scroller with events and API.

## Demos

* [Basic](http://takazudo.github.io/jQuery.EaseScroller/demos/basic.html)
* [Live](http://takazudo.github.io/jQuery.EaseScroller/demos/live.html)
* [Events](http://takazudo.github.io/jQuery.EaseScroller/demos/events.html)
* [Events2](http://takazudo.github.io/jQuery.EaseScroller/demos/events2.html)
* [API call](http://takazudo.github.io/jQuery.EaseScroller/demos/apicall.html)
* [API call - stop](http://takazudo.github.io/jQuery.EaseScroller/demos/stop.html)
* [API call - stop(chain)](http://takazudo.github.io/jQuery.EaseScroller/demos/stopchain.html)
* [Deferred](http://takazudo.github.io/jQuery.EaseScroller/demos/deferred.html)
* [Options](http://takazudo.github.io/jQuery.EaseScroller/demos/options.html)
* [Options with live](http://takazudo.github.io/jQuery.EaseScroller/demos/options2.html)
* [adjustEndY](http://takazudo.github.io/jQuery.EaseScroller/demos/adjustendy.html)

## Usage

```javascript
(new $.EaseScroller()).live();
```

I like this with [jQuery easing plugin](https://github.com/danro/jquery-easing/blob/master/jquery.easing.js).

```javascript
(new $.EaseScroller({ easing: 'easeInOutExpo' })).live();
```

For more info, see demos

## Depends

jQuery 1.9.1 (>=1.6.2)

## Browsers

IE6+ and other new browsers.  

## License

Copyright (c) 2013 "Takazudo" Takeshi Takatsudo  
Licensed under the MIT license.

## Build

Use

 * [CoffeeScript][coffeescript]
 * [grunt][grunt]

[coffeescript]: http://coffeescript.org "CoffeeScript"
[grunt]: http://gruntjs.com "grunt"
