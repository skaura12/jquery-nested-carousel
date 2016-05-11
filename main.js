(function($){
    var defaults = {};

    $.fn.nestedTimeline = function(options){
        var settings = $.extend({},defaults,options);
        this.each(function(){
            loadTimeline($(this));
        });

        function loadTimeline(timelineWrapper){
            var totalContentWidth =  0;
            timelineWrapper.find(".list > ol > li").each(function(){
                totalContentWidth += $(this).outerWidth();
            });

            console.log(totalContentWidth);
            timelineWrapper.find(".ns-timeline-navigation a.prev").on("click",function(){
                if(timelineWrapper.find("ol > li.selected").prev().length){
                    timelineWrapper.find("ol > li.selected").removeClass("selected").prev().addClass("selected");


                }
            });

            timelineWrapper.find(".ns-timeline-navigation a.next").on("click",function(){
                var contentWidthTillSelectedListItem = 0,translation,currentTranslateValue,translateValue,widthFromOriginTillSelected,containerWidth;

                if(timelineWrapper.find("ol > li.selected").next().length){
                    timelineWrapper.find(".list > ol > li").each(function(){
                        contentWidthTillSelectedListItem += $(this).outerWidth();
                        if($(this).hasClass("selected")){
                            return false;
                        }
                    });
                    containerWidth = timelineWrapper.find(".list ol").width();
                    translateValue = timelineWrapper.find(".list ol").css("transform");
                    if( translateValue.indexOf('(') >=0 ) {
                        translateValue = translateValue.split('(')[1];
                        translateValue = translateValue.split(')')[0];
                        translateValue = translateValue.split(',');
                        currentTranslateValue = Number(translateValue[4]);
                    } else {
                        currentTranslateValue = 0;
                    }
                    console.log("contentWidthTillSelectedListItem",contentWidthTillSelectedListItem);
                    console.log("currentTranslateValue",currentTranslateValue);

                    widthFromOriginTillSelected = contentWidthTillSelectedListItem + currentTranslateValue;
                    if((widthFromOriginTillSelected+ timelineWrapper.find("ol > li.selected").next().outerWidth()) > containerWidth) {
                        if ((totalContentWidth - containerWidth) > widthFromOriginTillSelected) {
                            translation = widthFromOriginTillSelected;
                        } else {
                            translation = (totalContentWidth - containerWidth);
                        }
                        console.log("translation", translation);
                        $(".list ol").css("transform", "translateX(" + (currentTranslateValue - translation) + "px)");
                    }
                    timelineWrapper.find("ol > li.selected").removeClass("selected").next().addClass("selected");


                }


            });
        }

    };






})(jQuery);