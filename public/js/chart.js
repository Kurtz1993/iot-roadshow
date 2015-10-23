// Variables
var chart = null;
var reload = false;
var UVData = [{
		"type": "UV Index",
		"value": 0
}];
var tempData = [{
		"type": "Temperature",
		"value": 0.0
}];
var chartConfig = {
	uv:{
		title: "UV Index",
		balloonText: "UV Index: [[value]]",
		div: "UVDiv",
		color: "#ADD981"
	},
	temp: {
		title: "Temperature",
		balloonText: "Temperature: [[value]]",
		div: "tempDiv",
		color: "tomato"
	}
};

/**
 * Updates the chart with the processed data from the socket event.
 * @param type String: The type of the chart that's going to be updated.
 */
function updateChart(type) {
	// Serial chart basic data
	chart = new AmCharts.AmSerialChart();
	chart.dataProvider = (type === "uv") ? UVData : tempData;
	chart.categoryField = "type";
	if (reload === false) {
		chart.startDuration = 1;
	}
	
	// Visual settings for the chart
	chart.plotAreaBorderColor = "#DADADA";
	chart.plotAreaBorderAlpha = 1;
	chart.rotate = false;
	
	// Axes
	// Category
	var categoryAxis = chart.categoryAxis;
	categoryAxis.gridPosition = "start";
	categoryAxis.gridAlpha = 0.1;
	categoryAxis.axisAlpha = 0;
	
	// Values
	var valueAxis = new AmCharts.ValueAxis();
	valueAxis.title = "Current " + chartConfig[type].title;
	valueAxis.axisAlpha = 0;
	valueAxis.gridAlpha = 0.1;
	chart.addValueAxis(valueAxis);
	
	// Graphs
	var graph = new AmCharts.AmGraph();
	graph.type = "column";
	graph.title = chartConfig[type].title;
	graph.valueField = "value";
	graph.balloonText = chartConfig[type].balloonText;
	graph.lineAlpha = 0;
	graph.fillColors = chartConfig[type].color;
	graph.fillAlphas = 1;
	chart.addGraph(graph);
	
	// Legends
	var legend = new AmCharts.AmLegend();
	chart.addLegend(legend);
	chart.creditsPosition = "top-right";
	chart.write(chartConfig[type].div);
}

/**
 * Render the charts whenever the DOM is ready.
 */
AmCharts.ready(function () {
	updateChart("uv");
	updateChart("temp");
	reload = true;
});