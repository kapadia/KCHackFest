function CSLESocket(doc, url) {
    this.doc = doc
    this.url = url
    this.ws = new WebSocket(url)
    this.event_handlers = {}

    ws.onmessage = this.on_event
}

CSLESocket.prototype.send = function(event, data) {
    ws.send({event: event, data: data})
}

CSLESocket.prototype.on = function(event, fun) {
    this.event_handlers[event] = fun
}

CSLESocket.prototype.on_event = function(msg) {
    this.event_handlers[msg.event](msg.data)
}
