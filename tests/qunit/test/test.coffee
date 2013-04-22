(($, window, document) ->

  ns = $.EaseScrollerNs

  # export
  wait = (time) ->
    $.Deferred (defer) ->
      setTimeout ->
        defer.resolve()
      , time

  # reset router everytime
  QUnit.testDone ->
    # do something
    
  $ ->

    # put this to prepare scroll area
    $('<div>x</div>').css
      height: 5000
      width:3
      background: 'red'
    .appendTo 'body'

    test 'yOf', ->

      scroller = new ns.Scroller

      $test1 = $('<div>foo</div>').appendTo 'body'
      $test1.css
        position: 'absolute'
        left:200
        top:400
        width:200
        height:200
        background: 'red'

      res = ns.yOf $test1[0]
      equal res, 400, "yOf returned #{res}"
      $test1.remove()


    test 'calcY', ->
      
      $test1 = $('<div id="foo">foo</div>').appendTo 'body'
      $test1.css
        position: 'absolute'
        left:200
        top:400
        width:200
        height:200
        background: 'red'

      res = ns.calcY $test1
      equal res, 400, "calcY(jQueryObject) #{res}"

      res = ns.calcY $test1[0]
      equal res, 400, "calcY(rawElement) #{res}"

      res = ns.calcY 300
      equal res, 300, "calcY(300) #{res}"

      res = ns.calcY $('#nothingthere')
      equal res, null, "non exsisted element #{res}"

      $test1.remove()


    test 'Scroller instance creation', ->

      scroller = new ns.Scroller
      ok (scroller instanceof ns.Scroller), 'done'


    asyncTest 'Scroller scrollTo below', ->
      
      expect 3

      scroller = new ns.Scroller
      scroller.once 'scrollstart', ->
        ok true, 'scrollstart fired'
      scroller.once 'scrollend', ->
        ok true, 'scrollend fired'
      defer = scroller.scrollTo 3000
      defer.done ->
        ok true, 'deferred worked'
        start()


    asyncTest 'Scroller scrollTo above', ->
      
      expect 3

      scroller = new ns.Scroller
      scroller.once 'scrollstart', ->
        ok true, 'scrollstart fired'
      scroller.once 'scrollend', ->
        ok true, 'scrollend fired'
      defer = scroller.scrollTo 0
      defer.done ->
        ok true, 'deferred worked'
        start()


    asyncTest 'Scroller scrollTo repeat', ->
      
      expect 8

      scroller = new ns.Scroller

      count = 0
      oneDone = ->
        wait(0).done -> # wait for current scroll's end
          count++
          if count is 4
            start()
          else
            if count%2 is 1
              scroller.scrollTo 0
            else
              scroller.scrollTo 3000

      scroller.on 'scrollstart', ->
        ok true, 'scrollstart fired'
      scroller.on 'scrollend', ->
        ok true, 'scrollend fired'
        oneDone()
      scroller.scrollTo 3000


    asyncTest 'Scroller stop', ->

      expect 3
      
      scroller = new ns.Scroller
      scroller.on 'scrollstart', ->
        ok true, 'scrollstart fired'
      scroller.on 'scrollend', ->
        ok false, 'scrollend fired'
      scroller.on 'scrollcancel', ->
        ok true, 'scrollcancel fired'
      defer = scroller.scrollTo 3000
      defer.fail ->
        ok true, 'deferred worked'
        window.scrollTo 0, 0
        start()
      wait(100).done ->
        scroller.stop()


) jQuery, @, @document
