(function($){
    var pluginName = 'nestedTimeline';

    function Plugin(element,options){
        this.$ele = element;
        this.options = $.extend({}, $.fn[pluginName].defaults,options);
        //this.buildTemplate();
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
            var self = this,
                selectedOuterNode,selectedInnerNode;
            self.buildTemplate();
/*            var self = this,
                selectedOuterNode = this.$ele.find(".list > ol > li.selected"),
                selectedInnerNode;


            self.outerNodeList = self.$ele.find(".list > ol >li");

            if(!selectedOuterNode.length){
                selectedOuterNode = $(self.outerNodeList[0]);
            }

            selectedInnerNode = selectedOuterNode.find("a.selected");
            if(!selectedInnerNode.length){
                selectedInnerNode = $(selectedOuterNode.find("a")[0]);
            }
            resetListItems(self.outerNodeList);

            selectedOuterNode.addClass("selected");
            selectedInnerNode.addClass("selected");
            selectedOuterNode.append("<div class='active'>"+selectedInnerNode.data('content')+"</div");*/

            selectedOuterNode = self.$ele.find(".list ol li.selected");
            selectedInnerNode = selectedOuterNode.find("li a.selected");
            selectedOuterNode.append("<div class='active'>"+selectedInnerNode.data('content')+"</div");
            self.totalContentWidth = 0;
            self.$ele.find(".list > ol >li").each(function(){
                self.totalContentWidth = self.totalContentWidth + $(this).outerWidth();
            });
            self.containerWidth = self.$ele.find(".list ol").width();
            self.attachEvents();
        },
        buildTemplate: function(){
            var self = this,
                template = $("<section class='ns-horizontal-timeline'><div class='timeline'> <div class='list-wrapper'> <div class='list'></div></div></section>"),
                outerList = $("<ol></ol>");

            self.options.data.forEach(function(outerNode){
                var innerList = $("<ul></ul>");
                outerNode.list.forEach(function(innerNode){
                    var anchorNode = $("<a href='#0'></a>");
                    anchorNode.addClass(self.options.states[innerNode.state].name).data('content',innerNode.name);
                    if(innerNode.selected){
                        anchorNode.addClass("selected");
                    }
                    $("<li></li>").append(anchorNode).appendTo(innerList);
                });
                $("<li class="+ ((outerNode.selected)?'selected':'') +"><div>"+outerNode.name+"</div></li>").append(innerList).appendTo(outerList);
            });

            template.find(".list").append(outerList);
            //append navigation buttons
            template.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev'>Prev</a></li> <li><a href='#0' class='next'>Next</a></li></ul>");
            console.log(template.html());
            template.appendTo(self.$ele);
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
                            translationValue = self.containerWidth -currentTranslateValue - contentWidthTillPrevOfSelected;
                        }else{
                            translationValue = -currentTranslateValue;
                        }
                        self.$ele.find(".list ol").css("transform", "translateX(" + (currentTranslateValue + translationValue) + "px)");
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
                    if((widthFromOriginTillSelected+ self.$ele.find("ol > li.selected").next().outerWidth()) > self.containerWidth) {
                        if ((self.totalContentWidth + currentTranslateValue - self.containerWidth) > widthFromOriginTillSelected) {
                            translation = widthFromOriginTillSelected;
                        } else {
                            translation = (self.totalContentWidth + currentTranslateValue - self.containerWidth);
                        }
                        console.log("translation", translation);
                        self.$ele.find(".list ol").css("transform", "translateX(" + (currentTranslateValue - translation) + "px)");
                    }
                    self.$ele.find("ol > li.selected > div.active").remove();
                    self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                    self.$ele.find("ol > li.selected").removeClass("selected").next().addClass("selected").append("<div class='active'>"+self.$ele.find("ol > li.selected a").data('content')+"</div");
                    $(self.$ele.find("ol > li.selected a")[0]).addClass("selected");
                }
            });

            self.$ele.find(".list ol").on("click","a",function(event){
                event.preventDefault();
                $(event.delegateTarget).find("li.selected a.selected").removeClass("selected");
                $(event.delegateTarget).find("li.selected div.active").html($(event.target).addClass("selected").data("content"));
            })
        }
    };
    $.fn[pluginName] = function(options){
        return this.each(function(){
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,new Plugin( $(this), options ));
            }
        });
    };
    $.fn[pluginName].defaults =
        {
            "states":
                [
                    {
                        "name": "default",
                        "css":
                            {
                                "background-color": "white"
                            }
                    }
                ]
        };
})(jQuery);