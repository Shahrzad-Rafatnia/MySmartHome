/**
 * Graph class skeleton.
 *
 * Manages the rendering of data as graphs.
 */
define([
    'jquery',
    'underscore'
    // TODO: add all of the Flot includes here!
    //<!--[if lte IE 8]><script language="javascript" type="text/javascript" src="flot/excanvas.min.js"></script><![endif]--> how do you define this??
    //'flot/jquery.flot.js'
    //'flot/jquery.flot.time.js'
    //'flot/jquery.flot.orderBars.js'
    //'flot/jquery.flot.axislabels.js'
    //'flot/jquery.flot.navigate.js'
    //'flot/jquery.flot.pie.js'
    ],
function ($, _) {

    /**
     * Constructor for a graph.
     */
    function Graph(element, _clickCallback, initialData) {
        // initialData will have .graphType appended to it.
        this.clickCallback = _clickCallback;
        this.element = element;
        this.graphType = initialData.graphType;

        // Initial update of the graph.
        this.update(initialData);
    }

    /** Update method. Provide new data to update the graph. */
    Graph.prototype.update = function (graphData) {
        // Actually graphs the data!
	var graphType = graphData.graphType

        // test for graphtypes
	if(graphType === "plainText") {
	    displayText(graphData)
	} else {
	    var meta_data = create_metadata_object(graphType, graphData);
	    var datapoints = graphData["values"]
            var data_and_opts = format_data(meta_data, datapoints);
	    var data = data_and_opts["data"];
	    var options = data_and_opts["options"];

	    //$.plot($(".graph1"), data, options);
	    $.plot($(this.element), data, options);

	    if(meta_data.granularity !== "Hourly") {
	        bind_plotclick(meta_data.granularity);
	    }

	    bind_plothover();
        }        
    };

    var displayText = function (result) {
        var display_text = "";
	var xtype = result["x-axis"];
		
	$.each(result["values"], function(key, value) {
            display_text += "<h2><i>Apartment " + key + ": </i></h2>";
	    		
	    $.each(value, function(key, value) {	
		display_text += "<h4>" + "Date: " + key + "</h4>";					
		 			
		$.each(value, function(key, value) {
		    if(xtype === "time") {
			display_text += "Sensor " + key + ": " + value.y + "<br />";			
		    } else {			
			display_text += "Sensor " + key + " against " + xtype + ": " + value.y + " against " + value.x + "<br />";"<br />";
		    }
             	});
	    });
	});

        $(this.element).html(display_text);
    	};

    var create_metadata_object = function (graphtype, datapoints) {
	return 	{
                graphtype: graphtype,
                granularity: datapoints.granularity,
		xtype: datapoints["x-axis"],
		ytype: datapoints["y-axis"],
		millisecond_hour: 3600000,
		millisecond_day: 86400000,
            	}
    };

    /*
    * Parses the data retrieved from the server, into something 
    * usable by Flot.
    */
    var format_data = function (meta_data, datapoints) {
	var sensor_data = [];
	var series_data = [];
	var data_and_options = [];
	var graphname = [];
	var apartments = [];
	var graphname_flag = "false";
	var min_x, max_x;
	var apartment, sensor, timestamp;
	
        $.each(datapoints, function (key, value) {
            apartment = key;
            apartments.push(apartment);
            console.assert(sensor_data[apartment] === undefined);
            sensor_data[apartment] = [];

            $.each(value, function (key, value) {
		// key = date stamp                   
		time_stamp = DateToUTC(key);

                if (graphname.length !== 0) {
                    graphname_flag = "true";
                }

                $.each(value, function (key, value) {
                    // key = sensor names
                    sensor = key;

                    if (graphname_flag === "false" && sensor !== "time") {
			graphname.push(sensor);			  
                    }

                    if (sensor_data[apartment][sensor] === undefined) {
                        sensor_data[apartment][sensor] = [];
                    }

                    if (series_data.length === 0) {
                        tuple = [];
                    } else {
                        tuple.length = 0;
                    }

                    if(meta_data.xtype === "time") {
		    	if(min_x === undefined) {
			    min_x = time_stamp;
			    max_x = min_x;
		        }
				
		        if(time_stamp >= max_x) {
                            if(meta_data.granularity === "Hourly") {
		                max_x = time_stamp + meta_data.millisecond_day;
		            } else {
			        max_x = time_stamp;
			    }
		        }

                        var tick_size = time_stamp;
		    } else {
			if(value["x"]) {
			    var tick_size = parseFloat(value["x"]);

			    if(min_x === undefined || min_x > tick_size) {
				min_x = tick_size;
			    }

			    if(max_x === undefined || max_x < tick_size) {
				max_x = tick_size;
			    }

			} else {
                            console.log({
                                msg: "Got null value in sensor reading!",
                                apt: apartment,
                                date: time_stamp,
                                sensor: sensor
                            });
			}
		    }                              

                    tuple[0] = tick_size;
                    tuple[1] = value["y"];
                    sensor_data[apartment][sensor].push(tuple);
                });
            });
        });

	meta_data["min_x"] = min_x;
	meta_data["max_x"] = max_x;

        for(var i = 0; i < apartments.length; ++i) {
	    for(var j = 0; j < graphname.length; ++j) {
		var label = "Apartment " + apartments[i] + " " + graphname[j];
		series_length = series_data.length;
		if(series_length === 0) {
		    series_data[0] = create_series_object(label, sensor_data[apartments[i]][graphname[j]]);
			
		} else {
		    series_data[series_length] = create_series_object(label, sensor_data[apartments[i]][graphname[j]]);
		}
	    }
	}

        var options = set_all_options(meta_data);
	data_and_options["data"] = series_data;
	data_and_options["options"] = options;
	return data_and_options;
    };

    var set_all_options = function (meta_data) {
	var x_axis = get_x_axis(meta_data);
	var y_axis = get_y_axis(meta_data);
	var grid = get_grid();
	var series_opts = get_series_options(meta_data);
	var legend = get_legend();

	if(meta_data.granularity === "Hourly") {
	    var zoom = get_zoom_options();	
	} else {
	    var zoom = {};
	}

	var options = $.extend({}, x_axis, y_axis, grid, series_opts, legend, zoom);
	return options;
    };

    var get_x_axis = function (meta_data) {
	var granularity = meta_data.granularity;
	var xtype = meta_data.xtype;
	var min_x = meta_data.min_x;
	var max_x = meta_data.max_x;
	var min_date = new Date(min_x);
	var max_date = new Date(max_x);

        var base_x = {
	    xaxis: 	
		{ 
		  axisLabelUseCanvas: true, 
		  axisLabelFontSizePixels: 12,
                  axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif', 
		  axisLabelPadding: 5,
		  autoscaleMargin: .50
		}		 
	};

	base_x.xaxis["min"] = min_x;
	base_x.xaxis["max"] = max_x;

	if(xtype === "time") {
	    base_x.xaxis["mode"] = "time";

            if(granularity === "Hourly") {
	        base_x.xaxis["tickSize"] = [1, "hour"];
	        var label = get_month_and_day(min_date);
	        base_x.xaxis["axisLabel"] = label;
            } else if(granularity === "Daily") {
		base_x.xaxis["timeformat"] = "%a %d";
		base_x.xaxis["tickSize"] = [1, "day"];
		base_x.xaxis["dayNames"] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];	
		base_x.xaxis["axisLabel"] = get_month_and_day(min_date) + " - " + get_month_and_day(max_date); 
            } else if (granularity === "Weekly") {
		base_x.xaxis["tickSize"] = [1, "week"];
		base_x.xaxis["weekNames"] = ["1", "2", "3", "4", "5"];
            } else if(granularity === "Monthly") {
		base_x.xaxis["timeformat"] = "%b";
		base_x.xaxis["tickSize"] = [1, "month"];
		base_x.xaxis["monthNames"] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var label = min_date.getUTCFullYear(); 
		base_x.xaxis["axisLabel"] = 'Year: ' + label;
	    } else {
		// multiple years?
	    }
	} else {
	     base_x.xaxis["axisLabel"] = xtype;
	}

	if(granularity === "Hourly") {
	    base_x.xaxis["zoomRange"] = [0.1, 3600000];
	    var pan_range = max_x * 1.5;
	    base_x.xaxis["panRange"] = [-100, pan_range];
	}

	return base_x;	    
    };

    var get_y_axis = function (meta_data) {
        var base_y = {
            yaxis: 
		{
                  axisLabelUseCanvas: true,
                  axisLabelFontSizePixels: 12,
                  axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                  axisLabelPadding: 5
                }
            };

        base_y.yaxis["axisLabel"] = meta_data.ytype;

	if(meta_data.granularity === "Hourly") {
	    base_y.yaxis["zoomRange"] = [0.1, 3600000];
	    base_y.yaxis["panRange"] = [-100, 1000];
	}

        return base_y;
    };

    var get_grid = function () {
	return base_grid = {grid: {hoverable: true, clickable: true, borderWidth: 3, labelMargin: 3}};     
    };

    var get_series_options = function (meta_data, order) {
	var graphtype = meta_data.graphtype;

	var line = {series: {lines: {show: true}, points: {radius: 3, show: true, fill: true }}};
	var bars = {series: {bars: { show: true, barWidth: 1000*60*60*0.25, fill: true, lineWidth: 1, clickable: true,
    			hoverable: true, order: order}}};
	var pie =  {series: {pie: {show: true, radius: 1}}};

	if(graphtype === "line") {
	    return line;
	} else if(graphtype === "histo") {
	    return bars;
	} else if(graphtype === "pie") {
	    return pie;
        }
    };

    var get_legend = function () {
        return {
	    legend: 
		{
    		  show: true,
		  labelBoxBorderColor: "rgb(51, 204, 204)",
		  backgroundColor: "rgb(255, 255, 204)",
    		  margin: [10, 300],
    		  backgroundOpacity: .75
  		}
        }
    };

    var get_zoom_options = function () {
        return {
            zoom: 
		{
                interactive: true
            	},

            pan: 
		{
                interactive: true
            	}
	}
    };

    var create_series_object = function (label, data) {
        return {
                 label: label,
                 data: data,
               }
    };

    var show_tool_tip = function (x, y, contents) {

        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 20,
            left: x -25,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    };

    var bind_plothover = function () {
        var previousPoint = null;

        $(this.element).bind("plothover", function (event, pos, item) {
            $("#x").text(pos.x.toFixed(2));
            $("#y").text(pos.y.toFixed(2));
       
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;
                    
                    $("#tooltip").remove();
                        var x = new Date(item.datapoint[0]);
			x = get_month_and_day(x);
                        y = item.datapoint[1].toFixed(2);
                    
                        show_tool_tip(item.pageX, item.pageY,
                                item.series.label + " on " + x + " is " + y);
                }
            } else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        });
    };

    var bind_plotclick = function(granularity) {
	var drill_granularity;
	var date_from;
	var date_to;

    	$(this.element).bind("plotclick", function (event, pos, item) {
            if (item) {		
	        var offset = (new Date(item.datapoint[0])).getTimezoneOffset()*60*1000;
	        var data_pointUTC = item.datapoint[0] + offset;		
	        var date = new Date(data_pointUTC);
	        date_from = format_date(date, "true");

		if(granularity === "Hourly") {
		    // cannot drill down further
		    return;
		} else if (granularity === "Daily") {
		   drill_granularity = "Hourly";
		   date_to = date_from;
		} else if (granularity === "Weekly") {
		    drill_granularity = "Daily";
		    date_to = get_date_to(data_pointUTC, drill_granularity);		
		} else if(granularity === "Monthly") {
		    drill_granularity = "Weekly";
		    date_to = get_date_to(data_pointUTC, drill_granularity);
		}
       	    } // if statement
	}); // end plotclick
    };


    /*
     * UTILITIES!
     */

    /* Converts a date in YYYY-MM-DD:hh format into milliseconds since the
     * UNIX epoch. Assumes everything is using the same timezone.  If the
     * input cannot be parsed, returns undefined.
     */

    DateToUTC = function (dateString) {
        var dateRegex = /(\d+)-(\d+)-(\d+):(\d+)/,
            m, // m for match
            UTCTime;

        m = dateString.match(dateRegex);

        // Return undefined if we could not match the regex.
        if (!m) {
            return;
        }

        UTCTime = Date.UTC(
           m[1],     // Year
           m[2] - 1, // Month (WHY IS THIS ZERO-INDEXED?!)
           m[3],     // Day
           m[4]);    // Hour

        return UTCTime;
    };

    var get_days_in_month = function (month, year) {
        month = parseInt(month);
        year = parseInt(year);
        return (32 - new Date(year, month, 32).getDate());
    };

    var get_date_to = function (date, drill_granularity) {
        var millisecond_day = 86400000;
        var millisecond_week = 6 * millisecond_day;

        if (drill_granularity === "Daily") {
            var date_to = date + millisecond_week;
            date_to = new Date(date_to);
            return date_to = format_date(date_to, true);
        }

        if (drill_granularity === "Weekly") {
            var temp_date = new Date(date);
            var month = temp_date.getUTCMonth();
            var year = temp_date.getUTCFullYear();
            var num_days = get_days_in_month(month, year);
            date_to = date + (num_days - 1) * millisecond_day;
            date_to = new Date(date_to);
            return date_to = format_date(date_to, true);
        }
    };

    var format_date = function (date, bool) {
        if (bool === "false") {
            return (date.getUTCMonth() + 1) + '/' + date.getUTCFullYear();
        } else {
            return add_leading_zero(date.getUTCMonth() + 1) + '/' + add_leading_zero(date.getUTCDate()) + '/' + date.getUTCFullYear();
        }
    };

    var add_leading_zero = function (date) {
        return date < 10 ? '0' + date : '' + date;
    };

    var get_month_and_day = function (date) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Nov", "Dec"];
	return months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ' ' + date.getUTCFullYear();
    };

    Graph.prototype.method = function (vars) {

    };


    /* This module exports one public member -- the class itself. */
    return Graph;

});
