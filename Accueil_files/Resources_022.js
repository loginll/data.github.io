﻿
$(window).load(function ()
{
    if (pageData.xkey) AjaxManager.SetKey(pageData.xkey);

    window.ContentCount = 0;
    window.ContentLoadedCount = 0;
    window.IsPreview = pageData.xkey;
    window.AllItems = [];
    window.BodyItems = [];

    // CONTENT ASYNC
    if (!WS.Sync)
    {
        var contents = $(".Block");
        contents.each(function ()
        {
            var type = $(this).attr("class").match(/Type_([^\s]*)/i)[1];
            if (ContentLoader.staticTypes.indexOf(type) === -1) window.ContentCount++;
        });

        var _contentLen = contents.length;
        for (var i = 0; i < _contentLen; i++)
        {
            var content = new window.Content(contents.eq(i));
            window.AllItems.push(content);
            if (content.InBody()) window.BodyItems.push(content);
        }
    }

    $("#HeaderMenuZone").css('visibility', 'hidden'); // hide menu

    // MENU
    var Menu = new WS.Editor.Menu($("#Menu"));
    window.setTimeout(function ()
    {
        Menu.Bind();
        window.setAnchorLinks($("#Menu"));
        $("#HeaderMenuZone").css('visibility', 'visible'); // show menu
    }, 1);

    // Safari special treatment for letter spacing
    var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/Chromium/.test(navigator.userAgent) &&!window.MSStream;

    if (isSafari) {
        var textBlocks = $(".Block.Type_Text .Block_Wrapper");
        textBlocks.each(function () {
            var lettersp = String($(this).css("letter-spacing")).replace("1px", "0px");        
            $(this).css("letter-spacing", lettersp);          
        });

    }

    // IOS special treatment for background images
    var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isiOS && !window.WS.IsMobile) { $('meta[name=viewport]').attr('content', 'width=1000px'); }

    var Background = $("#Background");
    if (Background.length && isiOS)
    {
        if (Background.css("background-size") == "cover")
        {
            var img = new Image();
            img.src = Background.css('background-image').replace(/url\(|\)$/ig, "");

            imageRatio = img.width / img.height;

            if (Background.width() / Background.height() > imageRatio)
            {
                Background.css({ "background-size": "100% auto", "background-position": "center top" });
            }
            else Background.css({ "background-size": "auto 100%", "background-position": "center top" });

            $(window).on("orientationchange", function ()
            {
                if (Background.width() / Background.height() > imageRatio)
                {
                    Background.css("background-size", "100% auto");
                }
                else Background.css("background-size", "auto 100%");
            });
        }
    }

    var Header = $('#HeaderWrapper');
    if (Header.length && isiOS)
    {
        if (Header.css("background-attachment") == "fixed") Header.css("background-attachment", "scroll");
    }

    var Zones = $('div[id^="Zone"].Wrapper');
    if (Zones.length && isiOS)
    {
        var _zoneLen = Zones.length;
        for (i = 0; i < _zoneLen; i++)
        {
            if (Zones.eq(i).css("background-attachment") == "fixed") Zones.eq(i).css("background-attachment", "scroll");
        }
    }
    // -->            

    var OnDocumentMouseDown = function ()
    {
        window.MessagesHandler.SendDocumentMouseDown();
    };

    if (window.IsPreview)
    {
        window.MessagesHandler = new WS.Editor.Messages();
        window.MessagesHandler.SendPreviewQuery();
        $(document).on('mousedown', OnDocumentMouseDown);
    }

    // MOBILE
    if (window.WS.IsMobile)
    {
        if (window.IsPreview)
        {

            // Update the viewer scroll position and the editor scroll element when mousewheel detected
            $("body").on('mousewheel DOMMouseScroll', function (e)
            {
                var event = e.originalEvent;
                var scrollTop = $(this).scrollTop();

                if (scrollTop === 0)
                    scrollTop = $("html").scrollTop();

                e.stopPropagation();
                e.preventDefault();

                if (event.wheelDelta)
                {
                    delta = Math.round(event.wheelDelta / 120);
                }
                else if (event.type === "DOMMouseScroll")
                {
                    delta = Math.round(-event.detail / 3);
                }
                else
                {
                    delta = Math.round(-event.detail);
                }

                delta = Math.round(-delta * 100);
                scrollTop += delta;

                $(this).scrollTop(scrollTop);
                window.MessagesHandler.SendScrollPosition(scrollTop);
            });
        }

        var toolbarHeight = 0;
        var ToolBar = null;

        if (window.WS.MobileSettings.DisplayToolBar)
        {
            var toolBar = $("#ToolBar");
            ToolBar = new WS.Editor.ToolBar(toolBar);
            toolbarHeight = toolBar.height();
        }

        var ResizeWindow = function ()
        {
            if (window.WS.MobileSettings.DisplayToolBar)
            {
                ToolBar.Element.width($("#Background").width());

                if ($("#stickyFooter").length === 1)
                {
                    ToolBar.Element.css('bottom', $("#stickyFooter").height() + "px");
                }
            }

            $(window.AllItems).each(function ()
            {
                this.Resize();
            });

            if ($("#stickyFooter").length === 1)
            {
                var unusableSpace = toolbarHeight + $("#stickyFooter").height();
                $("#Background").css('padding-bottom', unusableSpace + "px");
            }
        }
        ResizeWindow();

        $(window).resize(function () { ResizeWindow(); });

    }

    // INTRO
    if (WS.Parameters.Others.Intro)
    {
        var Intro = $(".wsIntro");
        if (Intro.length > 0) $("body").css({ "overflow": "hidden" });

        var Quit = Intro.find("input[name=Quit]");
        Quit.on("click", function () { location.href = "http://www.google.com"; });

        var Enter = Intro.find("input[name=Enter]");
        Enter.on("click", function ()
        {
            $("body").css({ "overflow": "" });
            Intro.remove();
            document.cookie = "x-intro-viewed=1";
        });
        var Content = Intro.find(".wsContentWrapper");
        WS.IsMobile ? Content.css({ "font-size": "16px" }) : "";
    }

    // BUTTON UP
    if (WS.Parameters.Others.Button)
    {
        var Button = $(document.createElement("div"));

        Button.attr("class", "ToTop");
        Button.attr("alt", "Allez vers le haut");
        Button.css(
            {
                "width": "44px",
                "height": "42px",
                "background-color": "rgba(0,0,0,0.5)",
                "background-image": "url('/file/app/1/editor/icon/selector.svg?color1=r101g102b104')",
                "background-repeat": "no-repeat",
                "background-size": "contain",
                "transform": "rotate(180deg)",
                "-webkit-transform": "rotate(180deg)",
                "position": "fixed",
                "cursor": "pointer",
                "display": "none",
                "background-size": "30px 30px",
                "background-repeat": "repeat-y",
                'background-position': '7px 6px',
                "border-radius": "3px",
            });

        var bottom = 10;
        if ($("#stickyFooter").length > 0) bottom += $("#stickyFooter").height();

        if (window.WS.IsMobile)
        {
            if ($("#ToolBar").length > 0) bottom += $("#ToolBar").height();
        }
        Button.css('bottom', bottom + "px");

        if (WS.Parameters.Others.ButtonAlign == 1) { Button.css("right", "10px"); }
        else { Button.css("left", "10px"); }

        Button.on("click", function ()
        {
            $(document).scrollTop(0);
            if (window.IsPreview && window.WS.IsMobile)
            {
                window.MessagesHandler.SendScrollPosition(0);
            }
        });
        $("body").append(Button);

        $(window).scroll(function ()
        {
            if ($(document).scrollTop() >= 225) { Button.fadeIn(); }
            else { Button.fadeOut(); }
        });
    }

    // STORECART CHECK (DEFAULT)
    var _thanks = $(".Block.Type_WebStoreThanks").length > 0;
    if (!WS.StoreCart && !_thanks)
    {
        var HasCartContent = $(".Block.Type_WebStoreCart").length > 0;
        var HasCartInHeaderMobile = $("#HeaderContentZone .Block.Type_WebStoreCart").length > 0 && window.WS.IsMobile;

        var wbstid = null;
        var queryString = GetQueryString(location);
        var name = "wbst-id";

        if (queryString[name] && queryString[name].length > 0)
        {
            wbstid = window.decodeURIComponent(queryString[name]);
        }

        AjaxManager.Get("/Ext/Store/LoadCart", { Lang: pageData.lang, HasCartContent: HasCartContent, Flagged: pageData.flagged === true, IsMobile: window.WS.IsMobile, "wbst-id": wbstid, HasCartInHeaderMobile: HasCartInHeaderMobile }, function (data, elements)
        {
            if (!WS.StoreCart && elements.length > 0) WS.StoreCart = new WS.Store.Cart(elements[0]);
        });
    }

    // Parallax
    applyParallax(window.WS.ParallaxSelector);
});

