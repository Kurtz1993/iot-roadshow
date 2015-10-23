var express = require("express");
var path = require("path");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// Server static folders settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function (req, res) {
	res.render("index");
});

app.listen(3000, function(){
	console.log("Listening at port 3000")
})