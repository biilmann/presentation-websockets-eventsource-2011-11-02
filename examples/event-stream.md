EventSource:
============

This is the simple format of an EventSource event-stream.


HTTP/1.1 200 OK
Content-Type: text/event-stream

data: This is an event

event: notification
data: This is a notification

id: 12345
data: This is an event with an id

data: Multiline event
data: Line 2




