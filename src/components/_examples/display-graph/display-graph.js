//Display Graph
define([
    'd3',
    'base/component'
], function(d3, Component) {

    var DisplayGraph = Component.extend({

        /**
         * Initializes the component (Display Graph).
         * Executed once before any template is rendered.
         * @param {Object} config The options passed to the component
         * @param {Object} context The component's parent
         */
        init: function(config, context) {
            this.template = "components/_examples/display-graph/display-graph";

            this.model_expects = [{
                name: "deps"
            }];

            var _this = this;
            this.model_binds = {
                ready: function(evt) {
                    _this.update();
                }
            };

            //contructor is the same as any component
            this._super(config, context);
        },

        /**
         * Executes after the template is loaded and rendered.
         * Ideally, it contains HTML instantiations related to template
         * At this point, this.element and this.placeholder are available as d3 objects
         */
        domReady: function() {
            this.chart = graph().size(parseInt(this.element.style("width"), 10), parseInt(this.element.style("height"), 10));
            var _this = this;
        },

        update: function() {
            //E.g: var year = this.model.get('value');
            var data = [{
                    name: "A",
                    type: "hook",
                    dep: "B",
                }, {
                    name: "B",
                    type: "hook"
                }, {
                    name: "C",
                    type: "hook",
                    dep: "B",
                }];

            this.element.datum(data).call(this.chart);

            setTimeout(function() {
                _this.chart.size(250,250);
                data.push({ name: "D", type: "other", dep: "B"});
                _this.element.datum(data).call(_this.chart);
            }, 5000);
        },

        /**
         * Executes everytime the container or vizabi is resized
         * Ideally,it contains only operations related to size
         */
        resize: function() {
            //E.g: var height = this.placeholder.style('height');
        },


    });

    //d3 graph in closure
    function graph() {
        var size = {
            width: 200,
            height: 200
        };
        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(80);

        function chart(selection) {
            selection.each(function(data) {

                //select the svg element or append
                var svg = d3.select(this).selectAll("svg");

                // Update the outer dimensions.
                svg.attr("width", size.width)
                    .attr("height", size.height);

                var graph_data = linksNodes(data);

                force.nodes(graph_data.nodes)
                    .links(graph_data.links)
                    .size([size.width, size.height])
                    .start();

                var link = svg.selectAll(".vzb-display-graph-link")
                    .data(graph_data.links)
                    .enter().append("line")
                    .attr("class", "vzb-display-graph-link");

                var node = svg.selectAll(".vzb-display-graph-node")
                    .data(graph_data.nodes)
                    .enter().append("circle")
                    .attr("class", "vzb-display-graph-node")
                    .attr("r", 20)
                    .style("fill", function(d) {
                        return "#cccccc";
                    });

                var text = svg.selectAll(".vzb-display-graph-text")
                    .data(graph_data.nodes)
                    .enter().append("text")
                    .attr("class", "vzb-display-graph-text")
                    .text(function(d) {
                        return d.name;
                    });

                node.append("title")
                    .text(function(d) {
                        return d.name + " - " + d.type;
                    });

                force.on("tick", function() {
                    link.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });

                    text.attr("x", function(d) { return d.x; })
                        .attr("y", function(d) { return d.y+5; });
                });
            });
        }

        //divides the data into nodes and links
        function linksNodes(data) {
            formatted = {
                nodes: [],
                links: []
            };

            var nodeMap = {};

            for (var i = 0; i < data.length; i++) {
                var node = data[i];
                var n = {
                    name: node.name,
                    type: node.type
                };
                formatted.nodes.push(n);
                nodeMap[node.name] = n;
            }

            for (var i = 0; i < data.length; i++) {
                var node = data[i];
                if (node.dep) {
                    formatted.links.push({
                        source: nodeMap[node.name],
                        target: nodeMap[node.dep]
                    });
                }
            };
            return formatted;
        }

        chart.size = function(width, height) {
            if (!arguments.length) return size;
            size.width = width;
            size.height = height;
            return chart;
        };

        return chart;
    }

    return DisplayGraph;

});