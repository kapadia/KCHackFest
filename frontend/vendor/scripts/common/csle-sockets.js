(function() {
    this.CSLESocket = function(doc, url) {
	this.doc = doc
	this.url = url
	this.ws = new WebSocket(url + "/docs/" + doc)
	this.event_handlers = {}

	this.ws.onmessage = this.on_event(this)
    }

    this.CSLESocket.prototype.send = function(event, data) {
	this.ws.send(JSON.stringify({event: event, data: data}))
    }

    this.CSLESocket.prototype.on = function(event, fun) {
	this.event_handlers[event] = fun
    }

    this.CSLESocket.prototype.on_event = function(self) {
	return function(res) {
	    var msg = JSON.parse(res.data)
	    self.event_handlers[msg.event](msg.data)
	}
    }

})(this);
