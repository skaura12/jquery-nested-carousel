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
            self.$flattenedViewContainer = self.$ele.find(".flattened-view");
            self.$nestedViewContainer = self.$ele.find(".nested-view");
            self._setNameContainerWidth();
            selectedOuterNode = self.$nestedViewContainer.find(".list .outer-node.selected");
            selectedOuterNode.addClass("center");
            selectedInnerNode = selectedOuterNode.find(".inner-node.selected");
            selectedOuterNode.find("div.active").attr("title",selectedInnerNode.find("a").data('content'));
            selectedOuterNode.find("div.active > p").text(selectedInnerNode.find("a").data('content'));
            self.totalContentWidth = 0;
            self.$nestedViewContainer.find(".list > ol >li").each(function(){
                self.totalContentWidth = self.totalContentWidth + $(this).outerWidth();
            });
            self.containerWidth = self.$ele.find(".list").outerWidth();
            self._attachEvents();
            self._updateSlider();
        },
        _buildTemplate: function(){
            //readability
            var self = this,
                nestedViewTemplate = $("<section class='nested-view'><div class='timeline'> <div class='list-wrapper'> <div class='list'></div></div></section>"),
                flattenedViewTemplate  = $("<section class='flattened-view'><div class='timeline'> <div class='list-wrapper'> <div class='list'></div></div></div></section>"),
                outerList = $("<ol class='outer-nodes-container'></ol>"),
                flattenedOuterList = $("<ol class='outer-nodes-container'></ol>");
            self.$ele.addClass("ns-horizontal-timeline");
            self.options.data.forEach(function(outerNode){
                var innerList = $("<ul class='inner-nodes-container'></ul>"),
                    flattenedInnerList = $("<ul class='inner-nodes-container'></ul>");

                outerNode.list.forEach(function(innerNode){
                    var anchorNode = $("<a href='#0'></a>"),
                        flattenedNode;

                    anchorNode.attr("title",(innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"");
                    anchorNode.data("content", (innerNode.name)?(innerNode.name):"").attr("data-id", innerNode.id);
                    anchorNode.addClass("state-"+innerNode.state);
                    $("<li class='inner-node "+((innerNode.selected)?'selected':'')+"'></li>").append(anchorNode).appendTo(innerList);

                    flattenedNode = $("<li class='inner-node "+((innerNode.selected)?'selected':'')+"'></li>");
                    flattenedNode.text((innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"");
                    flattenedNode.attr("title",(innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"");
                    flattenedNode.data("content", (innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"").attr("data-id", innerNode.id);
                    flattenedInnerList.append(flattenedNode);
                    flattenedViewTemplate.find(".nodes-container").append(flattenedNode);
                });
                $("<li class='outer-node "+ ((outerNode.selected)?'selected':'') +"' data-id='"+outerNode.id+"' data-name='"+outerNode.name+"'><div class='outer-list-name'><p>"+outerNode.name+"</p></div></li>").append(innerList).append("<div class='inner-selected-name active'><p></p></div>").appendTo(outerList);
                $("<li class='outer-node "+ ((outerNode.selected)?'selected':'') +"' data-id='"+outerNode.id+"' data-name='"+outerNode.name+"'></li>").append(flattenedInnerList).appendTo(flattenedOuterList);
            });

            nestedViewTemplate.find(".list").append(outerList);
            flattenedViewTemplate.find(".list").append(flattenedOuterList);
            //append navigation buttons
            nestedViewTemplate.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev' title='Previous'>Prev</a></li> <li><a href='#0' class='next' title='Next'>Next</a></li></ul>");
            nestedViewTemplate.appendTo(self.$ele);
            flattenedViewTemplate.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev' title='Previous'>Prev</a></li> <li><a href='#0' class='next' title='Next'>Next</a></li></ul>");
            flattenedViewTemplate.appendTo(self.$ele);
        },
        _attachEvents: function(){
            var self = this;


            self.$nestedViewContainer.find(".ns-timeline-navigation a.prev").on("click",function(event){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.center").prev().length){
                    self.$ele.find(".outer-node.center").removeClass("center").prev().addClass("center");
                    self._updateSlider();
                }
            });

            self.$nestedViewContainer.find(".ns-timeline-navigation a.next").on("click",function(event){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.center").next().length){
                    self.$nestedViewContainer.find(".outer-node.center").removeClass("center").next().addClass("center");
                    self._updateSlider();
                }
            });

            self.$nestedViewContainer.find(".list .outer-nodes-container").on("click",".outer-node:not('.selected')",function(event){
                $($(event.currentTarget).find(".inner-node a")[0]).trigger("click");
            });

            self.$nestedViewContainer.find(".list .inner-nodes-container").on("click","a",function(event){
                var innerSelectedName;
                event.preventDefault();
                var wrapperListItem = $(event.target).closest(".outer-node"),innerNodeName;
                self.$nestedViewContainer.find(".outer-node.selected > div.active > p").text("");
                self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").removeClass("selected");
                if(!wrapperListItem.hasClass("selected")){
                    //when wrapper list item is not selected
                    self.$nestedViewContainer.find(".outer-node.selected").removeClass("selected");
                    wrapperListItem.addClass("selected");
                }
                if(!wrapperListItem.hasClass("center")){
                    self.$nestedViewContainer.find(".outer-node.center").removeClass("center");
                    wrapperListItem.addClass("center");
                    self._updateSlider();
                }
                innerNodeName = $(event.target).data("content");
                $(event.target).parent().addClass("selected");
                wrapperListItem.find("div.active").attr("title",innerNodeName).find("p").text(innerNodeName);
                self._updateNavigationButtonState();
                if(typeof self.options.nodeSwitchCallback === "function") {
                    self.options.nodeSwitchCallback({
                        id: self.$ele.find(".nested-view .outer-node.selected").data("id"),
                        name: self.$ele.find(".nested-view .outer-node.selected").data("name"),
                        nestedNode: {
                            id: self.$ele.find(".nested-view .outer-node.selected .inner-node.selected a").data("id"),
                            name: self.$ele.find(".nested-view .outer-node.selected .inner-node.selected a").data("content")
                        }
                    });
                }
                self.$flattenedViewContainer.find(".outer-node.selected").removeClass("selected").find(".inner-node.selected").removeClass("selected");
                self.$flattenedViewContainer.find(".outer-node[data-id = '"+wrapperListItem.data("id")+"']").addClass("selected").find(".inner-node[data-id = '"+$(event.target).data("id")+"']").addClass("selected");
                event.stopPropagation();
            });

            self.$flattenedViewContainer.find(".ns-timeline-navigation a.prev").on("click",function(){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").prev().length){
                    self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").prev().find("a").trigger("click");
                }else if(self.$nestedViewContainer.find(".outer-node.selected").prev().length){
                    self.$nestedViewContainer.find(".outer-node.selected").prev().find(".inner-node").last().find("a").trigger("click");
                }
            });


            self.$flattenedViewContainer.find(".ns-timeline-navigation a.next").on("click",function(){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").next().length){
                    self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").next().find("a").trigger("click");
                }else if(self.$nestedViewContainer.find(".outer-node.selected").next().length){
                    self.$nestedViewContainer.find(".outer-node.selected").next().find(".inner-node").first().find("a").trigger("click");
                }
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

            destinationXOffset = self.$nestedViewContainer.find(".list").offset().left + self.containerWidth/2 - self.$nestedViewContainer.find("ol > li.center").outerWidth()/2;
            sourceXOffset = self.$nestedViewContainer.find("ol li.center").offset().left;
            translation = destinationXOffset - sourceXOffset;
            currentTranslateValue = getTranslateValue(self.$nestedViewContainer.find(".list ol"));
            self.$nestedViewContainer.find(".list .outer-nodes-container").css("transform", "translate3d(" + (currentTranslateValue + translation) + "px,0px,0px)");
        },
        _setNameContainerWidth: function(){
            var self = this,
                outerList = self.$nestedViewContainer.find(".list .outer-nodes-container .outer-node");
            outerList.each(function(){
                var innerListWidth = 0,outerNode = $(this);
                outerNode.find(".inner-node").each(function(){
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
            this.$nestedViewContainer.find(".list .inner-selected-name").css("width","100%");
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