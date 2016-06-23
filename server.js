var http = require('http');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./public");

var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});
server.listen(5002);
console.log("Server started");

var connections = [];

var WebSocketServer = require('websocket').server;
// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    var index = connections.indexOf(connection);
    if(index === -1) {
        connections.push(connection);
        console.log("pushed..");
    }
    console.log("Web socket connection...");
    //we'll handle all messages from users here.

    connection.on('message', function(message) {
        var msg = JSON.parse(message.utf8Data);
        msg.sender = msg.data.split(":")[0];
        msg.data = msg.data.split(":")[1];
        console.log(msg);
        if (message.type === 'utf8') {
            // process WebSocket message
            connections.forEach(function(entry) {
                entry.sendUTF(JSON.stringify(msg));
            });
        }
    });

    connection.on('close', function(connection) {
        // close user connection
        var index = connections.indexOf(connection);
        if(index != -1) {
            connections.splice(index, 1);
        }
    });
});