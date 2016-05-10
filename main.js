(function($){
    var defaults = {
        innerNodeDistance: 20,
        outerNodeDistance: 50
    };

    $.fn.nestedTimeline = function(options){
        var settings = $.extend({},defaults,options);
        return this.each(function(){
            loadTimeline(this);
        });

        function loadTimeline(timelineWrapper){
            timelineWrapper.find("ol > li").each(function(){

            });
        }
    };






})(jQuery);