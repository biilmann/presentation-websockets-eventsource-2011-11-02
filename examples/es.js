/* Simple EventSource server */
var http = require('http'),
    fs   = require('fs'),
    rl   = require('readline');


var ui = rl.createInterface(process.stdin, process.stdout, null);

http.createServer(function (req, res) {
  if (req.url == "/") { // Index page - server es.html
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('es.html', function(err, data) {
     res.end(data); 
    });
  } else if (req.url == "/es") { // EventSource request, serve an eventstream
    res.writeHead(200, {'Content-Type': 'text/event-stream'});
    // Note - we never end the request
    sendMessage(res);
  }
}).listen(1337, "127.0.0.1");


var sendMessage = function(res) {
  ui.question("Send a message: ", function(msg) {
    // Send a message from the console to the client
    res.write("data: " + msg + "\n\n");
    sendMessage(res);
  });
};
