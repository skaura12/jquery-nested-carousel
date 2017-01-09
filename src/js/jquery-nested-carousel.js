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
    function debounce(wait, immediate) {
        var timeout;
        return function(func) {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
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
            selectedOuterNode.addClass("highlighted-node");
            selectedInnerNode = selectedOuterNode.find(".inner-node.selected");
            self.totalContentWidth = 0;
            self.$nestedViewContainer.find(".list > ol >li").each(function(){
                self.totalContentWidth = self.totalContentWidth + $(this).outerWidth();
            });
            self.containerWidth = self.$ele.find(".list").outerWidth();
            self.nodeMargin=2*self.$nestedViewContainer.find(".list > ol >li").css('margin-left').replace('px','');
            self.listContainerWidth=self.totalContentWidth+self.nodeMargin*self.$nestedViewContainer.find(".list > ol >li").length-self.nodeMargin;
            self.$nestedViewContainer.find(".list .outer-nodes-container").css('width',self.listContainerWidth);
            self.end={
                left:false,
                right:false
            };
            self._attachEvents();
            self._updateSlider();
            self._updateNestedViewButtonState();
            self.$ele.find('[data-toggle="popover"]').popover({
                "trigger": "hover",
                "container": "body",
                template: '<div class="nested-node-popover popover"><div class="arrow"></div><div class="popover-content"></div></div>'
            });
            if(!self.options.viewFlattened){
                self.$ele.find(".flattened-view").addClass("hidden");
            }
            if(!self.options.viewNested){
                self.$ele.find(".nested-view").addClass("hidden");
            }
        },
        _buildTemplate: function(){
            //readability
            var self = this,
                nestedViewTemplate = $("<section class='nested-view'><div class='timeline'> <div class='list-wrapper'> <div class='list'></div></div></section>"),
                flattenedViewTemplate  = $("<section class='flattened-view'><div class='flattened-node'></div></section>"),
                outerList = $("<ol class='outer-nodes-container'></ol>");

            self.$ele.addClass("ns-horizontal-timeline");
            self.options.data.forEach(function(outerNode){
                var innerList = $("<ul class='inner-nodes-container'></ul>");

                outerNode.list.forEach(function(innerNode){
                    var anchorNode = $("<a href='#0'></a>"),
                        flattenedNode;
                    anchorNode.data("content", (innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"").attr("data-id", innerNode.id);
                    anchorNode.addClass("state-"+innerNode.state);
                    $("<li data-toggle='popover' title='Activity Name' data-placement='bottom' class='inner-node "+((innerNode.selected)?'selected':'')+"'></li>").data("content", (innerNode.name)?(innerNode.name):(outerNode.name)?(outerNode.name):"").attr("data-id", innerNode.id).append(anchorNode).appendTo(innerList);
                    if(innerNode.selected){
                        flattenedViewTemplate.find(".flattened-node").text(innerNode.name);
                    }
                });
                $("<li class='outer-node "+ ((outerNode.selected)?'selected':'') +"' data-id='"+outerNode.id+"' data-name='"+outerNode.name+"'><div class='outer-list-name'><p>"+outerNode.name+"</p></div></li>").append(innerList).appendTo(outerList);
            });

            nestedViewTemplate.find(".list").append(outerList);
            //append navigation buttons
            nestedViewTemplate.find(".timeline").append("<ul class='ns-timeline-navigation'> <li><a href='#0' class='prev' title='Previous'></a></li> <li><a href='#0' class='next' title='Next'></a></li></ul>");
            nestedViewTemplate.appendTo(self.$ele);
            flattenedViewTemplate.prepend("<ul class='ns-timeline-navigation'> <li class='prev-btn-item'><a href='#0' class='prev btn-nav-left' title='Previous'></a></li> <li class='next-btn-item'><a href='#0' class='next btn-nav-right' title='Next'></a></li></ul>");
            flattenedViewTemplate.appendTo(self.$ele);
        },
        _clickInnerNodeHandler:function(target){
            var self=this;
            var innerSelectedName;
            var wrapperListItem = target.closest(".outer-node"),innerNodeName;
            self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").removeClass("selected");
            if(!wrapperListItem.hasClass("selected")){
                //when wrapper list item is not selected
                wrapperListItem.addClass("highlighted-node");
                self.$nestedViewContainer.find(".outer-node.selected").removeClass("selected");
                wrapperListItem.addClass("selected");
            }
            self.$nestedViewContainer.find(".outer-node.center").removeClass("center");
            wrapperListItem.addClass("center");
            self._updateSlider();

            innerNodeName = target.data("content");
            target.parent().addClass("selected");
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
            self.$flattenedViewContainer.find(".flattened-node").text(innerNodeName);
            self._updateNestedViewButtonState();
            self._updateFlattenedViewButtonState();
        },
        _attachEvents: function(){
            var self = this;
            self.leftEdge= -self.listContainerWidth+self.containerWidth/2+self.$nestedViewContainer.find("ol > li.outer-node").outerWidth()/2+self.nodeMargin/2+self.$nestedViewContainer.find(".list").offset().left;
            self.rightEdge= self.containerWidth-(self.containerWidth/2+self.$nestedViewContainer.find("ol > li.outer-node").outerWidth()/2+self.nodeMargin/2)+self.$nestedViewContainer.find(".list").offset().left;
            self.$nestedViewContainer.find(".ns-timeline-navigation a.prev").on("click",function(event){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.center").prev().length){
                    self.$ele.find(".outer-node.center").removeClass("center").prev().addClass("center");
                    self._updateSlider();
                    self._updateNestedViewButtonState();
                }
            });

            self.$nestedViewContainer.find(".ns-timeline-navigation a.next").on("click",function(event){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.center").next().length){
                    self.$nestedViewContainer.find(".outer-node.center").removeClass("center").next().addClass("center");
                    self._updateSlider();
                    self._updateNestedViewButtonState();
                }
            });
            var isDragging = false;
            var mousedown={};
            self.$nestedViewContainer.find(".list ol.outer-nodes-container")
            .on('mousedown',".outer-node",function(event) {
                isDragging = false;
                mousedown = { x: event.clientX, y: event.clientY };
            })
            .on('mousemove',".outer-node",function(event) {
                 if ( event.clientX !== mousedown.x || event.clientY !== mousedown.y) {
                     isDragging = true;
                 }
            })
            .on('mouseup',".outer-node",function(event) {
                var wasDragging = isDragging;
                isDragging = false;
                if (!wasDragging) {
                   if($(event.target).parent().hasClass("inner-node")){
                    self._clickInnerNodeHandler($(event.target));
                    }    
                   else
                   {
                    self._clickInnerNodeHandler($($(event.currentTarget).find(".inner-node a")[0]));
                   }
                }
            });
            self.$flattenedViewContainer.find(".ns-timeline-navigation a.prev").on("click",function(){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").prev().length){
                    self._clickInnerNodeHandler(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").prev().find("a"));

                }else if(self.$nestedViewContainer.find(".outer-node.selected").prev().length){
                    self._clickInnerNodeHandler(self.$nestedViewContainer.find(".outer-node.selected").prev().find(".inner-node").last().find("a"));

                }
            });
            self.$flattenedViewContainer.find(".ns-timeline-navigation a.next").on("click",function(){
                event.preventDefault();
                if(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").next().length){
                    self._clickInnerNodeHandler(self.$nestedViewContainer.find(".outer-node.selected .inner-node.selected").next().find("a"));

                }else if(self.$nestedViewContainer.find(".outer-node.selected").next().length){
                    self._clickInnerNodeHandler(self.$nestedViewContainer.find(".outer-node.selected").next().find(".inner-node").first().find("a"));
                }
            });
            self._efficientDragging=debounce(250);
            self.$nestedViewContainer.find(".list ol.outer-nodes-container").draggable({
                 axis: "x",
                 containment : [self.leftEdge,0,self.rightEdge,0],
                 drag: function( event, ui ) {
                     self._efficientDragging(function(){
                         if(ui.offset.left==self.leftEdge){
                             self.$nestedViewContainer.find(".outer-node.center").removeClass("center");
                             self.$nestedViewContainer.find(".outer-node").last().addClass("center");
                             self._updateNestedViewButtonState();
                         }
                         else{
                             if(ui.offset.left==self.rightEdge){
                                 self.$nestedViewContainer.find(".outer-node.center").removeClass("center");
                                 self.$nestedViewContainer.find(".outer-node").first().addClass("center");
                                 self._updateNestedViewButtonState();
                             }
                             else{
                                 self.$nestedViewContainer.find(".outer-node.center").removeClass("center");
                                 self.$nestedViewContainer.find(".outer-node.selected").addClass("center");
                                 self._updateNestedViewButtonState(true);
                             }
                         }
                     });
                }
             });
            self.$nestedViewContainer.find(".list ol.outer-nodes-container").on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",".outer-node.highlighted-node:not('.selected')",function() {
                 $(this).removeClass('highlighted-node');
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
                }else{
                    outerNode.find(".outer-list-name").css("width",300);
                }
            })
        },
        _updateNestedViewButtonState: function(enable){
            var self = this;
            var isLeftEnd,isRightEnd;
            isLeftEnd=isRightEnd=false;
            if(!self.$nestedViewContainer.find(".outer-node.center").next().length&&!enable){
                self.$nestedViewContainer.find(".ns-timeline-navigation a.next").addClass("inactive");
               isRightEnd=true;
            }else{
                self.$nestedViewContainer.find(".ns-timeline-navigation a.next").removeClass("inactive");
            }
            if(!self.$nestedViewContainer.find(".outer-node.center").prev().length&&!enable){
                self.$nestedViewContainer.find(".ns-timeline-navigation a.prev").addClass("inactive");
                isLeftEnd=true;
            }else{
                self.$nestedViewContainer.find(".ns-timeline-navigation a.prev").removeClass("inactive");
            }
            if(typeof self.options.carouselStateChanged==="function"&&(isLeftEnd!=self.end.left||isRightEnd!=self.end.right)) {
                self.options.carouselStateChanged(isLeftEnd, isRightEnd);
                self.end={
                    left:isLeftEnd,
                    right:isRightEnd
                };
            }
        },
        _updateFlattenedViewButtonState: function(){
            var self = this;
            if(!self.$flattenedViewContainer.find(".outer-node.selected .inner-node.selected").next().length && !self.$flattenedViewContainer.find(".outer-node.selected").next().length){
                self.$flattenedViewContainer.find(".ns-timeline-navigation a.next").addClass("inactive");
            }else{
                self.$flattenedViewContainer.find(".ns-timeline-navigation a.next").removeClass("inactive");
            }

            if(!self.$flattenedViewContainer.find(".outer-node.selected .inner-node.selected").prev().length && !self.$flattenedViewContainer.find(".outer-node.selected").prev().length){
                self.$flattenedViewContainer.find(".ns-timeline-navigation a.prev").addClass("inactive");
            }else{
                self.$flattenedViewContainer.find(".ns-timeline-navigation a.prev").removeClass("inactive");
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
            self._updateSlider();
            self.leftEdge= -self.listContainerWidth+self.containerWidth/2+self.$nestedViewContainer.find("ol > li.outer-node").outerWidth()/2+self.nodeMargin/2+self.$nestedViewContainer.find(".list").offset().left;
            self.rightEdge= self.containerWidth-(self.containerWidth/2+self.$nestedViewContainer.find("ol > li.outer-node").outerWidth()/2+self.nodeMargin/2)+self.$nestedViewContainer.find(".list").offset().left;
            self.$nestedViewContainer.find(".list ol.outer-nodes-container").draggable( "option", "containment", [self.leftEdge,0,self.rightEdge,0]);
        },
        destroy: function(){
            this.$ele.empty();
            $.data(this.$ele, 'plugin_' + pluginName, null);
        },
        selectNode: function(nodeData){
            var self=this;
            self._clickInnerNodeHandler(this.$ele.find(".outer-node[data-id = '"+nodeData.id+"'] .inner-node a[data-id = '"+nodeData.nestedNode.id+"']"))
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
    $.fn[pluginName].defaults = {
        "viewNested":true,
        "viewFlattened": true
    };
})(jQuery);