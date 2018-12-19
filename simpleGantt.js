"use strict";

(function ($, m, factory) {
    'use strict';

    $.fn.extend({
        simpleGantt = function(){
            return factory();
        }
    });

})($, moment, function () {
    
    function log(message){
        console.log(message);
    }

    log('Creating the simpleGantt');

    var target = $(this);
    if(target){
        target.innerHtml = 'Foo bar';
    }

});
