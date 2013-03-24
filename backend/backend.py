import tornado.web
import json
from collections import defaultdict
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler


class Client:
  def __init__(self, conn, is_pilot=False):
    self.can_broadcast = True
    self.conn = conn
    self.is_pilot = is_pilot

  def send(self, msg):
    self.conn.write_message(msg)

# process-global set of per-document connected clients
doc_clients = defaultdict(set)
# toggles whether we're in pilot mode
doc_pilots = defaultdict(bool)


def take_pilot(conn, data):
  if doc_pilots[conn.doc]:
    return  # the pilot must relenquish control first
  conn.client.is_pilot = True
  doc_pilots[conn.doc] = True
  for c in doc_clients[conn.doc]:
    if c.conn is conn:
      continue
    c.is_pilot = False
    c.can_broadcast =False


def release_pilot(conn, data):
  if not doc_pilots[conn.doc] or not conn.client.is_pilot:
    return  # no sense releasing if there isn't one
  conn.client.is_pilot = False
  doc_pilots[conn.doc] = False
  for c in doc_clients[conn.doc]:
    c.can_broadcast = True


def list_users(conn, data):
  users = dict((k,len(v)) for k,v in doc_clients.iteritems())
  msg = {'event': 'list-users', 'data': users}
  conn.write_message(json.dumps(msg))


special_handlers = {
    'take-pilot': take_pilot,
    'release-pilot': release_pilot,
    'list-users': list_users,
}


class InteractionHandler(WebSocketHandler):
  '''Handles all websocket connections and messages'''
  def open(self, doc):
    self.doc = doc
    self.client = Client(self)
    doc_clients[doc].add(self.client)

  def on_special(self, msg):
    data = json.loads(msg)
    special_handlers[data['event']](self, data)

  def on_message(self, msg):
    if msg[0] == u'!':
      self.on_special(msg[1:])
      return

    # don't pass it on if we're muted
    if not self.client.can_broadcast:
      return

    # broadcast to all the other clients
    for c in doc_clients[self.doc]:
      if c.conn is not self:
        c.send(msg)

  def on_close(self):
    doc_clients[self.doc].remove(self.client)


application = tornado.web.Application([
    (r"/docs/(.+)", InteractionHandler),
])


if __name__ == "__main__":
  application.listen(8888)
  IOLoop.instance().start()
