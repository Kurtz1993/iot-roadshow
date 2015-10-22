var mosca = require('mosca');
var moscaSettings = {
	port: 8080,
};

var message = {
	topic: '/test',
	payload: 'Test message...',
	qos: 1,
	retain: false
};

var server = new mosca.Server(moscaSettings);

server.on('clientConnected', function (client) {
	console.log('Client connected: ', client.id);
});

server.on('clientDisconnected', function (client) {
	console.log('clientDisconnected : ', client.id);
});

server.on('published', function (packet, client) {
	console.log('Published MIO: ', packet.payload.toString());
});

server.on('ready', setup);

function setup() {
	console.log('Mosca is up and running at port 1883');
	setInterval(function () {
		server.publish(message, function () {
			console.log('Published message');
		});
	}, 5000);
}