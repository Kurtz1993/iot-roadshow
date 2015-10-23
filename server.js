var express = require("express");
var path = require("path");
var webServer = express();
var mosca = require('mosca');
var uriDB = 'mongodb://localhost/IoT'
var mongoose = require('mongoose').connect(uriDB);
var Schema = mongoose.Schema;
var mqtt = null;

var publiched = new Schema({
	topic : String,
	value : String,
	stamp : Date	
});
var Datos = mongoose.model('Datos', publiched);

var moscaSettings = {
	port: 8080,
};

// Server static folders settings
webServer.set("views", path.join(__dirname, "views"));
webServer.set("view engine", "jade");
webServer.use(express.static(path.join(__dirname, "public")));

webServer.get('/', function (req, res) {
	res.render("index");
});

mqtt = new mosca.Server(moscaSettings);
mqtt.on('clientConnected', function (client) {
	console.log('Client connected: ', client.id);
});

mqtt.on('clientDisconnected', function (client) {
	console.log('clientDisconnected : ', client.id);
});

mqtt.on('published', function (packet, client) {
	console.log('Published MIO: ', packet.payload.toString());
	var datos = {
		topic: packet.topic.toString(),
		value: packet.payload.toString(),
		stamp: Date.now()
	};
	var publish = new Datos(datos);
	publish.save();
});

mqtt.on('ready', setup);

function setup() {
	console.log('MQTT server is up and running at port 8080');
	webServer.listen(4500, function (){ console.log("Web server running on port 4500") });
}