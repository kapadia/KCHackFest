import tornado.web
import json
import sys
from collections import defaultdict
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler


class Client:
  def __init__(self, conn, is_pilot=False, can_broadcast=True):
    self.can_broadcast = can_broadcast
    self.conn = conn
    self.is_pilot = is_pilot

  def send(self, msg):
    try:
      self.conn.write_message(msg)
    except: pass

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
    c.can_broadcast = False
    c.send(json.dumps({'event':'pilot-changed','data':True}))


def release_pilot(conn, data):
  if not doc_pilots[conn.doc] or not conn.client.is_pilot:
    return  # no sense releasing if there isn't one
  conn.client.is_pilot = False
  doc_pilots[conn.doc] = False
  for c in doc_clients[conn.doc]:
    c.can_broadcast = True
    c.send(json.dumps({'event':'pilot-changed','data':False}))


def can_i_pilot(conn, data):
  i_cannot = doc_pilots[conn.doc] and not conn.client.is_pilot
  conn.write_message(json.dumps({'event':'pilot-changed','data':i_cannot}))


def list_users(conn, data):
  users = dict((k,len(v)) for k,v in doc_clients.iteritems())
  msg = {'event': 'list-users', 'data': users}
  conn.write_message(json.dumps(msg))


special_handlers = {
    'take-pilot': take_pilot,
    'release-pilot': release_pilot,
    'can-i-pilot': can_i_pilot,
    'list-users': list_users,
}


class InteractionHandler(WebSocketHandler):
  '''Handles all websocket connections and messages'''
  def open(self, doc):
    self.doc = doc
    self.client = Client(self, can_broadcast=(not doc_pilots[doc]))
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
    release_pilot(self, None)
    doc_clients[self.doc].remove(self.client)


application = tornado.web.Application([
    (r"/docs/(.+)", InteractionHandler),
])


if __name__ == "__main__":
  # parse an optional port number from the command line
  if len(sys.argv) > 1:
    try:
      port = int(sys.argv[1])
    except:
      print "Usage: %s [port]" % sys.argv[0]
      sys.exit(1)
  else:
    port = 8898
  assert 999 < port < 100000, "invalid port number (%d)" % port

  # start listening
  application.listen(port)
  print "server started, listening on port %d" % port
  IOLoop.instance().start()
