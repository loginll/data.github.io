﻿
WS.Namespace.Create('WS.Content.Image', (function ()
{
    var Class = function (element, control, data)
    {
        if (!element) throw "element is null";
        if (!control) throw "control is null";
        if (!data) throw "data is null";

        this.element = element;
        this.HtmlElement = {};
        this.HtmlElement.Img = this.element.find("img");

        this.data = data;
        this.width = null;
        this.height = null;

        // For Editor Implement
        if (control.onLoaded) control.onLoaded(this);
    };

    // PRIVATE

    var setImgDimensions = function (width, height)
    {
        this.HtmlElement.Img.css({ "width": parseInt(width) + "px", "height": parseInt(height) + "px" });
    };

    var setImgSrc = function (width)
    {
        var Width = (this.imgWidth && typeof this.imgWidth === "number") ? this.imgWidth : width;
        var src = "/file/si1141695/" + this.data.Media.FileName + "-fi" + this.data.Media.IdFile + "x" + parseInt(Width) + "." + this.data.Media.Extension;
        this.HtmlElement.Img.attr("src", src);
    };

    var CenterCover = function (width, height)
    {
        // Validation
        if (!width || typeof width != "number" || width < 0) throw "bad width!";
        if ((!height && height != 0) || typeof height != "number" || height < 0) throw "bad height!";

        // center image cover
        var WidthOri = this.data.Media.WidthOri;
        var HeightOri = this.data.Media.HeightOri;
        var imgWidth = 0;
        var imgHeight = 0;

        if (WidthOri > HeightOri) {
            // width base
            if (WidthOri / HeightOri < width / height) {
                imgWidth = width;
                imgHeight = parseInt(HeightOri) * parseInt(width) / parseInt(WidthOri);
            }
            else {
                imgWidth = parseInt(WidthOri) * parseInt(height) / parseInt(HeightOri);
                imgHeight = height;
            }
        }
        else {
            // height base
            if (HeightOri / WidthOri < height / width) {
                imgWidth = parseInt(WidthOri) * parseInt(height) / parseInt(HeightOri);
                imgHeight = height;
            }
            else {
                imgWidth = width;
                imgHeight = parseInt(HeightOri) * parseInt(width) / parseInt(WidthOri);
            }
        }

        // Positionning...
        var left = (width - imgWidth) / 2;
        var top = (height - imgHeight) / 2;
        this.HtmlElement.Img.css({ "left": Math.round(parseInt(left)) + "px", "top": Math.round(parseInt(top)) + "px" });

        // Dimensions With Src...
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        setImgDimensions.call(this, imgWidth, imgHeight);
    };

    var CropInsideBox = function (width, height)
    {
        // Validation
        if (!width || typeof width != "number" || width < 0) throw "bad width!";
        if ((!height && height != 0) || typeof height != "number" || height < 0) throw "bad height!";

        var Me = this;

        var Crop = this.data.Media.Crop;
        if (Crop == null) throw "crop must exist!";
        var WidthOri = this.data.Media.WidthOri;
        var HeightOri = this.data.Media.HeightOri;
        var imgWidth = 0;
        var imgHeight = 0;

        // X1,Y1 X2,Y2
        var x1 = parseFloat(Crop.Position.X1) / 100 * width;
        var x2 = parseFloat(Crop.Position.X2) / 100 * width;
        var y1 = parseFloat(Crop.Position.Y1) / 100 * height;
        var y2 = parseFloat(Crop.Position.Y2) / 100 * height;

        function WidthBased()
        {
            imgWidth = (WidthOri * (y2 - y1) / HeightOri);
            imgHeight = y2 - y1;
        }

        function HeightBased()
        {
            imgWidth = x2 - x1;
            imgHeight = (HeightOri * (x2 - x1) / WidthOri);
        }

        if (WidthOri > HeightOri) {
            // width base
            if (((WidthOri * (y2 - y1) / HeightOri)) <= (x2 - x1)) WidthBased();
            else HeightBased();
        }
        else {
            // height base
            if (((HeightOri * (x2 - x1) / WidthOri)) <= (y2 - y1)) HeightBased();
            else WidthBased();
        }

        var top = Math.round(y1);
        var right = Math.round(width - x2);
        var bottom = Math.round(height - y2);
        var left = Math.round(x1);

        if (top < bottom) this.HtmlElement.Img.css("top", parseInt(top) + "px");
        else this.HtmlElement.Img.css("bottom", parseInt(bottom) + "px");

        if (right < left) this.HtmlElement.Img.css("right", parseInt(right) + "px");
        else this.HtmlElement.Img.css("left", parseInt(left) + "px");

        // Dimensions With Src...
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        setImgDimensions.call(this, imgWidth, imgHeight);
    };

    var CropInsideOutSideBox = function (width, height)
    {
        // Validation
        if (!width || typeof width != "number" || width < 0) throw "bad width!";
        if ((!height && height != 0) || typeof height != "number" || height < 0) throw "bad height!";

        var Me = this;

        var Crop = this.data.Media.Crop;
        if (Crop == null) throw "crop must exist!";
        var WidthOri = this.data.Media.WidthOri;
        var HeightOri = this.data.Media.HeightOri;
        var imgWidth = 0;
        var imgHeight = 0;
        var x1 = parseFloat(Crop.Position.X1) / 100;
        var x2 = parseFloat(Crop.Position.X2) / 100;
        var y1 = parseFloat(Crop.Position.Y1) / 100;
        var y2 = parseFloat(Crop.Position.Y2) / 100;

        function WidthBased()
        {
            imgWidth = width / (x2 - x1);
            imgHeight = imgWidth * (HeightOri / WidthOri);

            var p = y1 * height;
            var a = y2 * height;
            var b = a - p;
            p += b / 2;
            p -= imgHeight / 2;
            Me.HtmlElement.Img.css({ "left": parseInt((-x1 * imgWidth)) + "px", "top": Math.round(parseInt(p)) + "px" });
        }

        function HeightBased()
        {
            imgHeight = height / (y2 - y1);
            imgWidth = imgHeight * (WidthOri / HeightOri);

            var p = x1 * width;
            var a = x2 * width;
            var b = a - p;
            p += b / 2;
            p -= imgWidth / 2;
            Me.HtmlElement.Img.css({ "left": Math.round(parseInt(p)) + "px", "top": parseInt((-y1 * imgHeight)) + "px" });
        }
        if (parseInt(Crop.Width) >= parseInt(Crop.WrapperWidth)) {
            // width base
            WidthBased();
        }
        else {
            // height base
            HeightBased();
        }

        // Dimensions With Src...
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        setImgDimensions.call(this, imgWidth, imgHeight);
    };

    var CropCover = function (width, height)
    {
        // Validation
        if (!width || typeof width != "number" || width < 0) throw "bad width!";
        if ((!height && height != 0) || typeof height != "number" || height < 0) throw "bad height!";

        var Me = this;

        var Crop = this.data.Media.Crop;
        if (Crop == null) throw "crop must exist!";
        var WidthOri = this.data.Media.WidthOri;
        var HeightOri = this.data.Media.HeightOri;
        var imgWidth = 0;
        var imgHeight = 0;
        var x1 = parseFloat(Crop.Position.X1) / 100;
        var x2 = parseFloat(Crop.Position.X2) / 100;
        var y1 = parseFloat(Crop.Position.Y1) / 100;
        var y2 = parseFloat(Crop.Position.Y2) / 100;

        function WidthBased()
        {
            imgWidth = width / (x2 - x1);
            imgHeight = imgWidth * (HeightOri / WidthOri);

            var p = y1 * imgHeight;
            var a = y2 * imgHeight;
            var b = a - p;
            if (b >= height) {
                b = b - height;
                p += b / 2;
                Me.HtmlElement.Img.css({ "left": parseInt((-x1 * imgWidth)) + "px", "top": Math.round(parseInt(-p)) + "px" });
            }
            else {

                imgHeight = height / (y2 - y1);
                imgWidth = imgHeight * (WidthOri / HeightOri);

                var p = x1 * imgWidth;
                var a = x2 * imgWidth;
                var b = a - p;
                b = b - width;
                p += b / 2;
                Me.HtmlElement.Img.css({ "left": Math.round(parseInt(-p)) + "px", "top": parseInt((-y1 * imgHeight)) + "px" });
            }
        }

        function HeightBased()
        {
            imgHeight = height / (y2 - y1);
            imgWidth = imgHeight * (WidthOri / HeightOri);

            var p = x1 * imgWidth;
            var a = x2 * imgWidth;
            var b = a - p;
            if (b >= width) {
                b = b - width;
                p += b / 2;
                Me.HtmlElement.Img.css({ "left": Math.round(parseInt(-p)) + "px", "top": parseInt((-y1 * imgHeight)) + "px" });
            }
            else {
                imgWidth = width / (x2 - x1);
                imgHeight = imgWidth * (HeightOri / WidthOri);

                var p = y1 * imgHeight;
                var a = y2 * imgHeight;
                var b = a - p;

                b = b - height;
                p += b / 2;
                Me.HtmlElement.Img.css({ "left": parseInt((-x1 * imgWidth)) + "px", "top": Math.round(parseInt(-p)) + "px" });
            }
        }

        if (WidthOri > HeightOri) {
            // width base
            if (WidthOri / HeightOri < width / height) WidthBased();
            else HeightBased();
        }
        else {
            // height base
            if (HeightOri / WidthOri < height / width) HeightBased();
            else WidthBased();
        }

        // Dimensions With Src...
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        setImgDimensions.call(this, imgWidth, imgHeight);
    };

    var BindImage = function (width, height)
    {
        if (!width || typeof width != "number" || width < 0) throw "bad width!";
        if ((!height && height != 0) || typeof height != "number" || height < 0) throw "bad height!";

        var WidthOri = this.data.Media.WidthOri;
        var HeightOri = this.data.Media.HeightOri;

        var Crop = this.data.Media.Crop;
        if (Crop == null) throw "crop must exist!";

        // reset position
        this.HtmlElement.Img.css({ "width": "", "height": "", "left": "", "top": "", "bottom": "", "right": "" });

        // No Crop, Positionnning
        if (!this.data.KeepRatio) {

            this.imgWidth = null;
            if (!this.HtmlElement.Img.hasClass("wsStrech")) this.HtmlElement.Img.addClass("wsStrech");
        }
        else {
            if (!Crop.Position) {
                // center image cover (image bigger than box)
                CenterCover.call(this, width, height);
            }
            else {
                // Zoom
                if (parseInt(Crop.Width) >= parseInt(Crop.WrapperWidth) && parseInt(Crop.Height) >= parseInt(Crop.WrapperHeight)) {
                    CropCover.call(this, width, height);
                }
                else if (parseInt(Crop.Width) < parseInt(Crop.WrapperWidth) && parseInt(Crop.Height) < parseInt(Crop.WrapperHeight)) {
                    CropInsideBox.call(this, width, height);
                }
                else {
                    CropInsideOutSideBox.call(this, width, height);
                }
            }
        }

        // Lightbox
        if (this.data.ShowLightBox && !this.LightBox) AddLightBoxHandler.apply(this);

        // Caption
        if (this.data.Media.Caption) {
            if (this.Caption) { this.Caption.Bind(); }
            else { this.Caption = new WS.CaptionManager.UI(this.HtmlElement.Img, this.element, this.data.Media.Caption); }
        }

        // Pinterest
        if (WS.Util && WS.Util.PinterestButton && WS.Parameters && WS.Parameters.Social && WS.Parameters.Social.Pinterest) Pinterest.apply(this);
    };

    var AddLightBoxHandler = function ()
    {
        var Me = this;

        var Image = [];
        var src = "/file/si1141695/" + this.data.Media.FileName + "-fi" + this.data.Media.IdFile + "x2000." + this.data.Media.Extension;
        var Footer = null;
        if ((this.data.Media.Caption && this.data.Media.Caption.Aff == "LightBoxAndImage") || this.data.Media.Link) {
            Footer = { title: null, descr: null, link: null };
            if (this.data.Media.Caption) {
                Footer.title = (this.data.Media.Caption.Title) ? this.data.Media.Caption.Title : null;
                Footer.descr = (this.data.Media.Caption.Descr) ? this.data.Media.Caption.Descr : null;
            }
            if (this.data.Media.Link) Footer.link = { href: this.data.Media.Link.Href, text: this.data.Media.Link.Href };
        }

        Image.push(
            {
                src: src,
                footer: Footer
            });

        this.LightBox = new WS.LightBox(Image);
        this.HtmlElement.Img.off("click");
        this.HtmlElement.Img.on("click", function () { Me.LightBox.Show(); });
        this.HtmlElement.Img.addClass("wsPointer");
    };

    var Pinterest = function ()
    {
        var Me = this;

        if (this.PinterestButton) this.PinterestButton.remove();
        var src = "/file/si1141695/" + Me.data.Media.FileName + "-fi" + Me.data.Media.IdFile + "." + Me.data.Media.Extension;
        this.PinterestButton = WS.Util.PinterestButton(src, Me.data.Media.FileName);
        this.PinterestButton.hide();
        this.element.append(this.PinterestButton);

        var TimeWait = 10;
        var TimeOut = null;
        this.PinterestButton.on("mouseenter", function ()
        {
            Me.HtmlElement.Img.trigger("mouseenter");
        });

        this.PinterestButton.on("mouseleave", function ()
        {
            Me.HtmlElement.Img.trigger("mouseleave");
        });

        this.HtmlElement.Img.on("mouseenter", function ()
        {
            window.clearTimeout(TimeOut);
            Me.PinterestButton.show();
        });

        this.HtmlElement.Img.on("mouseleave", function ()
        {
            window.clearTimeout(TimeOut);
            TimeOut = window.setTimeout(function () { Me.PinterestButton.hide() }, TimeWait);
        });
    };

    // PUBLIC

    (function (Methods)
    {
        Methods.onResized = function (width, height)
        {
            this.width = width;
            this.height = height;
            setImgSrc.call(this, width);
        };

        Methods.onResize = function (width, height)
        {
            this.width = width;
            this.height = height;
            BindImage.call(this, width, height);
        };

        Methods.Update = function (data)
        {
            this.data = data;
            BindImage.call(this, this.width, this.height);
            setImgSrc.call(this, this.width);
        }

    })(Class.prototype);

    return Class;
})());