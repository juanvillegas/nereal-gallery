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
        defaults = {};

    // The actual plugin constructor
    function Gallery(element, options) {
        this.element = element;
        this.$element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Gallery.prototype conflicts
    $.extend(Gallery.prototype, {
        init: function () {
            var $e = this.$element;

            this.$element.addClass("nereal");

            this.sort_images();

            this.$element.find(".group_1").addClass("current");

            // temp navigation
            this.$element.on("click", function (e) {
                var current_class = $e.find(".current").first().data("group");
                current_class++;

                $e.find(".current").removeClass("current").fadeOut(500, function(){
                    $e.find(".group_" + current_class).addClass("current").fadeIn();
                })
            });
        },
        sort_images: function () {
            var cursor,
                next_sibling,
                group_id = 1;

            cursor = this.$element.children("div").first();

            // asign the groups
            do {
                next_sibling = cursor.next();
                cursor = this._set_group(cursor, next_sibling, group_id);

                group_id++;
            } while (cursor != false);

        },
        _set_group: function (current, next, group_id) {
            if (current.hasClass("landscape")) {
                // L case => landscape images go alone
                current.addClass("group_" + group_id);
                current.data("group", group_id);
                return next;
            } else if (next.hasClass("landscape")) {
                // P + L case => result is a portrait alone
                current.addClass("group_" + group_id);
                current.data("group", group_id);
                // ...?
                return next;
            } else {
                // P + P case => portraits side by side
                current.addClass("group_" + group_id);
                current.data("group", group_id);
                next.addClass("group_" + group_id);
                next.data("group", group_id);

                var next_sibling = next.next();
                if (next_sibling.length == 0) {
                    return false;
                } else {
                    return next_sibling;
                }
            }
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
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