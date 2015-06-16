do ($ = jQuery, window = window, document = document) ->

  ns = {}
  $win = $(window)
  $doc = $(document)

  # ============================================================
  # tiny utils

  ns.normalizeEasing = (val) ->
    if $.type(val) is 'string'
      return $.easing[val]
    return val
  
  # yOf

  ns.yOf = (el) ->
    y = 0
    while el.offsetParent
      y += el.offsetTop
      el = el.offsetParent
    y

  # isHash - is '#foobar' or not

  ns.isHash = (str) ->
    return /^#.+$/.test str

  # getWhereTo - find where to go

  ns.getWhereTo = (el) ->
    $el = $(el)
    ($el.data 'scrollto') or ($el.attr 'href')

  # calcY - caliculate Y of something

  ns.calcY = (target) ->

    # if target was number, do nothing
    if ($.type target) is 'number'
      return target

    # if target was string, try to find element
    if ($.type target) is 'string'

      # it must be hashval like '#foobar'
      if not ns.isHash target then return false

      # try to get y of the target
      $target = $doc.find target

    # else, it must be element
    else
      $target = $(target)

    if not $target.size() then return null
    y = ns.yOf $target[0]
    y

  # browser thing

  ns.scrollTop = ($altScrollContainer) ->
    if $altScrollContainer
      return $altScrollContainer.scrollTop()
    return $doc.scrollTop() or document.documentElement.scrollTop or document.body.scrollTop or window.pageYOffset or 0
  
  ns.scrollLeft = ($altScrollContainer) ->
    $el = $altScrollContainer or $doc
    return $el.scrollLeft()

  # browser detection

  ns.ua = do ->
    ret = {}
    ua = navigator.userAgent
    evalEach = (keys) ->
      matchesAny = false
      $.each keys, (i, current) ->
        expr = new RegExp current, 'i'
        if (Boolean ua.match(expr))
          ret[current] = true
          matchesAny = true
        else
          ret[current] = false
        true
      matchesAny
    if evalEach ['iphone', 'ipod', 'ipad'] or evalEach ['android']
      ret.mobile = true
    ret

  # ============================================================
  # Scroller

  class ns.Scroller extends window.EaseStepperNs.Event

    eventNames = [
      'scrollstart'
      'scrollend'
      'scrollcancel'
    ]
    
    @defaults = 
      speed: 13 # scrollstep interval
      duration: 350 # scroll duration
      changehash: true # change hash after scrolling or not
      userskip: true # skip all scrolling steps if user scrolled manually while scrolling
      selector: 'a[href^=#]:not(.apply-noscroll)' # selector for delegation event binding
      adjustEndY: false # adjust endY if any number was specified
      dontAdjustEndYIfSelectorIs: null # ex: #header
      dontAdjustEndYIfYis: null # ex: 0
      easing: 'swing' # easing name or easing function
      altScrollContainer: null # selector or element

    constructor: (options = {}) ->

      @options = $.extend {}, ns.Scroller.defaults
      if options then @option options
      @_handleMobile()
      @_handleAltContainer()

    _handleMobile: ->

      # iOS's scrollTop is pretty different from desktop browsers.
      # This feature must be false
      if not ns.ua.mobile then return @
      @options.userskip = false
      return this
    
    _handleAltContainer: ->
      return unless @options.altScrollContainer
      @$altScrollContainer = $(@options.altScrollContainer)
      return this

    _invokeScroll: ->

      # main scroll invocation
      invoke = =>

        # this defer tells scroll end
        @_scrollDefer = $.Deferred()

        @_scrollDefer.always =>
          @_reservedHash = null
          @_scrollDefer = null

        o = @options

        stepper = new EaseStepper
          interval: o.speed
          easing: o.easing
          duration: o.duration
          beginningValue: @_startY
          endValue: @_endY

        updateScrollPosition = (data) =>
          if @$altScrollContainer
            @$altScrollContainer.scrollTop data.value
          else
            window.scrollTo @_startX, data.value

        stepper.on 'start', =>
          @trigger 'scrollstart', @_endY, @_reservedHash

        stepper.on 'step', (data) =>
          if @_cancelNext
            @_cancelNext = false
            @_scrollDefer.reject()
            stepper.stop()
            @trigger 'scrollcancel', @_endY, @_reservedHash
          else
            updateScrollPosition data

        stepper.on 'end', (data) =>
          updateScrollPosition data
          if @options.changehash and @_reservedHash
            location.hash = @_reservedHash
          @_scrollDefer.resolve()
          @trigger 'scrollend', @_endY, @_reservedHash
          @_startX = null

        stepper.start()

      # handle previous scroll
      if @_scrollDefer
        @stop().then invoke
      else
        invoke()

      return this

    _prepareForScroll: (target, localOptions) ->

      handleAdjustEndY = true

      # check options whether this scrolling handles adjustEndY or not
      
      if @options.changehash
        # if changehash was enabled, we can't adjust endY
        handleAdjustEndY = false

      if @options.adjustEndY is false
        handleAdjustEndY = false
      if localOptions?.adjustEndY is false
        handleAdjustEndY = false

      # if scrollTo('#somewhere')
      
      if ns.isHash target
        @_reservedHash = target # reserve hash

        # ignore adjustY if it matches option
        if @options.dontAdjustEndYIfSelectorIs
          if $doc.find(target).is(@options.dontAdjustEndYIfSelectorIs)
            handleAdjustEndY = false

      # try to calc endY
    
      endY = ns.calcY target
      return this if endY is false

      # try to calc startXY

      @_startY = ns.scrollTop @$altScrollContainer # current scrollposition
      return this if endY is @_startY
      @_startX = ns.scrollLeft @$altScrollContainer

      # handle dontAdjustEndYIfYis option

      if ($.type @options.dontAdjustEndYIfYis) is 'number'
        if endY is @options.dontAdjustEndYIfYis
          handleAdjustEndY = false

      adjustAmount = 0

      if localOptions?.adjustEndY?
        adjustAmount = localOptions.adjustEndY
      else
        if @options.adjustEndY isnt false
          adjustAmount = @options.adjustEndY

      endY += adjustAmount
      
      @_endY = @_normalizeEndYOverDoc endY

      return this

    # if endY is below the bottom edge of the document
    # or above the document, normalize it
    _normalizeEndYOverDoc: (endY) ->
    
      return endY if @$altScrollContainer # it's complicated

      docH = $doc.height()
      winH = $win.height()
      if docH < endY + winH
        console.log 'hoge'
        endY = docH - winH
      if endY < 0
        console.log 'hoge2'
        endY = 0
      return endY

    # stop can't stop the scorlling immediately.
    # reserve to stop next one.
    stop: ->

      return $.Deferred (defer) =>
        if @_scrollDefer
          @_cancelNext = true
          @_scrollDefer.fail ->
            defer.resolve()
        else
          defer.resolve()
      .promise()

    # update options
    option: (options) ->

      if not options then return @options
      @options = $.extend {}, @options, options
      @_handleMobile()
      
      $.each eventNames, (i, eventName) =>
        if @options[eventName]
          @on eventName, @options[eventName]
        return true

      # hendle string
      @options.easing = ns.normalizeEasing @options.easing

      return this

    # bind delegate event
    live: (selector) ->

      selector = selector or @options.selector
      self = this
      $doc.delegate selector, 'click', (e) ->
        e.preventDefault()
        whereTo = ns.getWhereTo this
        self.scrollTo whereTo

      return this

    # start scrolling
    scrollTo: (target, localOptions) ->
      
      @_prepareForScroll(target, localOptions)
      @_invokeScroll() # start!

      # we need deferred to know scrollend
      return @_scrollDefer.promise()

  # ============================================================
  # jQuery bridges

  $.fn.easescrollable = (options) ->

    scroller = new ns.Scroller options

    @each ->

      $el = $(@)
      $el.data 'easescroller', scroller
      if $el.data 'easescrollerattached' then return @
      $el.bind 'click', (e) ->
        e.preventDefault()
        scroller.scrollTo (ns.getWhereTo @)
      $el.data 'easescrollerattached', true

  # ============================================================
  # globalify
  
  $.EaseScrollerNs = ns
  $.EaseScroller = ns.Scroller
