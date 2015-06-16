/*! jQuery.EaseScroller (https://github.com/Takazudo/jQuery.EaseScroller)
 * lastupdate: 2015-06-16
 * version: 1.2.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var $doc, $win, ns;
    ns = {};
    $win = $(window);
    $doc = $(document);
    ns.normalizeEasing = function(val) {
      if ($.type(val) === 'string') {
        return $.easing[val];
      }
      return val;
    };
    ns.yOf = function(el) {
      var y;
      y = 0;
      while (el.offsetParent) {
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return y;
    };
    ns.isHash = function(str) {
      return /^#.+$/.test(str);
    };
    ns.getWhereTo = function(el) {
      var $el;
      $el = $(el);
      return ($el.data('scrollto')) || ($el.attr('href'));
    };
    ns.calcY = function(target) {
      var $target, y;
      if (($.type(target)) === 'number') {
        return target;
      }
      if (($.type(target)) === 'string') {
        if (!ns.isHash(target)) {
          return false;
        }
        $target = $doc.find(target);
      } else {
        $target = $(target);
      }
      if (!$target.size()) {
        return null;
      }
      y = ns.yOf($target[0]);
      return y;
    };
    ns.scrollTop = function($altScrollContainer) {
      if ($altScrollContainer) {
        return $altScrollContainer.scrollTop();
      }
      return $doc.scrollTop() || document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset || 0;
    };
    ns.scrollLeft = function($altScrollContainer) {
      var $el;
      $el = $altScrollContainer || $doc;
      return $el.scrollLeft();
    };
    ns.ua = (function() {
      var evalEach, ret, ua;
      ret = {};
      ua = navigator.userAgent;
      evalEach = function(keys) {
        var matchesAny;
        matchesAny = false;
        $.each(keys, function(i, current) {
          var expr;
          expr = new RegExp(current, 'i');
          if (Boolean(ua.match(expr))) {
            ret[current] = true;
            matchesAny = true;
          } else {
            ret[current] = false;
          }
          return true;
        });
        return matchesAny;
      };
      if (evalEach(['iphone', 'ipod', 'ipad'] || evalEach(['android']))) {
        ret.mobile = true;
      }
      return ret;
    })();
    ns.Scroller = (function(_super) {
      var eventNames;

      __extends(Scroller, _super);

      eventNames = ['scrollstart', 'scrollend', 'scrollcancel'];

      Scroller.defaults = {
        speed: 13,
        duration: 350,
        changehash: true,
        userskip: true,
        selector: 'a[href^=#]:not(.apply-noscroll)',
        adjustEndY: false,
        dontAdjustEndYIfSelectorIs: null,
        dontAdjustEndYIfYis: null,
        easing: 'swing',
        altScrollContainer: null
      };

      function Scroller(options) {
        if (options == null) {
          options = {};
        }
        this.options = $.extend({}, ns.Scroller.defaults);
        if (options) {
          this.option(options);
        }
        this._handleMobile();
        this._handleAltContainer();
      }

      Scroller.prototype._handleMobile = function() {
        if (!ns.ua.mobile) {
          return this;
        }
        this.options.userskip = false;
        return this;
      };

      Scroller.prototype._handleAltContainer = function() {
        if (!this.options.altScrollContainer) {
          return;
        }
        this.$altScrollContainer = $(this.options.altScrollContainer);
        return this;
      };

      Scroller.prototype._invokeScroll = function() {
        var invoke,
          _this = this;
        invoke = function() {
          var o, stepper, updateScrollPosition;
          _this._scrollDefer = $.Deferred();
          _this._scrollDefer.always(function() {
            _this._reservedHash = null;
            return _this._scrollDefer = null;
          });
          o = _this.options;
          stepper = new EaseStepper({
            interval: o.speed,
            easing: o.easing,
            duration: o.duration,
            beginningValue: _this._startY,
            endValue: _this._endY
          });
          updateScrollPosition = function(data) {
            if (_this.$altScrollContainer) {
              return _this.$altScrollContainer.scrollTop(data.value);
            } else {
              return window.scrollTo(_this._startX, data.value);
            }
          };
          stepper.on('start', function() {
            return _this.trigger('scrollstart', _this._endY, _this._reservedHash);
          });
          stepper.on('step', function(data) {
            if (_this._cancelNext) {
              _this._cancelNext = false;
              _this._scrollDefer.reject();
              stepper.stop();
              return _this.trigger('scrollcancel', _this._endY, _this._reservedHash);
            } else {
              return updateScrollPosition(data);
            }
          });
          stepper.on('end', function(data) {
            updateScrollPosition(data);
            if (_this.options.changehash && _this._reservedHash) {
              location.hash = _this._reservedHash;
            }
            _this._scrollDefer.resolve();
            _this.trigger('scrollend', _this._endY, _this._reservedHash);
            return _this._startX = null;
          });
          return stepper.start();
        };
        if (this._scrollDefer) {
          this.stop().then(invoke);
        } else {
          invoke();
        }
        return this;
      };

      Scroller.prototype._prepareForScroll = function(target, localOptions) {
        var adjustAmount, endY, handleAdjustEndY;
        handleAdjustEndY = true;
        if (this.options.changehash) {
          handleAdjustEndY = false;
        }
        if (this.options.adjustEndY === false) {
          handleAdjustEndY = false;
        }
        if ((localOptions != null ? localOptions.adjustEndY : void 0) === false) {
          handleAdjustEndY = false;
        }
        if (ns.isHash(target)) {
          this._reservedHash = target;
          if (this.options.dontAdjustEndYIfSelectorIs) {
            if ($doc.find(target).is(this.options.dontAdjustEndYIfSelectorIs)) {
              handleAdjustEndY = false;
            }
          }
        }
        endY = ns.calcY(target);
        if (endY === false) {
          return this;
        }
        this._startY = ns.scrollTop(this.$altScrollContainer);
        if (endY === this._startY) {
          return this;
        }
        this._startX = ns.scrollLeft(this.$altScrollContainer);
        if (($.type(this.options.dontAdjustEndYIfYis)) === 'number') {
          if (endY === this.options.dontAdjustEndYIfYis) {
            handleAdjustEndY = false;
          }
        }
        adjustAmount = 0;
        if ((localOptions != null ? localOptions.adjustEndY : void 0) != null) {
          adjustAmount = localOptions.adjustEndY;
        } else {
          if (this.options.adjustEndY !== false) {
            adjustAmount = this.options.adjustEndY;
          }
        }
        endY += adjustAmount;
        this._endY = this._normalizeEndYOverDoc(endY);
        return this;
      };

      Scroller.prototype._normalizeEndYOverDoc = function(endY) {
        var docH, winH;
        if (this.$altScrollContainer) {
          return endY;
        }
        docH = $doc.height();
        winH = $win.height();
        if (docH < endY + winH) {
          console.log('hoge');
          endY = docH - winH;
        }
        if (endY < 0) {
          console.log('hoge2');
          endY = 0;
        }
        return endY;
      };

      Scroller.prototype.stop = function() {
        var _this = this;
        return $.Deferred(function(defer) {
          if (_this._scrollDefer) {
            _this._cancelNext = true;
            return _this._scrollDefer.fail(function() {
              return defer.resolve();
            });
          } else {
            return defer.resolve();
          }
        }).promise();
      };

      Scroller.prototype.option = function(options) {
        var _this = this;
        if (!options) {
          return this.options;
        }
        this.options = $.extend({}, this.options, options);
        this._handleMobile();
        $.each(eventNames, function(i, eventName) {
          if (_this.options[eventName]) {
            _this.on(eventName, _this.options[eventName]);
          }
          return true;
        });
        this.options.easing = ns.normalizeEasing(this.options.easing);
        return this;
      };

      Scroller.prototype.live = function(selector) {
        var self;
        selector = selector || this.options.selector;
        self = this;
        $doc.delegate(selector, 'click', function(e) {
          var whereTo;
          e.preventDefault();
          whereTo = ns.getWhereTo(this);
          return self.scrollTo(whereTo);
        });
        return this;
      };

      Scroller.prototype.scrollTo = function(target, localOptions) {
        this._prepareForScroll(target, localOptions);
        this._invokeScroll();
        return this._scrollDefer.promise();
      };

      return Scroller;

    })(window.EaseStepperNs.Event);
    $.fn.easescrollable = function(options) {
      var scroller;
      scroller = new ns.Scroller(options);
      return this.each(function() {
        var $el;
        $el = $(this);
        $el.data('easescroller', scroller);
        if ($el.data('easescrollerattached')) {
          return this;
        }
        $el.bind('click', function(e) {
          e.preventDefault();
          return scroller.scrollTo(ns.getWhereTo(this));
        });
        return $el.data('easescrollerattached', true);
      });
    };
    $.EaseScrollerNs = ns;
    return $.EaseScroller = ns.Scroller;
  })(jQuery, window, document);

}).call(this);
