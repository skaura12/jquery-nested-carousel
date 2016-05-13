(function($){
    var pluginName = 'nestedTimeline';

    function Plugin(element,options){
        this.$ele = element;
        this.options = $.extend({}, $.fn.defaults,options);
        this.init();
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

    Plugin.prototype = {
        init: function(){
            var selectedOuterNode = this.$ele.find(".list > ol > li.selected"),
                selectedInnerNode;

            this.outerNodeList = this.$ele.find(".list > ol >li");

            if(!selectedOuterNode.length){
                selectedOuterNode = $(this.outerNodeList[0]);
            }

            selectedInnerNode = selectedOuterNode.find("a.selected");
            if(!selectedInnerNode.length){
                selectedInnerNode = $(selectedOuterNode.find("a")[0]);
            }
            resetListItems(this.outerNodeList);

            selectedOuterNode.addClass("selected");
            selectedInnerNode.addClass("selected");
            selectedOuterNode.append("<div class='active'>"+selectedInnerNode.data('content')+"</div");
            this.totalContentWidth = 0;
            this.$ele.find(".list > ol >li").each(function(){
                this.totalContentWidth += $(this).outerWidth();
            });
            this.containerWidth = this.$ele.find(".list ol").width();
            this.attachEvents();
        },
        attachEvents: function(){
            var self = this;

            self.$ele.find(".ns-timeline-navigation a.prev").on("click",function(){
                var currentTranslateValue,contentWidthTillSelectedListItem = 0,contentWidthTillPrevOfSelected,translationValue;
                if(self.$ele.find("ol > li.selected").prev().length){

                    currentTranslateValue = getTranslateValue(self.$ele.find(".list ol"));

                    self.$ele.find(".list > ol > li").each(function(){
                        contentWidthTillSelectedListItem += $(this).outerWidth();
                        if($(this).hasClass("selected")){
                            return false;
                        }
                    });
                    contentWidthTillPrevOfSelected = contentWidthTillSelectedListItem - self.$ele.find("ol > li.selected").outerWidth();

                    if((contentWidthTillPrevOfSelected + currentTranslateValue) < self.$ele.find("ol > li.selected").prev().outerWidth()){
                        //translation required
                        if( (self.containerWidth -currentTranslateValue - contentWidthTillPrevOfSelected) < contentWidthTillPrevOfSelected){
                            translationValue = containerWidth -currentTranslateValue - contentWidthTillPrevOfSelected;
                        }else{
                            translationValue = -currentTranslateValue;
                        }
                        $(".list ol").css("transform", "translateX(" + (currentTranslateValue + translationValue) + "px)");
                    }
                    self.$ele.find("ol > li.selected > div.active").remove();
                    self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                    self.$ele.find("ol > li.selected").removeClass("selected").prev().addClass("selected").append("<div class='active'>"+self.$ele.find("ol > li.selected a").data('content')+"</div");
                    $(self.$ele.find("ol > li.selected a")[0]).addClass("selected");

                }
            });

            self.$ele.find(".ns-timeline-navigation a.next").on("click",function(){
                var contentWidthTillSelectedListItem = 0,translation,currentTranslateValue,translateValue,widthFromOriginTillSelected;

                if(self.$ele.find("ol > li.selected").next().length){
                    self.$ele.find(".list > ol > li").each(function(){
                        contentWidthTillSelectedListItem += $(this).outerWidth();
                        if($(this).hasClass("selected")){
                            return false;
                        }
                    });
                    currentTranslateValue = getTranslateValue(self.$ele.find(".list ol"));
                    widthFromOriginTillSelected = contentWidthTillSelectedListItem + currentTranslateValue;
                    if((widthFromOriginTillSelected+ self.$ele.find("ol > li.selected").next().outerWidth()) > containerWidth) {
                        if ((self.totalContentWidth + currentTranslateValue - containerWidth) > widthFromOriginTillSelected) {
                            translation = widthFromOriginTillSelected;
                        } else {
                            translation = (self.totalContentWidth + currentTranslateValue - containerWidth);
                        }
                        console.log("translation", translation);
                        $(".list ol").css("transform", "translateX(" + (currentTranslateValue - translation) + "px)");
                    }
                    self.$ele.find("ol > li.selected > div.active").remove();
                    self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                    self.$ele.find("ol > li.selected").removeClass("selected").next().addClass("selected").append("<div class='active'>"+self.$ele.find("ol > li.selected a").data('content')+"</div");
                    $(self.$ele.find("ol > li.selected a")[0]).addClass("selected");
                }
            });

            self.$ele.find(".list ol").on("click","a",function(event){
                console.log(event);
                event.preventDefault();
                $(event.delegateTarget).find("li.selected a.selected").removeClass("selected");
                $(event.delegateTarget).find("li.selected div.active").html($(event.target).addClass("selected").data("content"));
            })
        }
    };
    $.fn[pluginName].defaults = {};
    $.fn[pluginName] = function(options){
        var settings = $.extend({},defaults,options);
        return this.each(function(){
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,new Plugin( $(this), options ));
            }
        });
    };
})(jQuery);