var getBackgroundCSS = function (fromElement) {
    var element = $(fromElement);
    return {
        backgroundImage: element.css('background-image'),
        backgroundAttachment: element.css('background-attachment'),
        backgroundColor: element.css('background-color'),
        backgroundPosition: element.css('background-position'),
        backgroundRepeat: element.css('background-repeat'),
        backgroundSize: element.css('background-size')
    }
};

var applyParallax = function (querySelector) {

    if (!querySelector || typeof Rellax !== 'function') return;

    var layerStyle = {
        position: 'absolute',
        width: '100%',
        height: '120%'
    };

    $(querySelector).each(function (i, elem) {
        var bgLayer = $(elem);
        var parallaxLayer = $('<div class="bgParallaxLayer"></div>');

        parallaxLayer.css(layerStyle);
        parallaxLayer.css(getBackgroundCSS(bgLayer));

        bgLayer.append(parallaxLayer);
        bgLayer.addClass('wsParallax');

        new Rellax(parallaxLayer.get(0), {
            speed: -4,
            center: true
        });
    });
};

var onContentsLoaded = function ()
{
    var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (window.IsPreview && (isiOS || window.WS.IsMobile))
    {
        if (isiOS) window.MessagesHandler.SendDesktopPreviewHeight();
        else window.MessagesHandler.SendBackgroundHeight();
    }
};

