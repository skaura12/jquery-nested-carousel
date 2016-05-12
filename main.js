(function($){
    var defaults = {};

    $.fn.nestedTimeline = function(options){
        var settings = $.extend({},defaults,options);
        this.each(function(){
            loadTimeline($(this));
        });

        function loadTimeline(timelineWrapper){
            var totalContentWidth = 0,containerWidth,
                timelineComponents = {},
                selectedOuterNode = timelineWrapper.find(".list > ol > li.selected"),
                selectedInnerNode;

            timelineComponents["outerNodeList"] = timelineWrapper.find(".list > ol >li");

            if(!selectedOuterNode.length){
                selectedOuterNode = $(timelineComponents["outerNodeList"][0]);
            }

            selectedInnerNode = selectedOuterNode.find("a.selected");
            if(!selectedInnerNode.length){
                selectedInnerNode = $(selectedOuterNode.find("a")[0]);
            }
            resetListItems(timelineComponents["outerNodeList"]);

            selectedOuterNode.addClass("selected");
            selectedInnerNode.addClass("selected");
            selectedOuterNode.append("<div class='active'>"+selectedInnerNode.data('content')+"</div");

            timelineComponents["outerNodeList"].each(function(){
                totalContentWidth += $(this).outerWidth();
            });
            containerWidth = timelineWrapper.find(".list ol").width();


            console.log(totalContentWidth);
            timelineWrapper.find(".ns-timeline-navigation a.prev").on("click",function(){
                var currentTranslateValue,contentWidthTillSelectedListItem = 0,contentWidthTillPrevOfSelected,translationValue;
                if(timelineWrapper.find("ol > li.selected").prev().length){

                    currentTranslateValue = getTranslateValue(timelineWrapper.find(".list ol"));

                    timelineWrapper.find(".list > ol > li").each(function(){
                        contentWidthTillSelectedListItem += $(this).outerWidth();
                        if($(this).hasClass("selected")){
                            return false;
                        }
                    });
                    contentWidthTillPrevOfSelected = contentWidthTillSelectedListItem - timelineWrapper.find("ol > li.selected").outerWidth();

                    if((contentWidthTillPrevOfSelected + currentTranslateValue) < timelineWrapper.find("ol > li.selected").prev().outerWidth()){
                        //translation required
                        if( (containerWidth -currentTranslateValue - contentWidthTillPrevOfSelected) < contentWidthTillPrevOfSelected){
                            translationValue = containerWidth -currentTranslateValue - contentWidthTillPrevOfSelected;
                        }else{
                            translationValue = -currentTranslateValue;
                        }
                        $(".list ol").css("transform", "translateX(" + (currentTranslateValue + translationValue) + "px)");
                    }
                    timelineWrapper.find("ol > li.selected > div.active").remove();
                    timelineWrapper.find("ol > li.selected a.selected").removeClass("selected");
                    timelineWrapper.find("ol > li.selected").removeClass("selected").prev().addClass("selected").append("<div class='active'>"+timelineWrapper.find("ol > li.selected a").data('content')+"</div");
                    $(timelineWrapper.find("ol > li.selected a")[0]).addClass("selected");

                }
            });

            timelineWrapper.find(".ns-timeline-navigation a.next").on("click",function(){
                var contentWidthTillSelectedListItem = 0,translation,currentTranslateValue,translateValue,widthFromOriginTillSelected;

                if(timelineWrapper.find("ol > li.selected").next().length){
                    timelineWrapper.find(".list > ol > li").each(function(){
                        contentWidthTillSelectedListItem += $(this).outerWidth();
                        if($(this).hasClass("selected")){
                            return false;
                        }
                    });
                    currentTranslateValue = getTranslateValue(timelineWrapper.find(".list ol"));

                    console.log("contentWidthTillSelectedListItem",contentWidthTillSelectedListItem);
                    console.log("currentTranslateValue",currentTranslateValue);

                    widthFromOriginTillSelected = contentWidthTillSelectedListItem + currentTranslateValue;
                    if((widthFromOriginTillSelected+ timelineWrapper.find("ol > li.selected").next().outerWidth()) > containerWidth) {
                        if ((totalContentWidth + currentTranslateValue - containerWidth) > widthFromOriginTillSelected) {
                            translation = widthFromOriginTillSelected;
                        } else {
                            translation = (totalContentWidth + currentTranslateValue - containerWidth);
                        }
                        console.log("translation", translation);
                        $(".list ol").css("transform", "translateX(" + (currentTranslateValue - translation) + "px)");
                    }
                    timelineWrapper.find("ol > li.selected > div.active").remove();
                    timelineWrapper.find("ol > li.selected a.selected").removeClass("selected");
                    timelineWrapper.find("ol > li.selected").removeClass("selected").next().addClass("selected").append("<div class='active'>"+timelineWrapper.find("ol > li.selected a").data('content')+"</div");
                    $(timelineWrapper.find("ol > li.selected a")[0]).addClass("selected");
                }
            });

            timelineWrapper.find(".list ol").on("click","a",function(event){
                console.log(event);
                event.preventDefault();
                $(event.delegateTarget).find("li.selected a.selected").removeClass("selected");
                $(event.delegateTarget).find("li.selected div.active").html($(event.target).addClass("selected").data("content"));
            })
        }

        function getTranslateValue(obj){
            var translateValue,currentTranslateValue;

            translateValue = obj.css("transform");

            if( translateValue.indexOf('(') >=0 ) {
                translateValue = translateValue.split('(')[1];
                translateValue = translateValue.split(')')[0];
                translateValue = translateValue.split(',');
                currentTranslateValue = Number(translateValue[4]);
            } else {
                currentTranslateValue = 0;
            }

            return currentTranslateValue;
        }

        function resetListItems(listCollection){
            listCollection.each(function () {
                $(this).removeClass("selected");
                $(this).find("a").removeClass("selected");
                $(this).find("div.active").remove();
            })
        }

    };






})(jQuery);