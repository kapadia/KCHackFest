import tornado.web
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler

# process-global set of per-document connected clients
doc_clients = {}

class MainHandler(tornado.web.RequestHandler):
  def get(self):
    self.write("Hello World")

class InteractionHandler(WebSocketHandler):
  """
  Handles all websocket connections and messages
  """

  def open(self, doc):
    print 'Connection opened!'
    self.doc = doc
    if doc not in doc_clients:
      doc_clients[doc] = set()
    doc_clients[doc].add(self)
    print 'Connections: %s' % doc_clients

  def on_message(self, msg):
    for c in doc_clients[self.doc]:
      if c is not self:
        c.write_message(msg)

  def on_close(self):
    print 'Connection closed!'
    doc_clients[self.doc].remove(self)
    print 'Connections: %s' % doc_clients


application = tornado.web.Application([
  (r"/(.+)", InteractionHandler),
  (r"/", MainHandler),
])


if __name__ == "__main__":
  application.listen(8888)
  IOLoop.instance().start()
