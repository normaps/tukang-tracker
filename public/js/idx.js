(function($) {
    "use strict";
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });
    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })
})(jQuery);