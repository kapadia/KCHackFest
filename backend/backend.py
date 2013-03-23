import tornado.web
import json
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler

class Client:
  def __init__(self, conn):
    self.can_broadcast = True
    self.conn = conn

  def send(msg):
    self.conn.write_message(msg)

# process-global set of per-document connected clients
doc_clients = {}

class InteractionHandler(WebSocketHandler):
  '''Handles all websocket connections and messages'''
  def open(self, doc):
    self.doc = doc
    self.client = Client(self)

    if doc not in doc_clients:
      doc_clients[doc] = set()

    doc_clients[doc].add(self.client)


  def on_message(self, msg):
    if not self.client.can_broadcast:
      return

    for c in doc_clients[self.doc]:
      if c.conn is not self:
        c.send(msg)

  def on_close(self):
    doc_clients[self.doc].remove(self.client)


class DocsHandler(tornado.web.RequestHandler):
  def get(self):
    docs = {k:{"users": len(v)} for k,v in doc_clients.iteritems()}
    self.write(json.dumps(docs))

application = tornado.web.Application([
  (r"/docs/(.+)", InteractionHandler),
  (r"/docs", DocsHandler),
])


if __name__ == "__main__":
  application.listen(8888)
  IOLoop.instance().start()
