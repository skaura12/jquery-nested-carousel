;(function($){
    var pluginName = 'nestedTimeline';

    function Plugin(element,options){
        this.$ele = element;
        this.options = $.extend({}, $.fn[pluginName].defaults,options);
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

    Plugin.prototype = {
        init: function(){
            var self = this,
                selectedOuterNode,selectedInnerNode;
            self._buildTemplate();
            self._setNameContainerMaxWidth()
            var sheet = (function() {
                var style = document.createElement("style");
                document.head.appendChild(style);
                return style.sheet;
            })();
            self.options.states.forEach(function(state){
                var rules = "{";
                for(key in state.css){
                    rules += key + ":"+state.css[key] + ";";
                }
                rules += "}";
                sheet.insertRule(".ns-horizontal-timeline ."+ state.name +":after "+rules,0);
            });

            selectedOuterNode = self.$ele.find(".list ol li.selected");
            selectedInnerNode = selectedOuterNode.find("li a.selected");
            selectedOuterNode.find("div.active > p").text(selectedInnerNode.data('content'));
            self.totalContentWidth = 0;
            self.$ele.find(".list > ol >li").each(function(){
                self.totalContentWidth = self.totalContentWidth + $(this).outerWidth();
            });
            self.containerWidth = self.$ele.find(".list").outerWidth();
            self._attachEvents();
            self._updateSlider();
            self._updateSelectedContainerWidth();
        },
        _buildTemplate: function(){
            //readability
            var self = this,
                template = $("<section class='ns-horizontal-timeline'><div class='timeline'> <div class='list-wrapper'> <div class='list'><div class='selected'></div></div></div></section>"),
                outerList = $("<ol></ol>");

            self.options.data.forEach(function(outerNode){
                var innerList = $("<ul></ul>");
                outerNode.list.forEach(function(innerNode){
                    var anchorNode = $("<a href='#0'></a>");
                    anchorNode.data("content", (innerNode.name)?(innerNode.name):"").attr("data-id", innerNode.id);
                    anchorNode.addClass(self.options.states[innerNode.state].name);
                    if(innerNode.selected){
                        anchorNode.addClass("selected");
                    }
                    $("<li></li>").append(anchorNode).appendTo(innerList);
                });
                $("<li class="+ ((outerNode.selected)?'selected':'') +"><div class='outer-list-name'><p>"+outerNode.name+"</p></div></li>").append(innerList).append("<div class='inner-selected-name active'><p></p></div>").appendTo(outerList);
            });

            template.find(".list").append(outerList);
            //append navigation buttons
            template.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev'>Prev</a></li> <li><a href='#0' class='next'>Next</a></li></ul>");
            console.log(template.html());
            template.appendTo(self.$ele);
        },
        _attachEvents: function(){
            var self = this;

            self.$ele.find(".ns-timeline-navigation a.prev").on("click",function(event){
                event.preventDefault();
                if(self.$ele.find("ol > li.selected").prev().length){
                    self.$ele.find("ol > li.selected > div.active > p").text("");
                    self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                    self.$ele.find("ol > li.selected").removeClass("selected").prev().addClass("selected").find("div.active > p").text(self.$ele.find("ol > li.selected a").data('content'));
                    $(self.$ele.find("ol > li.selected a")[0]).addClass("selected");
                    self._updateSlider();
                    self._updateSelectedContainerWidth();
                }
            });

            self.$ele.find(".ns-timeline-navigation a.next").on("click",function(){
                event.preventDefault();
                if(self.$ele.find("ol > li.selected").next().length){

                    self.$ele.find("ol > li.selected > div.active > p").text("");
                    self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                    self.$ele.find("ol > li.selected").removeClass("selected").next().addClass("selected").find("div.active > p").text(self.$ele.find("ol > li.selected a").data('content'));
                    $(self.$ele.find("ol > li.selected a")[0]).addClass("selected");
                    self._updateSlider();
                    self._updateSelectedContainerWidth();
                }
            });

            self.$ele.find(".list ol").on("click","a",function(event){
                var wrapperListItem = $(event.target).closest("ol > li");
                event.preventDefault();
                self.$ele.find("ol > li.selected > div.active > p").text("");
                self.$ele.find("ol > li.selected a.selected").removeClass("selected");
                if(!wrapperListItem.hasClass("selected")){
                    self.$ele.find("ol > li.selected").removeClass("selected");
                    wrapperListItem.addClass("selected");

                }
                $(event.delegateTarget).find("li.selected div.active > p").text($(event.target).addClass("selected").data("content"));
                self._updateSlider();
                self._updateSelectedContainerWidth();
            })

        },
        _updateSlider: function(){
            var self=this,
                destinationXOffset,
                sourceXOffset,
                currentTranslateValue,
                translation;

            destinationXOffset = self.$ele.find(".list").offset().left + self.containerWidth/2 - self.$ele.find("ol > li.selected").outerWidth()/2;
            sourceXOffset = self.$ele.find("ol li.selected").offset().left;
            translation = destinationXOffset - sourceXOffset;
            currentTranslateValue = getTranslateValue(self.$ele.find(".list ol"));
            self.$ele.find(".list ol").css("transform", "translateX(" + (currentTranslateValue +     translation) + "px)");
        },
        _updateSelectedContainerWidth: function(){
            var self = this;
            if(parseInt(self.$ele.find(".list > .selected").css("min-width")) < self.$ele.find("ol > li.selected").outerWidth()){
                self.$ele.find(".list > .selected").width(self.$ele.find("ol > li.selected").outerWidth());
            }else{
                self.$ele.find(".list > .selected").css("width","");
            }
        },
        _setNameContainerMaxWidth: function(){
            var self = this,
                outerList = self.$ele.find(".list ol > li");
            outerList.each(function(){
                var innerListWidth = 0,outerNode = $(this);
                outerNode.find("ul > li").each(function(){
                    var innerNode = $(this);
                    innerListWidth += innerNode.outerWidth();
                });
                if(innerListWidth > 200){
                    outerNode.find(".outer-list-name").css("max-width",innerListWidth);
                    outerNode.find(".inner-selected-name").css("max-width",innerListWidth);
                }else{
                    outerNode.find(".outer-list-name").css("max-width",200);
                    outerNode.find(".inner-selected-name").css("max-width",200);
                }
            })
        },
        changeState: function(nodeData){
            var self = this,
                $node = self.$ele.find(".list a[data-id='"+nodeData.id+"']");

            //reset node -- remove all state classes
            self.options.states.forEach(function(state){
                $node.removeClass(state.name);
            });
            $node.addClass(self.options.states[nodeData.state].name);
        },
        destroy: function(){
            this.$ele.empty();
            $.data(this.$ele, 'plugin_' + pluginName, null);
        }
    };
    $.fn[pluginName] = function(options){
        var args = arguments;
        if(options == undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
                }
            });
        }else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            });

            return returns !== undefined ? returns : this;
        }
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