var setAnchorLinks = function (element)
{
    var locationPath = location.pathname.replace(/^\//, '').replace(/\/$/, '');
    $(element).find('a[href]').filter(function ()
    {
        return this.hash.replace(/#/, '').length > 0
            && (!window.IsPreview && (locationPath == (this.pathname.replace(/^\//, '').replace(/\/$/, '') || locationPath)) || (window.IsPreview && (this.search == location.search)))
            && (location.hostname == this.hostname || this.hostname.length == 0);
    }).on('click', function (e)
    {
        var hash = this.hash;
        var anchorName = hash.slice(1); // Remove "#" from hash
        var anchorElement = $("[data-id='" + anchorName + "']");
        if (anchorElement.length > 0)
        {
            location.hash = hash;
            ScrollToElement(anchorElement);
            e.preventDefault();
        }
    });
};

// CONTENT LOADER
var ContentLoader = (function ()
{
    var contentsTemplate = {};

    // Constructor
    var _class = function (content, BeforeAppendHandler, AfterAppendHandler)
    {
        this.content = content;
        this.element = content.children(".Block_Wrapper");
        var type = content.attr("class").match(/Type_([^\s]*)/i)[1];
        var id = content.attr("id").replace("ct_", "");
        this.contentElement = null;
        this.contentObj = null;
        this._BeforeAppendHandler = BeforeAppendHandler;
        this._AfterAppendHandler = AfterAppendHandler;
        this.workingpush = false;

        var querystring = GetQueryString(location);

        var additionalQuery = null;
        var found = false;
        var i = 0;
        while (i < ContentLoader.DynamicTypes.length)
        {
            var query = ContentLoader.DynamicTypes[i];
            if (querystring[query] && querystring[query].length > 0)
            {
                found = true;
                additionalQuery = "&" + query + "=" + querystring[query];
            }
            i++;
        }

        var idxStatic = ContentLoader.staticTypes.indexOf(type);
        if (idxStatic == -1)
        {
            var Flagged = (pageData.flagged ? "&flagged=" : "");
            var PreviewID = (pageData.xkey ? "&previewid=" + pageData.xkey : "");
            var IsMobile = "&ismobile=" + window.WS.IsMobile.toString();
            var url = "/Ext/" + type + "/show?siteid=" + pageData.siteId + Flagged + PreviewID + IsMobile + (additionalQuery != null ? additionalQuery : "");
            AjaxManager.Get(url, { id: id, pageid: pageData.pageId, contentwidth: content.width(), contentheight: content.height(), isBot: false }, function (data, elements)
            {
                this.SetContentElement(elements[0]);
            }, null, this);
        }
        else
        {
            if (contentsTemplate[type]) this.SetContentElement($(contentsTemplate[type]));
        }
    };

    // Static methods
    (function (statics)
    {
        statics.staticTypes = ["Spacing"];
        statics.DynamicTypes = ["blogcategory", "blogtag", "blogarchives", "blogrss", "post", "webstorecategory", "product", "checkout_order", "wbst-id"];
    })(_class);

    // Public methods
    (function (methods)
    {
        methods.SetContentElement = function (element)
        {
            this.contentElement = element;
            if (this._BeforeAppendHandler && typeof this._BeforeAppendHandler === "function") this._BeforeAppendHandler();
            this.element.append(element);
            if (this._AfterAppendHandler && typeof this._AfterAppendHandler === "function") this._AfterAppendHandler();
            this.Update();

            window.setAnchorLinks(this.element);
            window.ContentLoadedCount++;
            if (window.ContentLoadedCount === window.ContentCount) onContentsLoaded();
        };

        methods.onLoaded = function (content)
        {
            var me = this;
            var INTERVAL_DOMREADY_CHECK = 8;

            // HANDLE WATCHDOG CONTENT
            var handleWatchDogContent = function (element)
            {
                if (!me.workingpush)
                {
                    me.workingpush = true;
                    var instance = new watchDogContent(element);
                    instance.push();
                    me.workingpush = false;
                }
                else
                {
                    window.setTimeout(function () { handleWatchDogContent(element); }, INTERVAL_DOMREADY_CHECK);
                }
            };

            this.contentObj = content;

            // DOM READY (content must implement onLoaded for dynamic resizing)
            if (this.contentObj.UnregisterEvent) { this.contentObj.UnregisterEvent("dom_ready"); }
            if (this.contentObj.RegisterEvent) { this.contentObj.RegisterEvent("dom_ready", function (element) { handleWatchDogContent(element); }); }
            this.Update();
        };

        methods.Update = function ()
        {
            if (this.contentElement && this.contentObj && this.contentObj.onResize) this.contentObj.onResize(this.element.width(), this.element.height());
            if (this.contentElement && this.contentObj && this.contentObj.onResized) this.contentObj.onResized(this.element.width(), this.element.height());
        };

    })(_class.prototype);

    return _class;
})();

// Pinterest
if (!window.WS) window.WS = {};
if (!window.WS.Util) window.WS.Util = {};
WS.Util.PinterestButton = function (Source, FileName, Position)
{
    // Validation
    if (!Source) throw "Source cannot be null.";
    if (!FileName) throw "FileName cannot be null.";
    if (!Position) Position = { x: 10, y: 10 };
    if (Position && (!Position.x || !Position.y)) throw "Position must have x,y";

    if (!window.location.origin) window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    var Page = encodeURI(window.location.href);
    var Media = encodeURI(window.location.origin + Source);
    var Description = encodeURI(FileName);
    var PinItURL = "https://www.pinterest.com/pin/create/button/?url=" + Page + "&media=" + Media + "&description=" + Description;

    var Link = $(document.createElement("a"));
    Link.attr("target", "_blank");
    Link.attr("href", PinItURL);

    var Pinterest = $(document.createElement("div"));
    var Pos = 0;
    var Width = 0;
    var Radius = 0;
    if (WS.Parameters.Social.PinterestColor == 1)
    {
        // White
        if (WS.Parameters.Social.PinterestShape == 1) { Width = 30; Pos = -30; }  // Cercle
        else { Width = 51; Pos = -112; Radius = 3; } // Rectangle
    }
    else
    {
        // Red
        if (WS.Parameters.Social.PinterestShape == 1) { Width = 30; Pos = 0; } // Cercle
        else { Width = 51; Pos = -60; Radius = 3; } // Rectangle
    }

    Pinterest.css({
        "background-image": "url(/file/app/1/editor/image/pinterest.png)",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "background-position": Pos + "px",
        "width": Width + "px",
        "height": "30px",
        "border-radius": Radius + "px"
    });
    Link.append(Pinterest);
    Link.css({ position: "absolute", top: Position.y, left: Position.x });

    return Link;
};

// PUSH ENGINE
var watchDogContent = (function ()
{
    var Rect = (function ()
    {
        var _class = function (x, y, width, height)
        {
            if (x === undefined) x = 0;
            if (y === undefined) y = 0;
            if (width === undefined) width = 1;
            if (height === undefined) height = 1;

            this.left = x;
            this.right = x + width - 1;
            this.top = y;
            this.bottom = y + height - 1;
        };

        (function (methods)
        {
            methods.getHeight = function ()
            {
                return this.bottom - this.top + 1;
            };

            methods.getOverlaps = function (rect)
            {
                var overlaps = { y: 0 };
                if (this.bottom >= rect.top) overlaps.y = this.bottom - rect.top + 1;

                return overlaps;
            };

        })(_class.prototype);

        return _class;
    })();

    var MARGIN_BOTTOM = 0;

    var _class = function (element)
    {
        if (!element || element.length == 0) throw "the element cannot be null.";

        this._internal = {};
        this._internal.element = element;
        this._internal.wrapper = element.closest(".Block");
        this._internal.zone = null;
        this._internal.contents = null;

        var zoneElement = element.closest(".Content_Zone");
        if (zoneElement && zoneElement.length > 0)
        {
            this._internal.zone = zoneElement;
            this._internal.contents = this._internal.zone.children(".Block");

            if (this._internal.contents && this._internal.contents.length > 0)
            {
                // sort the array from the upper rectangle to the lower
                this._internal.contents.sort(function (a, b) { return $(a).position().top - $(b).position().top; });
            }
        }
    };

    (function (methods)
    {
        methods.push = function ()
        {
            if (!this._internal.zone || !this._internal.contents) return;

            var container = this._internal.wrapper;
            if (!container.data("origin-height")) container.data("origin-height", container.height() + "px"); // origin height

            var origin_h = parseInt(container.data("origin-height"));
            var bloc_wrapper = container.children(".Block_Wrapper");
            var padding_h = bloc_wrapper.length > 0 ? bloc_wrapper.outerHeight(true) - bloc_wrapper.height() : 0;

            var insideElement = this._internal.element;
            var w = Math.round(insideElement.outerWidth());
            var h = Math.round(insideElement.outerHeight()) + padding_h;
            if (h < origin_h) h = origin_h; // min height set to origin if lower.

            if (!window.WS.IsMobile)
            {
                var rectInside = new Rect(container.position().left, container.position().top, w, h);
                if (insideElement.data("last-height") && insideElement.data("last-height") == rectInside.getHeight()) return; // if the inside rect height same, skip.

                // update last height for inside rect.
                insideElement.data("last-height", rectInside.getHeight());

                // find the last content (including current) in zone for margin calculation only.
                var last = getLastContent.apply(this);
                MARGIN_BOTTOM = this._internal.zone.height() - (last.position().top + last.height());

                // first content down
                var firstDown = getFirstContentBelow.call(this, container);
                var m = 0;
                var contentMoved = false;

                if (firstDown)
                {
                    // margin calculation
                    if (!firstDown.data("origin-margin"))
                    {
                        var data = getDeltaUp.call(this, firstDown);
                        firstDown.data("origin-margin", Math.abs(data.deltaY));
                    }

                    m = firstDown.data("origin-margin");

                    var fw = Math.round(firstDown.outerWidth());
                    var fh = Math.round(firstDown.outerHeight());
                    var rectFirst = new Rect(firstDown.position().left, firstDown.position().top - m, fw, fh);

                    // check if overlap in Y axis, if so, we push all contents below.
                    var overlap = rectInside.getOverlaps(rectFirst);
                    if (overlap.y > 0)
                    {
                        var deltaY = overlap.y;
                        moveContents.call(this, container, deltaY);
                        contentMoved = true;
                    }
                }

                // make container fit inside height
                container.css("height", rectInside.getHeight());

                if (firstDown && !contentMoved)
                {
                    var data = getDeltaUp.call(this, firstDown);
                    if (data && data.deltaY + m < 0) moveContents.call(this, data.element, data.deltaY + m);
                }

                // zone reset
                last = getLastContent.apply(this);
                var max_bottom = (last.position().top + last.height()) + MARGIN_BOTTOM;
                this._internal.zone.css("height", max_bottom);
            }
            else
            {
                this._internal.zone.css("height", "auto");
                container.css("height", h);
            }
        };

    })(_class.prototype);

    var getFirstContentBelow = function (currentElement)
    {
        if (!currentElement || currentElement.length == 0) throw "The currentElement cannot be null.";

        var content = null;

        var contents = this._internal.contents;
        var contentsLen = contents.length;
        for (var i = 0; i < contentsLen; i++)
        {
            var element = contents.eq(i);
            if (element[0] !== currentElement[0] && element.position().top >= (currentElement.position().top + currentElement.height()))
            {
                content = element;
                break;
            }
        }

        return content;
    };

    var getDeltaUp = function (currentElement)
    {
        if (!currentElement || currentElement.length == 0) throw "The currentElement cannot be null.";

        var refY = null;
        var refElement = null;

        var contents = this._internal.contents;
        var contentsLen = contents.length;
        var lastBottom = 0;
        for (var i = 0; i < contentsLen; i++)
        {
            var element = contents.eq(i);
            var bottom = element.position().top + element.height();
            if (element[0] !== currentElement[0] && bottom <= currentElement.position().top && bottom > lastBottom)
            {
                lastBottom = bottom;
                refY = lastBottom;
                refElement = element;
            }
        }

        return refY ? { deltaY: refY - currentElement.position().top, element: refElement } : null;
    };

    var getLastContent = function ()
    {
        var content = null;

        var maxBottom = 0;
        var contents = this._internal.contents;
        var contentsLen = contents.length;
        for (var i = 0; i < contentsLen; i++)
        {
            var element = contents.eq(i);
            var bottom = element.position().top + element.height();
            if (bottom > maxBottom)
            {
                content = element;
                maxBottom = bottom;
            }
        }

        return content;
    };

    var moveContents = function (originElement, deltaY)
    {
        if (!originElement || originElement.length == 0) throw "The element cannot be null.";

        var contents = this._internal.contents;
        var contentsLen = contents.length;
        if (contentsLen > 0)
        {
            var originTop = originElement.position().top;
            var originHeight = originElement.height();
            for (var i = 0; i < contentsLen; i++)
            {
                var element = contents.eq(i);
                var top = element.position().top;
                if (top >= originTop + originHeight) element.css("top", top + deltaY);
            }
        }
    };

    return _class;
})();