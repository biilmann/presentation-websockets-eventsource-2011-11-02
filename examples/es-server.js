var http = require('http'),
    fs   = require('fs'),
    rl   = require('readline');

var ui = rl.createInterface(process.stdin, process.stdout, null);
http.createServer(function (req, res) {
  if (req.url == "/") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('es-server.html', function(err, data) {
     res.end(data); 
    });
  } else if (req.url == "/es") {
    res.writeHead(200, {'Content-Type': 'text/event-stream'});
    sendMessage(res);
  }
}).listen(1337, "127.0.0.1");

var sendMessage = function(res) {
  ui.question("Send a message: ", function(msg) {
    res.write("data: " + msg + "\n\n");
    sendMessage(res);
  });
};
