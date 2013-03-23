import tornado.web
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler


# process-global set of connected clients
clients = set()


class InteractionHandler(WebSocketHandler):
  '''Handles all websocket connections and messages'''
  def open(self):
    clients.add(self)

  def on_message(self, msg):
    for c in clients:
      if c is not self:
        c.write_message(msg)

  def on_close(self):
    clients.remove(self)


application = tornado.web.Application([
  (r"/", InteractionHandler),
])


if __name__ == "__main__":
  application.listen(8888)
  IOLoop.instance().start()

