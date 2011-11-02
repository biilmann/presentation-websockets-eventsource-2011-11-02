var http   = require('http'),
    fs     = require('fs'),
    rl     = require('readline'),
    crypto = require('crypto');

var ui = rl.createInterface(process.stdin, process.stdout, null);
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('ws-server.html', function(err, data) {
     res.end(data); 
    });
});

var WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


server.on('upgrade', function(req, sock, head) {
  var key = req.headers['sec-websocket-key'];
  var sha = crypto.createHash('sha1');
  sha.update(key + WS_GUID);

  sock.write("HTTP/1.1 101 Switching Protocols\r\n" +
             "Upgrade: websocket\r\n" +
             "Connection: Upgrade\r\n" +
             "Sec-WebSocket-Accept: " + sha.digest('base64') + "\r\n\r\n");

  sock.setTimeout(0);
  sock.setNoDelay(true);

  sendMessage(sock);

  sock.on('data', function(data) {
    var text = unmask(data);
    console.log(text);
  });

});

var sendMessage = function(sock) {
  ui.question("Send a message: ", function(msg) {
    var buffer = new Buffer(msg),
        output = new Buffer(buffer.length + 2);

    output[0] = 0x81;
    output[1] = buffer.length;
    buffer.copy(output, 2);

    sock.write(output, 'binary');
    sendMessage(sock);
  });
};

var unmask = function (data) {
    var length = data[1] & 0x7f;
    var mask = new Buffer(4);
    var payload = new Buffer(length);
    data.copy(mask, 0, 2, 6);
    data.copy(payload, 0, 6);

    for (var i=0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }

    return payload.toString('utf8');
}

server.listen(1337, "127.0.0.1");
