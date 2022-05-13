﻿var windowLarg = 0;
var scrollbarWidth = "";


$(function () {

    AnimInMotion = false;

    windowLarg = $(window).width();

    var CreateBtn = $("#stickyFooter [name=createSF]");
    var firstnameInp = $("#stickyFooter [name=prenomSF]");
    var lastnameInp = $("#stickyFooter [name=nomSF]");
    var emailInp = $("#stickyFooter [name=emailSF]");
    var passwordInp = $("#stickyFooter [name=motPasseSF]");

    CreateBtn.on("click", function (event) {

        var firstname = firstnameInp.val();
        var lastname = lastnameInp.val();
        var email = emailInp.val();
        var password = passwordInp.val();

        if (firstname == "" || firstname.length < 3) $("#stickyFooter [name=prenomSF]").addClass("invalid").attr("placeholder", _FooterAdTrads["PH_Prenom"]);
        else if (lastname == "" || lastname.length < 3) $("#stickyFooter [name=nomSF]").addClass("invalid").attr("placeholder", _FooterAdTrads["PH_Nom"]);
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) $("#stickyFooter [name=emailSF]").addClass("invalid").attr("placeholder", _FooterAdTrads["PH_Email"]);
        else if (password.length < 4) $("#stickyFooter [name=motPasseSF]").addClass("invalid").attr("placeholder", _FooterAdTrads["PH_Pass"]);
        else {         
            AjaxManager.Post("/Ext/FooterAds", { FirstName: firstname, LastName: lastname, Email: email, Password: password, Lang : CreateBtn.attr("data-lang") }, function (data) {
                // TODO Show errors if any
            });
        }
    });

    $("#stickyFooter input").on("focus", function () {
        $(this).removeClass("invalid");
    });

    $('#defaultSF').mouseup(function (e) {
        var container = $(".linkSF");

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            toogleFooter();
        }
    });

    $(document).keypress(function(e) {
            if(e.which == 13) {
                CreateBtn.click();
            }
      });

    // Create the measurement node
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbarMeasure";
    document.body.appendChild(scrollDiv);

    // Get the scrollbar width
    scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
});

function FermerFooter(footer) {
    var footer = footer;

    AnimInMotion = true;

    $('#titleSF').text('');
    $('#titleSF').css({ "top": "70px" });

    $('.sectionSF').css({ "padding-top": "13" });

    $('#secondarySF').css({ "top": "72px" });

    $('#formSF').css({ "top": "115px" });

    $('#leftSF').css({ "width": "35%" });
    $('#centreSF').css({ "width": "30%" });
    $('#rightSF').css({ "opacity": "0", "width": "35%" });

    $('#rightSF').append(_FooterAdTrads["Footer_Ad_Create"]);
    $('#rightSF').velocity({ 'opacity': 1 }, 550);

    $('#chevronSF').css({ 'transform': '' });
    $('#chevronSF').velocity({ right: $("#defaultSF").width() / 2 - $("#chevronSF").width() / 2 }, 550);

    $('#hiddenSF').css({ "display": "none" })

    if ($(window).width() < 400) {
        footer.velocity({ "height": "60px" }, 550, function () {
            $(footer).removeClass("open");
            AnimInMotion = false;
        });
    }
    else {
        footer.velocity({ "height": "40px" }, 550, function () {
            $(footer).removeClass("open");
            AnimInMotion = false;
        });
    }
}

function OuvrirFooter(footer) {
    var footer = footer;

    AnimInMotion = true;

    $('#hiddenSF').css({ "display": "block" });

    $('#titleSF').text(_FooterAdTrads["Footer_Ad_Text"]);

    $('.sectionSF').css({ "paddingBottom": "0", "padding-top": "20" });

    $('#leftSF').css({ "width": "20%" });
    $('#centreSF').css({ "width": "60%" });
    $('#rightSF').css({ "width": "20%" });

    $('#rightSF').text('');

    $('#chevronSF').css({ 'transform': 'none' });
    $('#chevronSF').velocity({ "right": "20px" }, 550);

    if ($(window).width() < (535 - scrollbarWidth)) {
        $('#titleSF').velocity({ "top": "-=40px" }, 500);
        $('#secondarySF').velocity({ "top": "-=40px" }, 700);
        $('#formSF').velocity({ "top": "-=10px" }, 900, function () {
            AnimInMotion = false;
        });
        footer.velocity({ "height": "375px" }, 550, function () {
            $(footer).addClass("open");
        });
    }

    else if ($(window).width() < (1003 - scrollbarWidth)) {
        $('#secondarySF').velocity({ "top": "-=40px" }, 700);
        $('#formSF').velocity({ "top": "-=30px" }, 900, function () {
            AnimInMotion = false;
        });
        footer.velocity({ "height": "270px" }, 550, function () {
            $(footer).addClass("open");
        });
        $('#titleSF').velocity({ "top": "-=50px" }, 500);
    }

    else {
        $('#formSF').velocity({ "top": "-=60px" }, 900, function () {
            AnimInMotion = false;
        });
        $('#secondarySF').velocity({ "top": "-=60px" }, 700);
        footer.velocity({ "height": "160px" }, 550, function () {
            $(footer).addClass("open");
        });
        $('#titleSF').velocity({ "top": "-=50px" }, 500);
    }
}

function toogleFooter() {

    var footer = $("#stickyFooter");

    if (!AnimInMotion) {
        if (footer.hasClass("open")) {
            FermerFooter(footer);
        }
        else {
            OuvrirFooter(footer);
        }
    }
};

$(window).resize(function () {
    var footer = $("#stickyFooter");

    if (!footer.hasClass("open")) {
        if (windowLarg != $(window).width()) {
            $('#chevronSF').css({ 'right': $("#defaultSF").width() / 2 - $("#chevronSF").width() / 2 }, 500);
        };
    } else {
        if ($(window).width() < (535 - scrollbarWidth)) {
            footer.css({ "height": "375px" });
            $('#secondarySF').css({ "top": "32px" });
            $('#formSF').css({ "top": "105px" });
        }
        else if ($(window).width() < (1003 - scrollbarWidth)) {
            footer.css({ "height": "270px" });
            $('#secondarySF').css({ "top": "32px" });
            $('#formSF').css({ "top": "85px" });
        }
        else {
            footer.css({ "height": "160px" });
            $('#secondarySF').css({ "top": "12px" });
            $('#formSF').css({ "top": "55px" });
        }
    }
});