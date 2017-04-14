
var ON_OFF_HEIGHT = 5;
var ON_OFF_DIFF = 3;

function loadChart(dataName, svgElementId, propertyFilter) {
	d3.tsv("data.csv", type, function(error, data) {
	  if (error) throw error;
	  initializeChart(svgElementId, data, propertyFilter);
	});
}

function initializeChart(svgElementId, data, propertyFilter) {

var svg1 = d3.select("#svg1"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width1 = svg1.attr("width") - margin.left - margin.right,
    height1 = svg1.attr("height") - margin.top - margin.bottom,
    g1 = svg1.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x1 = d3.scaleTime().range([0, width1-50]),
    y1 = d3.scaleLinear().range([height1, 0]),
    z1 = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x1(d.Timestamp); })
    .y(function(d) { return y1(d.State); });

  var dataset1 = data.columns.slice(1).filter(function(id) {
    //filter value
    if (id.endsWith(propertyFilter)) 
    	return true;
    return false;
  }).map(function(id) {
    //mapping value
    var n = id.indexOf(";"); 
    return {
      id: id.slice(0, n),
      type: id.slice(n+1,id.length),
      visible: true,
      values: data.map(function(d) {
        return {Timestamp: d.Timestamp, State: d[id]};
      })
    };
  });

  x1.domain(d3.extent(data, function(d) { return d.Timestamp; }));

  y1.domain([
    d3.min(dataset1, function(c) { return d3.min(c.values, function(d) { return d.State; }); }),
    d3.max(dataset1, function(c) { return d3.max(c.values, function(d) { return d.State; }); })
  ]);

  z1.domain(dataset1.map(function(c) { return c.id; }));

  g1.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height1 + ")")
      .call(d3.axisBottom(x1).tickFormat(d3.timeFormat("%d.%m %H:%M")));

  var dataLine1 = g1.selectAll(".dataLine")
    .data(dataset1)
    .enter().append("g")
    .attr("class", "dataLine");

  dataLine1.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z1(d.id); });

  //special marking for on/off on y-Axis
  var pos = 0;
  var onlyOnOff = true;
  for (var i=0;i<dataset1.length;i++) { 
	  // OFF Texts
          console.log(dataset1[i].id);
          if (dataset1[i].type === "on/off") {
		  console.log("TRUE"+dataset1[i].id);
		  dataLine1.append("text")
		      .attr("transform", function(d) { return "translate(0," + y1(pos) + ")"; })
		      .attr("x", -25)
		      .attr("dy", "0.35em")
		      .style("font", "15px sans-serif")
		      .text("Off");
		  pos = pos + ON_OFF_HEIGHT;
	  } else {
		onlyOnOff = false;
	  }
  }

  var pos = ON_OFF_DIFF;
  for (var i=0;i<dataset1.length;i++) { 
	  // ON Texts
	  if (dataset1[i].type === "on/off") {
		  dataLine1.append("text")
		      .attr("transform", function(d) { return "translate(0," + y1(pos) + ")"; })
		      .attr("x", -25)
		      .attr("dy", "0.35em")
		      .style("font", "15px sans-serif")
		      .text("On");
		  pos = pos + ON_OFF_HEIGHT;
	  }
  }

  if (!onlyOnOff) {
    g1.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y1));
  }


  // draw legend
  var legendSpace = height1 / dataset1.length; 

  dataLine1.append("rect")
      .attr("width", 30)
      .attr("height", 30)                                    
      .attr("x", width1 - 35) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .attr("fill",function(d) {
        return d.visible ? z1(d.id) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
      })
      .attr("class", "legend-box")
      .on("click", function(d){ // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        dataLine1.select("path")
          .transition()
          .attr("d", function(d){
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
          })

        dataLine1.select("rect")
          .transition()
          .attr("fill", function(d) {
          return d.visible ?  z1(d.id) : "#F1F1F2";
        });
      })

  dataLine1.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("x", width1 - 35) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .style("font", "10px sans-serif")
      .attr("dy", "-0.5em")
      .style("stroke", function(d) { return z1(d.id); })
      .text(function(d) { return d.id; });

}

function type(d, _, columns) {
  var parseTime = d3.timeParse("%Y %m %d %H:%M:%S");
  d.Timestamp = parseTime(d.Timestamp);
  var pos = 0;
  for (var i = 1, n = columns.length, c; i < n; ++i) {
 	if (columns[i].endsWith(";on/off")) {
          if (d[columns[i]]=="on") d[columns[i]]=pos+3;
          if (d[columns[i]]=="off") d[columns[i]]=pos;
          pos=pos+ON_OFF_HEIGHT;
	}
	d[c = columns[i]] = +d[c];
  }
  return d;
}
