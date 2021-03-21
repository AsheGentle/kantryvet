$(function(){
    $("a[href*='#']").on("click", function(){
        var offsetTop;
        if ($(document).width() > 1023) {
            offsetTop = $(".header-bottom").outerHeight();
        } else {
            offsetTop = $(".header-top").outerHeight();
        }

        $("html, body").animate({
            scrollTop: $($.attr(this, 'href')).offset().top - offsetTop
        }, 1000);
        return false;
    });


    $(".contacts__tab-item").on("click", function(){
        var dataTab = $(this).data("tab");
        $(".contacts__tab-item").removeClass("active");
        $(this).addClass("active");
        $(".contacts__content").removeClass("active");
        $(".contacts__content[data-tab='" + dataTab + "']").addClass("active");
    });


    $(".shedule__month-selected").on("click", function(){
        $(".shedule__month-list").toggleClass("open");
    });


    $(".header-phone__toggle").on("click", function(){
        $(".header-phone").toggleClass("open");
    });


    $(".open-phone").on("click", function(){
        $(".header-phone__position").addClass("open");
    });
    $(".header-phone").on("click", function(){
        $(".header-phone__position").removeClass("open");
    });


    $("body").on("click", function(e){
        if ($(".shedule__month-list").hasClass("open")) {
            var div = $(".shedule__month-list");
            if (!div.is(e.target)
                    && !$(".shedule__month-selected").is(e.target)
                    && div.has(e.target).length === 0) {
                div.removeClass("open");
            }
        }
        if ($(".header-phone").hasClass("open")) {
            var div = $(".header-phone");
            if (!div.is(e.target)
                    && !$(".header-phone__toggle").is(e.target)
                    && div.has(e.target).length === 0) {
                div.removeClass("open");
            }
        }
    });


    $(".header-office__link").on("click", function(){
        var thisScroll = $(this).data("scroll");

        $(".contacts__tab-item").removeClass("active");
        $(".contacts__tab-item[data-tab='" + thisScroll + "']").addClass("active");
        $(".contacts__content").removeClass("active");
        $(".contacts__content[data-tab='" + thisScroll + "']").addClass("active");

        $("html, body").animate({
            scrollTop: $(".section-map").offset().top - $(".header-bottom").outerHeight()
        }, 1000);
    });


    $(".shedule-mobile__filter").on("click", function(){
        $(".mobile-filter").addClass("open");
    });
    $(".mobile-filter__close").on("click", function(){
        $(".mobile-filter").removeClass("open");
    });
    $(".mobile-filter-submit").on("click", function(){
        $(".mobile-filter").removeClass("open");
    });


    $(".shedule__body").mCustomScrollbar({
        theme: "dark-3",
        scrollButtons: {enable: true}
    });


    $(".menu-mobile").on("click", function(){
        $(".header-bottom").addClass("open");
    });

    $(".menu-mobile-close").on("click", function(){
        $(".header-bottom").removeClass("open");
    });

    $(".header-bottom a[href*='#']").on("click", function(){
        $(".header-bottom").removeClass("open");
    });




    if ($(".showcase").length > 0) {
        $(".showcase").slick({
            arrows: false,
            dots: true
        });
    }


    $(".gallery__list .btn").on("click", function(){
        $(".gallery__item").show();
        $(this).hide();
    });


    if ($(".doctor__slider").length > 0) {
        $(".doctor__slider").slick({
            slidesToShow: 4,
            slidesToScroll: 4,
            arrows: true,
            dots: true,
            appendArrows: '.doctor__nav',
            appendDots: '.doctor__nav',
            responsive: [
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        dots: false
                    }
                },
                {
                    breakpoint: 700,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        dots: false
                    }
                },
                {
                    breakpoint: 470,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: false
                    }
                }
            ]
        });
    }

    /*if ($(".shedule__days-list").length > 0) {
     $(".shedule__days-list").slick({
     infinite: false,
     asNavFor: '.shedule__list'
     });
     }
     
     if ($(".shedule__list").length > 0) {
     $(".shedule__list").slick({
     infinite: false,
     arrows: false,
     asNavFor: '.shedule__days-list'
     });
     }*/

    if ($(".reviews__list").length > 0) {
        $(".reviews__list").slick();
    }


    var fixedRow = $("header");
    var fixedPosition = $(".header-bottom");
    var fixedTopPos = fixedPosition.offset().top;
    var fixedHeight = fixedPosition.outerHeight();
    $(window).scroll(function(){
        if ($(this).scrollTop() > 0) {
            fixedRow.addClass("scroll");
        } else {
            fixedRow.removeClass("scroll");
        }
        if ($(document).width() > 1023) {
            if ($(this).scrollTop() >= fixedTopPos) {
                fixedRow.addClass("fixed");
                fixedRow.css("padding-bottom", fixedHeight);
            } else {
                fixedRow.removeClass("fixed");
                fixedRow.css("padding-bottom", 0);
            }
        }
    });

    if ($(this).scrollTop() > 0) {
        fixedRow.addClass("scroll");
    } else {
        fixedRow.removeClass("scroll");
    }
    if ($(document).width() > 1023) {
        if ($(window).scrollTop() >= fixedTopPos) {
            fixedRow.addClass("fixed");
            fixedRow.css("padding-bottom", fixedHeight);
        } else {
            fixedRow.removeClass("fixed");
            fixedRow.css("padding-bottom", 0);
        }
    }

    /*
     $(".btn-up").on("click", function () {
     $("html, body").animate({
     scrollTop: 0
     }, 1000);
     return false;
     });
     if ($(window).scrollTop() > 480) {
     $(".btn-up").addClass("show");
     } else {
     $(".btn-up").removeClass("show");
     }
     $(window).scroll(function () {
     if ($(this).scrollTop() > 480) {
     $(".btn-up").addClass("show");
     } else {
     $(".btn-up").removeClass("show");
     }
     });
     
     
     $("[data-modal]").on("click", function(){
     var modalId = $(this).data("modal");
     $(".modal").removeClass("open");
     $(modalId).addClass("open");
     $("body").addClass("overflow");
     });
     $(".modal__close").on("click", function(){
     $(this).parents(".modal").removeClass("open");
     $("body").removeClass("overflow");
     });
     $(".modal").on("click", function(e){
     var div = $(this).find(".modal__content");
     if (!div.is(e.target) && div.has(e.target).length === 0) {
     $(this).removeClass("open");
     $("body").removeClass("overflow");
     }
     });
     
     if ($(document).width() > 1001) {
     
     } else {
     
     }
     
     
     */
});
