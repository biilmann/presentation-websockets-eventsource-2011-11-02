/* Barebones long polling server */
var http = require('http'),
    fs   = require('fs'),
    rl   = require('readline');


/* We use this to grab messages from the console */
var ui = rl.createInterface(process.stdin, process.stdout, null);

http.createServer(function (req, res) {
  if (req.url == "/") { // Serve the index page
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('long.html', function(err, data) {
     res.end(data); 
    });
  } else if (req.url == "/poll") { // Serve the long polling messages
    ui.question("Send a message: ", function(msg) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(msg);
    });
  }
}).listen(1337, "127.0.0.1");
