﻿WS.Namespace.Create('WS.ScrollBar', (function () {

    var SCROLL_DELTA = 100;
    var SCROLL_DURATION = 200;
    var CSS_ELEMENT = 'sb-scroll';
    var CSS_ELEMENT_INIT = 'sb-i';
    var CSS_ELEMENT_RELATIVE = 'sb-rel';
    var CSS_SCROLLBAR = 'sb-scrollbar';
    var CSS_HANDLE = 'sb-handle';
    var CSS_FULL = 'sb-full';
    var CSS_ACTIVE = 'sb-active';
    var IE_VERSION = GetIEVersion();
    var isIE = IE_VERSION > 0 && IE_VERSION <= 11;

    var __scrollbars = [];
    var min = Math.min, max = Math.max;

    function ScrollBar(element) {
        this._element = (typeof element === 'string') ? document.querySelector(element) : element;
        this._bar = null;
        this._stopAnimation = null;
        this._scrollTop = 0;
        this._scrollAnimationFrame = null;
        this._initialized = false;

        if (!isIE) {
            this._onScroll = onScroll.bind(this);
            this._onMouseOver = isIE ? onMouseOverIE.bind(this) : onMouseOver.bind(this);
            this._onMouseWheel = onMouseWheel.bind(this);
            this._onDragStart = onDragStart.bind(this);
            this._updateBar = updateBar.bind(this);
        }

        if (this._element !== undefined && this._element.tabIndex < 0) this._element.tabIndex = -1;

        if (this._element) {

            __scrollbars.push(this);

            init.call(this);
            bindEvents.call(this);
            this.update();
        }
    }

    function init() {
        var element = this._element;
        this._scrollTop = this._element.scrollTop;
        this._bar = element.appendChild(renderBar());

        element.classList.add(CSS_ELEMENT);
        element.classList.add(CSS_ELEMENT_INIT);

        if (isIE) {
            element.classList.add('sb-scroll-ie');
        }

        if (window.getComputedStyle(element).position === 'static') {
            element.classList.add(CSS_ELEMENT_RELATIVE);
        }
        this._initialized = true;
    }

    function bindEvents() {
        if (isIE) return;
        this._element.addEventListener('scroll', this._onScroll);
        this._element.addEventListener('mouseover', this._onMouseOver);
        this._element.addEventListener('scrollbar:mousewheel', this._onMouseWheel, { passive: false });
        this._element.addEventListener('keydown', onKeyDown);
        this._bar.addEventListener('mousedown', this._onDragStart);
    }

    function unbindEvents() {
        if (isIE) return;
        this._element.removeEventListener('scroll', this._onScroll);
        this._element.removeEventListener('mouseover', this._onMouseOver);
        this._element.removeEventListener('scrollbar:mousewheel', this._onMouseWheel);
        this._element.removeEventListener('keydown', onKeyDown);
        this._bar.removeEventListener('mousedown', this._onDragStart);
    }

    function setScrollTop(scrollTop) {
        this._preventNextUpdate = true;
        this._element.scrollTop = scrollTop;
        updateBar.call(this);
    }

    function updateBar() {
        var element = this._element;
        var handle = this._bar.children[0];
        var maxHeight = this._bar.offsetHeight;
        var maxTop = (maxHeight - handle.offsetHeight) / maxHeight;
        var top = (element.scrollTop) / (element.scrollHeight - element.offsetHeight) * maxTop;

        this._bar.style.transform = 'translateY(' + element.scrollTop + 'px)';
        handle.style.top = (top * 100) + '%';
    }

    function updateHandleHeight() {
        var element = this._element;
        var isFull = element.offsetHeight >= element.scrollHeight;
        this._bar.classList.toggle(CSS_FULL, isFull);
        this._bar.children[0].style.height = (element.offsetHeight / element.scrollHeight * 100) + '%';
    }

    function removeEl(element) {
        return (element.parentElement) ?
            element.parentElement.removeChild(element) : null;
    }

    function onKeyDown(event) {
        var keyCode = ('which' in event) ? event.which : event.keyCode;
        var scrollbar = ScrollBar.get(event.currentTarget);

        if (!scrollbar || keyCode < 33 || keyCode > 40) return;

        event.preventDefault();
        event.stopPropagation();

        switch (keyCode) {
            case 33: return scrollbar.pageUp(true);
            case 34: return scrollbar.pageDown(true);
            case 35: return scrollbar.scrollToEnd(true);
            case 36: return scrollbar.scrollTo(0, true);
            case 38: return scrollbar.scrollTo(scrollbar._scrollTop - SCROLL_DELTA, true);
            case 40: return scrollbar.scrollTo(scrollbar._scrollTop + SCROLL_DELTA, true);
            default: return;
        }
    }

    function onScroll(e) {
        if (!this._initialized) return;
        if (this._preventNextUpdate) return this._preventNextUpdate = false;
        this._scrollAnimationFrame = requestAnimationFrame(this._updateBar);
        this._scrollTop = this._element.scrollTop;
    }

    function onMouseOver() {
        this.update();
    }

    var isOver = false;
    function onMouseOverIE() {
        if (isOver) {
            return;
        }
        this.update();
    }

    function onDragStart(e) {
        var element = this._element;
        var mousePos = getMousePos(e);
        var drag = ScrollBar.dragData;

        if (!ScrollBar.activeBar && element) {
            var handle = this._bar.children[0];

            if (e.target === this._bar) {
                var dir = (handle.getBoundingClientRect().top < mousePos[1] ? 1 : -1);
                this.scrollTo((element.scrollTop + element.offsetHeight * dir), true);
            } else {
                onDragEnd();
                this._element.classList.add(CSS_ACTIVE);

                ScrollBar.activeBar = this;

                drag.maxDeltaTop = 1 - (handle.offsetHeight / this._bar.offsetHeight);
                drag.containerHeight = element.offsetHeight;
                drag.height = drag.containerHeight - element.scrollHeight;

                drag.initialY = mousePos[1];
                drag.initialTop = handle.offsetTop / drag.containerHeight;

                document.addEventListener('mousemove', onDragMove);
                document.addEventListener('mouseup', onDragEnd);
            }
        }
    }

    function onDragMove(e) {
        var activeBar;
        var mousePos = getMousePos(e);
        var drag = ScrollBar.dragData;

        if (activeBar = ScrollBar.activeBar) {
            var deltaY = drag.initialY - mousePos[1];
            var top = (drag.initialTop - (deltaY / drag.containerHeight));

            top *= (activeBar._element.scrollHeight - drag.containerHeight) / drag.maxDeltaTop;

            activeBar.scrollTo(top);
        } else {
            onDragEnd();
        }
    }

    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);

        if (ScrollBar.activeBar) {
            ScrollBar.activeBar._element.classList.remove(CSS_ACTIVE);
            ScrollBar.activeBar = null;
        }
    }

    function onMouseWheel(e) {
        var element = e.currentTarget;
        var deltaY = e.detail.deltaY;

        if ((deltaY < 0 && element.scrollTop + element.offsetHeight < element.scrollHeight)
            || (deltaY > 0 && element.scrollTop > 0)) {
            e.preventDefault();
            e.stopPropagation();
        }

        updateHandleHeight.call(this);
        this.scrollTo(this._scrollTop + (e.detail.deltaFactor * -deltaY), Math.abs(deltaY) === 1);
    }

    function animateScrollTo(to, duration, complete) {
        var element = this._element;
        var start = element.scrollTop;
        var distance = to - start;
        var startTime = null;
        var stopped = false;

        var self = this;
        var animateScroll = function (timestamp) {
            if (stopped) return;
            if (!startTime) {
                startTime = timestamp;
            }

            var progress = timestamp - startTime;

            if (progress < duration) {
                requestAnimationFrame(animateScroll);
                var delta = distance > 0 ?
                    max(distance * easeOutQuad(progress / duration), 1) :
                    min(distance * easeOutQuad(progress / duration), -1);
                var val = parseInt(start + delta);
                setScrollTop.call(self, val);
            } else {
                self._stopAnimation = null;
                setScrollTop.call(self, self._scrollTop);
                complete();
            }
        };

        this._stopAnimation = function () { stopped = true };

        requestAnimationFrame(animateScroll);
    }

    function renderBar() {
        var scrollbar = document.createElement('div');
        var handle = document.createElement('div');
        scrollbar.className = CSS_SCROLLBAR;
        handle.className = CSS_HANDLE;
        scrollbar.appendChild(handle);
        return scrollbar;
    }

    function getMousePos(event) {
        return [event.clientX, event.clientY];
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Private CustomEvent 'scrollbar:mousewheel'
     */
    !!(function () {
        var isDOMMouseScroll = /Firefox/i.test(navigator.userAgent);
        var MOUSEWHEEL_EVENT = isDOMMouseScroll ? 'DOMMouseScroll' : 'mousewheel';

        if (document.attachEvent)
            document.attachEvent('on' + MOUSEWHEEL_EVENT, dispatchMouseWheelEvent);
        else if (document.addEventListener)
            document.addEventListener(MOUSEWHEEL_EVENT, dispatchMouseWheelEvent, { passive: false, useCapture: false });

        var createCustomEvent = isIE ? function (eventName, options) {
            var customEvent = document.createEvent('CustomEvent');
            customEvent.initCustomEvent(eventName, options.bubbles, options.cancelable, {
                detail: options.detail
            });
            return customEvent;
        } : function (eventName, options) { return new CustomEvent(eventName, options) };

        function dispatchMouseWheelEvent(e) {
            var closest = null;
            var deltaY = 0;

            if (!e) e = window.event;
            if (e.wheelDelta) deltaY = e.wheelDelta / 120;
            else if (e.detail) deltaY = -e.detail / 3;

            var scrollableElement = e.composedPath ?
                findScrollableInPath(e.composedPath()) :
                findScrollableParent(e.target);

            var customEvent = createCustomEvent('scrollbar:mousewheel', {
                bubbles: true,
                cancelable: true,
                detail: {
                    deltaY: deltaY,
                    deltaFactor: SCROLL_DELTA
                }
            });

            if (scrollableElement && !scrollableElement.classList.contains(CSS_ELEMENT)) {
                return false;
            }

            if (!e.target.dispatchEvent(customEvent) && e.preventDefault) {
                e.preventDefault();
            }
        }

        function isScrollable(element) {
            var overflowY = window.getComputedStyle(element).overflowY;
            if (element.classList.contains(CSS_ELEMENT) || overflowY === 'auto' || overflowY === 'scroll') {
                return true;
            }
            return false;
        }

        function findScrollableInPath(eventPath) {
            if (eventPath) {
                var len = len = eventPath.indexOf(document.body) || eventPath.length
                for (var i = 0; i < len; i++) {
                    if (isScrollable(eventPath[i])) return eventPath[i];
                }
            }
            return null;
        }

        function findScrollableParent(parent) {
            if (parent) {
                if (isScrollable(parent)) return parent;
                while ((parent = parent.parentElement) && parent !== document.body) {
                    if (isScrollable(parent)) return parent;
                }
            }
            return null;
        }
    })();

    function GetIEVersion() {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");

        // If IE, return version number.
        if (Idx > 0)
            return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

        // If IE 11 then look for Updated user agent string.
        else if (!!navigator.userAgent.match(/Trident\/7\./))
            return 11;

        else
            return 0; //It is not IE
    }

    /**
     * Scrolls to the specified value.
     * @param {number} scrollTop Element scrollTop property value
     * @param {boolean|number} duration Animation duration. Set true for default duration.
     */
    function scrollTo(scrollTop, duration) {
        var self = this;
        var element = this._element;

        if (this._stopAnimation) this._stopAnimation();
        scrollTop = this._scrollTop = min(max(scrollTop, 0), element.scrollHeight - element.offsetHeight);

        if (!isIE && duration) {
            if (duration === true) duration = SCROLL_DURATION;
            animateScrollTo.call(this, scrollTop, duration, function () {
                self._preventNextUpdate = false;
            });
        } else {
            setScrollTop.call(this, scrollTop);
        }
    }

    function scrollToEnd(animated) {
        return this.scrollTo(this._element.scrollHeight, animated);
    }

    /**
     * Scrolls up using the container offset height.
     * @param {boolean} animated Set true for animated scroll
     */
    function pageUp(animated) {
        this.pageScroll(-1, animated);
    }

    /**
     * Scrolls down using the container offsetHeight.
     * @param {boolean} animated Set true for animated scroll
     */
    function pageDown(animated) {
        this.pageScroll(1, animated);
    }

    /**
     * Scrolls down using the container offsetHeight.
     * @param {number} multiplier Scroll offsetHeight multiplier
     * @param {boolean} animated Set true for animated scroll
     */
    function pageScroll(multiplier, animated) {
        this.scrollTo(this._scrollTop + this._element.offsetHeight * multiplier, animated);
    }

    /**
     * Refreshes the scrollbar style.
     */
    function update() {
        if (!this._initialized) return;
        if (this._bar.parentElement !== this._element) {
            this._element.appendChild(this._bar);
        }
        updateHandleHeight.call(this);
        updateBar.call(this);
    }

    /**
     * Destroys the scrollbar and clears its event handlers.
     */
    function destroy() {
        if (!this._initialized) return;
        if (this._stopAnimation) this._stopAnimation();
        if (this._scrollAnimationFrame) cancelAnimationFrame(this._scrollAnimationFrame);
        if (this._element && ScrollBar.activeBar === this._element) onDragEnd();

        unbindEvents.call(this);

        this._element.classList.remove(
            CSS_ELEMENT,
            CSS_ELEMENT_INIT,
            CSS_ELEMENT_RELATIVE
        );

        if (removeEl(this._bar)) {
            var scrollbarIndex = __scrollbars.indexOf(this);

            this._element = null;
            this._bar = null;

            if (scrollbarIndex >= 0) {
                __scrollbars.splice(scrollbarIndex, 1);
            }

            this._initialized = false;
            return true;
        }

        return false;
    }

    ScrollBar.activeBar = null;

    ScrollBar.dragData = {
        containerHeight: 0,
        maxTop: 0,
        initialTop: 0,
        initialY: 0,
        deltaY: 0
    };

    ScrollBar.__scrollbars = __scrollbars;

    /**
     * Returns the attached ScrollBar instance using the specified element.
     * @param {HtmlElement} element The scrollable container
     */
    ScrollBar.get = function (element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        for (var i = 0, len = __scrollbars.length; i < len; i++) {
            if (__scrollbars[i]._element === element) {
                return __scrollbars[i];
            }
        }
        return null;
    };

    /**
     * Initializes a new ScrollBar instance into a container and makes it scrollable.
     * @param {HtmlElement} element The scrollable container
     * @param {boolean} forced Set true to force a new instance and destroy the old one.
     */
    ScrollBar.init = function (element, forced) {
        var scrollbar = ScrollBar.get(element);

        if (forced && scrollbar) scrollbar.destroy();

        if (!scrollbar) {
            scrollbar = new ScrollBar(element);
        }

        return scrollbar;
    };

    /**
     * Initializes all selected elements matching the selector below:
     * ```css
     *  .sb-scroll,[sb-scroll],[data-sb-scroll]
     * ```
     * @param {boolean} forced Set true to force all new instances.
     */
    ScrollBar.initAll = function (forced) {
        var containers = document.querySelectorAll('.sb-scroll,[sb-scroll],[data-sb-scroll]');
        var scrollbars = [];
        for (var i = 0, len = containers.length; i < len; i++) {
            scrollbars.push(ScrollBar.init(containers[i], forced));
        }
        return scrollbars;
    };

    /**
     * Destroys the registered ScrollBar instance of the element.
     * @param {HtmlElement} element The scrollable container.
     */
    ScrollBar.destroy = function (element) {
        var scrollbar = ScrollBar.get(element);
        if (scrollbar) scrollbar.destroy();
        return !!scrollbar;
    };

    /**
     * Destroys all registered ScrollBar instances.
     */
    ScrollBar.destroyAll = function () {
        var scrollbars = [].concat(__scrollbars);
        var destroyedCount = 0;
        for (var i = 0, len = scrollbars.length; i < len; i++) {
            if (scrollbars[i].destroy()) destroyedCount++;
        }
        return destroyedCount;
    };

    /**
     * Polyfill for requestAnimationFrame
     */
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());

    window.addEventListener('load', function () { ScrollBar.initAll(false) }, false);

    ScrollBar.prototype.scrollTo = scrollTo;
    ScrollBar.prototype.scrollToEnd = scrollToEnd;
    ScrollBar.prototype.pageUp = pageUp;
    ScrollBar.prototype.pageDown = pageDown;
    ScrollBar.prototype.pageScroll = pageScroll;
    ScrollBar.prototype.update = update;
    ScrollBar.prototype.destroy = destroy;

    return ScrollBar;
})());