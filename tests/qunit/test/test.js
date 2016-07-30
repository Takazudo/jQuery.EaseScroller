(function() {
  (function($, window, document) {
    var ns, wait;
    ns = $.EaseScrollerNs;
    wait = function(time) {
      return $.Deferred(function(defer) {
        return setTimeout(function() {
          return defer.resolve();
        }, time);
      });
    };
    QUnit.testDone(function() {});
    return $(function() {
      $('<div>x</div>').css({
        height: 5000,
        width: 3,
        background: 'red'
      }).appendTo('body');
      test('yOf', function() {
        var $test1, res, scroller;
        scroller = new ns.Scroller;
        $test1 = $('<div>foo</div>').appendTo('body');
        $test1.css({
          position: 'absolute',
          left: 200,
          top: 400,
          width: 200,
          height: 200,
          background: 'red'
        });
        res = ns.yOf($test1[0]);
        equal(res, 400, "yOf returned " + res);
        return $test1.remove();
      });
      test('calcY', function() {
        var $test1, res;
        $test1 = $('<div id="foo">foo</div>').appendTo('body');
        $test1.css({
          position: 'absolute',
          left: 200,
          top: 400,
          width: 200,
          height: 200,
          background: 'red'
        });
        res = ns.calcY($test1);
        equal(res, 400, "calcY(jQueryObject) " + res);
        res = ns.calcY($test1[0]);
        equal(res, 400, "calcY(rawElement) " + res);
        res = ns.calcY(300);
        equal(res, 300, "calcY(300) " + res);
        res = ns.calcY($('#nothingthere'));
        equal(res, null, "non exsisted element " + res);
        return $test1.remove();
      });
      test('Scroller instance creation', function() {
        var scroller;
        scroller = new ns.Scroller;
        return ok(scroller instanceof ns.Scroller, 'done');
      });
      asyncTest('Scroller scrollTo below', function() {
        var defer, scroller;
        expect(3);
        scroller = new ns.Scroller;
        scroller.once('scrollstart', function() {
          return ok(true, 'scrollstart fired');
        });
        scroller.once('scrollend', function() {
          return ok(true, 'scrollend fired');
        });
        defer = scroller.scrollTo(3000);
        return defer.done(function() {
          ok(true, 'deferred worked');
          return start();
        });
      });
      asyncTest('Scroller scrollTo above', function() {
        var defer, scroller;
        expect(3);
        scroller = new ns.Scroller;
        scroller.once('scrollstart', function() {
          return ok(true, 'scrollstart fired');
        });
        scroller.once('scrollend', function() {
          return ok(true, 'scrollend fired');
        });
        defer = scroller.scrollTo(0);
        return defer.done(function() {
          ok(true, 'deferred worked');
          return start();
        });
      });
      asyncTest('Scroller scrollTo repeat', function() {
        var count, oneDone, scroller;
        expect(8);
        scroller = new ns.Scroller;
        count = 0;
        oneDone = function() {
          return wait(0).done(function() {
            count++;
            if (count === 4) {
              return start();
            } else {
              if (count % 2 === 1) {
                return scroller.scrollTo(0);
              } else {
                return scroller.scrollTo(3000);
              }
            }
          });
        };
        scroller.on('scrollstart', function() {
          return ok(true, 'scrollstart fired');
        });
        scroller.on('scrollend', function() {
          ok(true, 'scrollend fired');
          return oneDone();
        });
        return scroller.scrollTo(3000);
      });
      return asyncTest('Scroller stop', function() {
        var defer, scroller;
        expect(3);
        scroller = new ns.Scroller;
        scroller.on('scrollstart', function() {
          return ok(true, 'scrollstart fired');
        });
        scroller.on('scrollend', function() {
          return ok(false, 'scrollend fired');
        });
        scroller.on('scrollcancel', function() {
          return ok(true, 'scrollcancel fired');
        });
        defer = scroller.scrollTo(3000);
        defer.fail(function() {
          ok(true, 'deferred worked');
          window.scrollTo(0, 0);
          return start();
        });
        return wait(100).done(function() {
          return scroller.stop();
        });
      });
    });
  })(jQuery, this, this.document);

}).call(this);
