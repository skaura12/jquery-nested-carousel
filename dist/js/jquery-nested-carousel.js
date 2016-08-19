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
            if(self.options.mode === "nested"){
                self._setNameContainerWidth();
            }
            self.$ele.find(".ns-horizontal-timeline").addClass(self.options.mode+"-mode");
            selectedOuterNode = self.$ele.find(".list .outer-node.selected");
            selectedOuterNode.addClass("center");
            selectedInnerNode = selectedOuterNode.find(".inner-node.selected");
            selectedOuterNode.find("div.active").attr("title",selectedInnerNode.find("a").data('content'));
            selectedOuterNode.find("div.active > p").text(selectedInnerNode.find("a").data('content'));
            self.totalContentWidth = 0;
            self.$ele.find(".list > ol >li").each(function(){
                self.totalContentWidth = self.totalContentWidth + $(this).outerWidth();
            });
            self.containerWidth = self.$ele.find(".list").outerWidth();
            self._attachEvents();
            self._updateSlider();
        },
        _buildTemplate: function(){
            //readability
            var self = this,
                template = $("<section class='nested-mode ns-horizontal-timeline'><div class='timeline'> <div class='list-wrapper'> <div class='list'></div></div></section>"),
                outerList = $("<ol class='outer-nodes-container'></ol>");

            self.options.data.forEach(function(outerNode){
                var innerList = $("<ul class='inner-nodes-container'></ul>");
                outerNode.list.forEach(function(innerNode){
                    var anchorNode = $("<a href='#0'></a>");
                    anchorNode.attr("title",(innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"");
                    anchorNode.data("content", (innerNode.name)?(innerNode.name):"").attr("data-id", innerNode.id);
                    anchorNode.addClass("state-"+innerNode.state);
                    $("<li class='inner-node "+((innerNode.selected)?'selected':'')+"'></li>").append(anchorNode).appendTo(innerList);
                });
                $("<li class='outer-node "+ ((outerNode.selected)?'selected':'') +"' data-id='"+outerNode.id+"' data-name='"+outerNode.name+"'><div class='outer-list-name'><p>"+outerNode.name+"</p></div></li>").append(innerList).append("<div class='inner-selected-name active'><p></p></div>").appendTo(outerList);
            });

            template.find(".list").append(outerList);
            //append navigation buttons
            template.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev' title='Previous'>Prev</a><i class='fa fa-arrow-circle-left move-left' aria-hidden='true'></i></li> <li><a href='#0' class='next' title='Next'>Next</a><i class='move-right fa fa-arrow-circle-right' aria-hidden='true'></i></li></ul>");
            template.appendTo(self.$ele);
        },
        _attachEvents: function(){
            var self = this;
            self.$ele.find(".ns-timeline-navigation .move-right").on("click",function(event){
                if(self.$ele.find(".outer-node.center").next().length){
                    self.$ele.find(".outer-node.center").removeClass("center").next().addClass("center");
                    self._updateSlider();
                }
            });

            self.$ele.find(".ns-timeline-navigation .move-left").on("click",function(event){
                if(self.$ele.find(".outer-node.center").prev().length){
                    self.$ele.find(".outer-node.center").removeClass("center").prev().addClass("center");
                    self._updateSlider();
                }
            });


            self.$ele.find(".ns-timeline-navigation a.prev").on("click",function(event){
                event.preventDefault();
                if(self.$ele.find(".outer-node.selected .inner-node.selected").prev().length){
                    self.$ele.find(".outer-node.selected .inner-node.selected").prev().find("a").trigger("click");
                }else if(self.$ele.find(".outer-node.selected").prev().length){
                    self.$ele.find(".outer-node.selected").prev().find(".inner-node").last().find("a").trigger("click");
                }
            });

            self.$ele.find(".ns-timeline-navigation a.next").on("click",function(event){
                event.preventDefault();
                if(self.$ele.find(".outer-node.selected .inner-node.selected").next().length){
                    self.$ele.find(".outer-node.selected .inner-node.selected").next().find("a").trigger("click");
                }else if(self.$ele.find(".outer-node.selected").next().length){
                    self.$ele.find(".outer-node.selected").next().find(".inner-node").first().find("a").trigger("click");
                }
            });

            self.$ele.find(".list .outer-nodes-container").on("click",".outer-node:not('.selected')",function(event){
                $($(event.currentTarget).find(".inner-node a")[0]).trigger("click");
            });

            self.$ele.find(".list .inner-nodes-container").on("click","a",function(event){
                var innerSelectedName;
                event.preventDefault();
                var wrapperListItem = $(event.target).closest(".outer-node"),innerNodeName;
                self.$ele.find(".outer-node.selected > div.active > p").text("");
                self.$ele.find(".outer-node.selected .inner-node.selected").removeClass("selected");
                if(!wrapperListItem.hasClass("selected")){
                    //when wrapper list item is not selected
                    self.$ele.find(".outer-node.selected").removeClass("selected");
                    wrapperListItem.addClass("selected");
                }
                if(!wrapperListItem.hasClass("center")){
                    self.$ele.find(".outer-node.center").removeClass("center");
                    wrapperListItem.addClass("center");
                    if(self.options.mode === "nested"){
                        self._updateSlider();
                    }
                }
                innerNodeName = $(event.target).data("content");
                $(event.target).parent().addClass("selected");
                wrapperListItem.find("div.active").attr("title",innerNodeName).find("p").text(innerNodeName);
                if(self.options.mode === "flattened" && !$(event.target).data("content").length){
                    wrapperListItem.find("div.active > p").text(wrapperListItem.data("name"));
                }
                self._updateNavigationButtonState();
                if(typeof self.options.nodeSwitchCallback === "function") {
                    self.options.nodeSwitchCallback({
                        id: self.$ele.find(".outer-node.selected").data("id"),
                        name: self.$ele.find(".outer-node.selected").data("name"),
                        nestedNode: {
                            id: self.$ele.find(".outer-node.selected .inner-node.selected a").data("id"),
                            name: self.$ele.find(".outer-node.selected .inner-node.selected a").data("content")
                        }
                    });
                }
                event.stopPropagation();
            });

            $(window).on("resize",function(event){
                self.resize();
            });
        },
        _updateSlider: function(){
            var self=this,
                destinationXOffset,
                sourceXOffset,
                currentTranslateValue,
                translation;

            destinationXOffset = self.$ele.find(".list").offset().left + self.containerWidth/2 - self.$ele.find("ol > li.center").outerWidth()/2;
            sourceXOffset = self.$ele.find("ol li.center").offset().left;
            translation = destinationXOffset - sourceXOffset;
            currentTranslateValue = getTranslateValue(self.$ele.find(".list ol"));
            self.$ele.find(".list .outer-nodes-container").css("transform", "translate3d(" + (currentTranslateValue + translation) + "px,0px,0px)");
        },
        _setNameContainerWidth: function(){
            var self = this,
                outerList = self.$ele.find(".list ol > li");
            outerList.each(function(){
                var innerListWidth = 0,outerNode = $(this);
                outerNode.find("ul > li").each(function(){
                    var innerNode = $(this);
                    innerListWidth += innerNode.outerWidth();
                });
                if(innerListWidth > 300){
                    outerNode.find(".outer-list-name").css("width",innerListWidth);
                    outerNode.find(".inner-selected-name").css("width",innerListWidth);
                }else{
                    outerNode.find(".outer-list-name").css("width",300);
                    outerNode.find(".inner-selected-name").css("width",300);
                }
            })
        },
        _resetNestedNameContainerWidth: function(){
            this.$ele.find(".list .inner-selected-name").css("width","100%");
        },
        _updateNavigationButtonState: function(){
            var self = this;
            if(!self.$ele.find(".outer-node.selected .inner-node.selected").next().length && !self.$ele.find(".outer-node.selected").next().length){
                self.$ele.find(".ns-timeline-navigation a.next").addClass("inactive");
            }else{
                self.$ele.find(".ns-timeline-navigation a.next").removeClass("inactive");
            }

            if(!self.$ele.find(".outer-node.selected .inner-node.selected").prev().length && !self.$ele.find(".outer-node.selected").prev().length){
                self.$ele.find(".ns-timeline-navigation a.prev").addClass("inactive");
            }else{
                self.$ele.find(".ns-timeline-navigation a.prev").removeClass("inactive");
            }
        },
        changeState: function(nodeData){
            var self = this,
                $node = self.$ele.find(".list a[data-id='"+nodeData.id+"']");

            //remove all classes from $node that matches regex state-*
            $node.removeClass (function (index, css) {
                return (css.match(/\bstate-\S+/g) || []).join(' ');
            });
            $node.addClass("state-"+nodeData.state);
        },
        resize:function(){
            var self = this;
            //recalculate the available width
            self.containerWidth = self.$ele.find(".list").outerWidth();
            //update slider position
            if(self.options.mode === "nested"){
                self._updateSlider();
            }
        },
        destroy: function(){
            this.$ele.empty();
            $.data(this.$ele, 'plugin_' + pluginName, null);
        },
        selectNode: function(nodeData){
            this.$ele.find(".outer-node[data-id = '"+nodeData.id+"'] .inner-node a[data-id = '"+nodeData.nestedNode.id+"']").trigger("click");
        },
        switchMode: function(mode){
            if(this.options.mode != mode){
                if(mode === "nested"){
                    this.options.mode = mode;
                    this._setNameContainerWidth();
                    this.$ele.find(".ns-horizontal-timeline").removeClass("nested-mode flattened-mode").addClass(mode+"-mode");
                    this.$ele.find(".outer-node.selected .inner-selected-name > p").text(this.$ele.find(".outer-node.selected .inner-node.selected a").data("content"));
                    this._updateSlider();
                }else if(mode === "flattened"){
                    this.options.mode = mode;
                    this._resetNestedNameContainerWidth();
                    this.$ele.find(".ns-horizontal-timeline").removeClass("nested-mode flattened-mode").addClass(mode+"-mode");
                    if(!this.$ele.find(".outer-node.selected .inner-node.selected a").data("content").length){
                        this.$ele.find(".outer-node.selected .inner-selected-name > p").text(this.$ele.find(".outer-node.selected").data("name"));
                    }
                }
            }
        }

/*      _hideOverflowListItems: function(){
            var self = this,
                outerlist = self.$ele.find(".outer-node"),
                xlowerBound = self.$ele.find(".list").offset().left,
                xUpperBound = self.$ele.find(".list").offset().left + self.containerWidth;

            outerlist.each(function(){
                if($(this).offset().left < xlowerBound){
                    $(this).addClass("hidden");
                }else if(($(this).offset().left + $(this).outerWidth())> xUpperBound){
                    $(this).addClass("hidden");
                }else{
                    $(this).removeClass("hidden");
                }
            });
        }*/
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
    $.fn[pluginName].defaults = {
        "mode": "nested"
    };
})(jQuery);