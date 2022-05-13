﻿
WS.Namespace.Create('WS.Editor.Text.UI', (function () {
    // Constructor(s)
    var Class = function (control, element) {
        // Validation
        if (!control) throw "control is null";
        if (!element) throw "element is null";

        this.control = control;
        this.element = element;
  
        if (window.WS && window.WS.IsMobile && this.control.content && this.control.content.length > 0 && $(this.control.content[0]).hasClass("Block")) {
            $(this.control.content[0]).css("height", "auto").addClass("wsMobile");
        }

        // EVENT (DOM READY FOR PUSHING ENGINE)
        WS.EventObject.call(this, ["dom_ready"]);       
             
        if (control.onLoaded) control.onLoaded(this);
    };

    WS.Exts.Inherits(Class, WS.EventObject);

    // Public Method(s)
    (function (Methods) {

        Methods.onResized = function (width, height) {

        };

        Methods.onResize = function (width, height) {

        };

    })(Class.prototype);

    return Class;
})());