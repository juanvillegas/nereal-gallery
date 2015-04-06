; (function ($, window, document, undefined) {

    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "nerealGallery",
        defaults = {
            prevNav: '<a href="#" class="nav nav-prev">Prev</a>',
            nextNav: '<a href="#" class="nav nav-next">Next</a>',
            breakpoints: {
                mobile: 740,
                tablet: 940
            },
            click_offset_left: 100,
            click_offset_right: 100
        };

    // The actual plugin constructor
    function Gallery(element, options) {
        this.element = element;
        this.$element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.instance_settings = {};

        this.groups_count = 0;

        this.init();
    }

    // Avoid Gallery.prototype conflicts
    $.extend(Gallery.prototype, {
        init: function () {
            this.$element.addClass("nereal");

            this.setup_once();

            this.sort_images();

            this.start_slideshow();
        },
        start_slideshow: function() {
            var $this = this;

            if ($this.instance_settings.slides.find(".current").length == 0) {
                $this.instance_settings.slides.find(".group_1").fadeIn();
                $this.$element.find(".group_1").addClass("current");
            }
        },
        /**
         * This method should be called only once on initialization. Sets up a few things that are required
         * for the plugin. (global events, navigation, cache some elements)
         */
        setup_once: function() {
            var $this = this,
                $next,
                $prev;

            // listen for resize
            $(window).on("resize", function() {
                $this.handle_window_resize($this);
            });

            // create navigation
            $next = $($this.settings.nextNav);
            $prev = $($this.settings.prevNav);

            $this.$element.append($prev);
            $this.$element.append($next);

            $this.setup_navigation();

            // cache some elements
            $this.instance_settings.slides = $this.$element.find(".slides");
            if ($this.instance_settings.slides.length == 0) {
                console.log("Nereal: no slides found.");
            }
        },

        /**
         * Callback to be invoked every time the screen is resized
         * @param $context Should always be a reference to the plugin instance.
         */
        handle_window_resize: function($context) {
            var window_width = $(window).width(),
                old_breakpoint = $context.instance_settings.breakpoint,
                new_breakpoint;

            // detect what kind of device context we are in.
            if (window_width > $context.settings.breakpoints.tablet) {
                new_breakpoint = "desktop";
            } else if (window_width > $context.settings.breakpoints.mobile) {
                new_breakpoint = "tablet";
            } else {
                new_breakpoint = "mobile";
            }
            $context.instance_settings.breakpoint = new_breakpoint;

            $context.instance_settings.window_width = window_width;

            // has the context changed?
            if (old_breakpoint != new_breakpoint) {
                // if so, trigger specific per context actions here
                $context.sort_images();
                $context.start_slideshow();

                if (new_breakpoint != "mobile") {
                    // we are going to tablet/desktop mode, so stop setting the height
                    // manually, and leave it to css instead.
                    $context.$element.css("height", "");
                }
            }
        },

        setup_navigation: function() {
            var $this = this;

            $this.$element.find(".nav-next").on("click", function(e){
                $this.handle_next_nav($this, e);
            });
            $this.$element.find(".nav-prev").on("click", function (e) {
                $this.handle_prev_nav($this, e);
            });

            this.$element.find(".slides").on("click", function (e) {
                var left;
                    //top;

                if (e.offsetX != undefined && e.offsetY != undefined) {
                    left = e.offsetX;
                    //top = e.offsetY;
                } else {
                    left = e.pageX - $(this).offset().left;
                    //top = e.pageY - $(this).offset().top;
                }

                if (left <= $this.settings.click_offset_left) {
                    $this.handle_prev_nav($this, e);
                } else {
                    $this.handle_next_nav($this, e);
                }
            });
        },

        handle_slide_changed: function() {
            var current_slide = this.instance_settings.slides.find(".current"),
                current_slide_height;

            if (this.instance_settings.breakpoint == 'mobile') {
                current_slide_height = current_slide.children("img").height();
                this.$element.height(current_slide_height);
            }
        },

        handle_next_nav: function($context, e) {
            var current_group = $context.$element.find(".current").first().data("group");

            if ($context.groups_count == current_group) {
                current_group = 1;
            } else {
                current_group++;
            }

            $context.$element.find(".current").removeClass("current").fadeOut(500, function() {
                $context.$element.find(".group_" + current_group).fadeIn(500, function() {
                    $(this).addClass("current");
                });

                $context.handle_slide_changed();
            });

            e.preventDefault();
        },

        handle_prev_nav: function($context, e){
            var current_group = $context.$element.find(".current").first().data("group");

            if (current_group == 1) {
                current_group = $context.groups_count;
            } else {
                current_group--;
            }

            $context.$element.find(".current").removeClass("current").fadeOut(500, function() {
                $context.$element.find(".group_" + current_group).fadeIn(500, function() {
                    $(this).addClass("current");
                });

                $context.handle_slide_changed();
            });

            e.preventDefault();
        },

        sort_images: function () {
            var cursor,
                next_sibling,
                group_count = 0;

            cursor = this.instance_settings.slides.children().first();

            // asign the groups_count
            do {
                group_count++;

                next_sibling = cursor.next();
                this._clear_group(cursor, next_sibling);
                cursor = this._set_group(cursor, next_sibling, group_count);
            } while (cursor != false);

            this.groups_count = group_count;
        },

        /**
         * Clears all the classes added to the slides by the plugin
         * @param cursor the current item
         * @param next the next item
         * @private
         */
        _clear_group: function(cursor, next) {
            var allClasses = ["alone", "sidebyside"],
                i;

            // clear all groups
            for (i = 1; i <= this.groups_count; i++) {
                allClasses.push("group_" + i);
            }

            cursor.removeClass(allClasses.join(" "));
            next.removeClass(allClasses.join(" "));
        },
        /**
         * Set the appropiate group and classes to given slide and its next sibling
         * @param current the current cursor
         * @param next the next sibling
         * @param group_id the current group id
         * @returns bool\elem the next element to consider
         * @private
         */
        _set_group: function (current, next, group_id) {
            var next_sibling;
            if (this.instance_settings.breakpoint == "mobile") {
                // set one per group for mobile..
                current.addClass("alone group_" + group_id);
                current.data("group", group_id);
                next_sibling = next;
            } else {
                if (current.hasClass("landscape")) {
                    // L case => landscape images go alone
                    current.addClass("group_" + group_id);
                    current.data("group", group_id);
                    next_sibling = next;
                } else if (next.hasClass("landscape")) {
                    // P + L case => result is a portrait alone
                    current.addClass("alone group_" + group_id);
                    current.data("group", group_id);
                    // ...?
                    next_sibling = next;
                } else {
                    // P + P case => portraits side by side
                    current.addClass("sidebyside group_" + group_id);
                    current.data("group", group_id);
                    next.addClass("sidebyside group_" + group_id);
                    next.data("group", group_id);
                    next_sibling = next.next();
                }
            }

            if (next_sibling.length == 0) {
                return false;
            } else {
                return next_sibling;
            }

        }
    });

    $.fn[ pluginName ] = function ( options, arg ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Gallery( this, options ) );
            } else {
                // the instance exists, call a method?
                var instance = $.data( this, "plugin_" + pluginName);

                instance[options].apply(this, [arg]);
            }
        });
    };

})( jQuery, window, document );

/**
 * 1. parameters:
 *  -> object called: the object containing the <img>'s
 * 2. go through the images and assign the corresponding group_x/left/right classes according to their .portrait / .landscape statuses.
 * 3. grab .group_1 and display
 * 4. configure the animations
 *  4.1 should there be next/prev navigation arrows
 *  4.2 should allow automatic scroll
 *  4.3 should allow different animation effects (opacity, slide, etc)
 * */


jQuery(document).ready(function($) {
    $(".nereal").nerealGallery();
});