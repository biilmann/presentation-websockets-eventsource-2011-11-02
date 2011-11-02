var http = require('http'),
    fs   = require('fs'),
    rl   = require('readline');

var ui = rl.createInterface(process.stdin, process.stdout, null);
http.createServer(function (req, res) {
  if (req.url == "/") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('long-server.html', function(err, data) {
     res.end(data); 
    });
  } else if (req.url == "/poll") {
    ui.question("Send a message: ", function(answer) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(answer);
    });
  }
}).listen(1337, "127.0.0.1");
