(function() {
  this.CSLESocket = function(doc, url) {
    this.doc = doc;
    this.url = url;
    this.ws = new WebSocket(url + "/docs/" + doc);
    this.event_handlers = {};

    this.ws.onmessage = this.on_event(this);
  };

  this.CSLESocket.prototype.send = function(event, data, backend_handled) {
    if (this.ws.readyState != 1) return;
    var msg_string = JSON.stringify({event: event, data: data});
    if (backend_handled) {
      // HACK: special prefix to let the backend server know that this is for it
      msg_string = '!' + msg_string;
    }
    this.ws.send(msg_string);
  };

  this.CSLESocket.prototype.on = function(event, fun) {
    this.event_handlers[event] = fun;
  };

  this.CSLESocket.prototype.on_event = function(self) {
    return function(res) {
      var msg = JSON.parse(res.data);
      self.event_handlers[msg.event](msg.data);
    };
  };
})(this);
