/* Very simplistic WebSockets server implementation.
 * Will not handle multi frame messages or messages with
 * a length greater than 126.
 *  Also only handles text frames 
 */
var http   = require('http'),
    fs     = require('fs'),
    rl     = require('readline'),
    crypto = require('crypto');


// HTTP server serving up the index page
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('ws.html', function(err, data) {
     res.end(data); 
    });
});


// The GUID from http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17
var WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

// Respond to an upgrade header. For simplicity suppose all upgrades are
// WebSocket requests
server.on('upgrade', function(req, sock, head) {
  // Create the sha for the WebSocket-Accept header
  var key = req.headers['sec-websocket-key'];
  var sha = crypto.createHash('sha1');
  sha.update(key + WS_GUID);

  // Write the WebSockets handshake
  sock.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    "Sec-WebSocket-Accept: " + sha.digest('base64') + "\r\n\r\n"
  );
  sock.setTimeout(0);
  sock.setNoDelay(true);

  // Start sending messages typed from the console
  sendMessage(sock);

  // Log incomming messages to the console
  sock.on('data', function(data) {
    var text = unmask(data);
    console.log(text);
  });

});


var ui = rl.createInterface(process.stdin, process.stdout, null);

var sendMessage = function(sock) {
  ui.question("Send a message: ", function(msg) {
    // Put the msg in a buffer
    var buffer = new Buffer(msg);

    // This buffer will hold our frame - need 2 extra bytes for the
    // opcode and the frame length
    var output = new Buffer(buffer.length + 2);


    // Set the first byte to 1000 0001
    // First bit indicates that this is the last frame
    // the last bit indicates that this is a "text" frame
    output[0] = 0x81;

    // Set the second byte to the length of the message
    // This will break all the things if the message is too long
    output[1] = buffer.length;

    // Copy the messages into the rest of the output buffer
    buffer.copy(output, 2);

    // Write the message and start sending another one
    sock.write(output, 'binary');
    sendMessage(sock);
  });
};


// Messages coming from the client are masked to make sure they cant
// be used to spoof HTTP messages and poison intermediary caches unaware
// of the Upgrade header
var unmask = function (data) {
    // Get the second byte and discard the first bit
    // This is the length of the message (unless the message it long)
    var length = data[1] & 0x7f;

    // Create a buffer to hold the mask key
    var mask = new Buffer(4);

    // Create a buffer to hold the payload of the frame
    var payload = new Buffer(length);

    // Copy byte 2 to 6 into the mask buffer. These 4 bytes are the
    // masking key
    data.copy(mask, 0, 2, 6);

    // Copy the rest of the frame into the payload buffer
    data.copy(payload, 0, 6);

    // For each byte in the payload buffer do an xor with the
    // corresponding byte of the masking key
    for (var i=0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }

    // Return the payload as an utf8 string (this server only handles
    // "text" frames
    return payload.toString('utf8');
}

server.listen(1337, "127.0.0.1");
