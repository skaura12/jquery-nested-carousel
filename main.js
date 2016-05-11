(function($){
    var defaults = {};

    $.fn.nestedTimeline = function(options){
        var settings = $.extend({},defaults,options);
        this.each(function(){
            loadTimeline($(this));
        });

        function loadTimeline(timelineWrapper){
            var outerNodeCollection = timelineWrapper.find("ol > li");

            timelineWrapper.find(".ns-timeline-navigation a.prev").on("click",function(){
                if(timelineWrapper.find("ol > li.selected").prev().length){
                    timelineWrapper.find("ol > li.selected").removeClass("selected").prev().addClass("selected");

                }
            });

            timelineWrapper.find(".ns-timeline-navigation a.next").on("click",function(){
                timelineWrapper.find("ol > li.selected").removeClass("selected").next().addClass("selected");
            });


            updateOuterNodeWidth(outerNodeCollection);
        }

        function updateOuterNodeWidth(listCollection) {
            listCollection.each(function(){
                var innerNodeCount  = $(this).find("a").length;
                console.log(innerNodeCount);
            })
        }
    };






})(jQuery);