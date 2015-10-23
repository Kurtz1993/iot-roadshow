var uriDB = 'mongodb://localhost/IoT';
var express = require("express");
var path = require("path");
var mosca = require('mosca');
var mongo = require('mongodb');
var mongoose = require('mongoose').connect(uriDB);
var webServer = express();
var Schema = mongoose.Schema;
var MongoClient = mongo.MongoClient;
var datosCollection = null;
var mqtt = null;

MongoClient.connect(uriDB, function (err, db) {
	if (err) {
		console.log(err);
	} else {
		datosCollection = db.collection('datos');
	}
});

var publiched = new Schema({
	topic: String,
	value: String,
	stamp: Date
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

webServer.get("/data", function (req, res) {
	var responseData = {
		success: false,
		data: null
	};
	/**
	 * Get latest data from uv and temp topics
	 */
	datosCollection.find({ topic: "/uv" }, { _id: 0 }).sort({ stamp: -1 }).limit(1).toArray(function (err, docs) {
		if (err) {
			responseData.data = "Ha ocurrido un error. Intente de nuevo más tarde.";
		} else {
			responseData.data = [];
			responseData.data.push(docs[0]);
			datosCollection.find({ topic: "/temp" }, { _id: 0 }).sort({ stamp: -1 }).limit(1).toArray(function (err, docs) {
				if (err) {
					responseData.data = "Ha ocurrido un error. Intente de nuevo más tarde.";
				} else {
					responseData.data.push(docs[0]);
					responseData.success = true;
					res.send(responseData);
				}
				});
		}
	});
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
	webServer.listen(4500, function () { console.log("Web server running on port 4500") });
}