import express					=	require("express");
import path							=	require("path");
import mosca						=	require("mosca");
import mongo						=	require("mongodb");
import mongoose					=	require("mongoose");
var MongoClient					=	mongo.MongoClient;
var uriDB: string 			= "mongodb://localhost/IoT";
var mongooseConnection 	=	mongoose.connect(uriDB);
var Schema 							= mongoose.Schema;
var webServer						= express();
var datosCollection:mongo.Collection;
var mqtt:any;

// Creates an object that holds the datos collection.
MongoClient.connect(uriDB, (err, db) => {
	if (err) {
		console.log(err);
	} else {
		datosCollection = db.collection("datos");
	}
});

// Mongoose Schema for the published data.
var publishedData	=	new Schema({
	topic: String,
	value: String,
	stamp: Date
});

var Datos = mongoose.model("Datos", publishedData);

// Settings for the MQTT server.
var moscaSettings = {
	port: 8080,
};

// Web server static folder settings.
webServer.set("views", path.join(__dirname, "views"));
webServer.set("view engine", "jade");
webServer.use(express.static(path.join(__dirname, "public")));

// CORS configuration for the API.
webServer.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// API call that returns the latest uv and temperature data.
webServer.get("/data", (req, res) => {
	var responseData = {
		success: false,
		data: null
	};
	
	datosCollection.find({ topic: "/uv" }, { _id: 0 }).sort({ stamp: -1 }).limit(1).toArray((err, docs) => {
		if (err) {
			responseData.data = "Ha ocurrido un error. Intente de nuevo más tarde.";
		} else {
			responseData.data = [];
			responseData.data.push(docs[0]);
			datosCollection.find({ topic: "/temp" }, { _id: 0 }).sort({ stamp: -1 }).limit(1).toArray((err, docs) => {
				if (err) {
					responseData.data =	"Ha ocurrido un error. Intente de nuevo más tarde.";
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

// MQTT events.
mqtt.on("clientConnected", (client) => {
	console.log("Client connected: ", client.id);
});

mqtt.on("clientDisconnected", (client) => {
	console.log("Client disconnected: ", client.id);
});

mqtt.on("published", (packet, client) => {
	console.log("Published: ", packet.payload.toString(), " on topic: ", packet.topic.toString());
	var datos = {
		topic: packet.topic.toString(),
		value: packet.payload.toString(),
		stamp: Date.now()
	};
	
	var newData = new Datos(datos);
	newData.save();
});

mqtt.on("ready", setup);

function setup() {
	console.log('MQTT server is up and running at port 8080');
	webServer.listen(4500, function () { console.log("Web server running on port 4500") });
}