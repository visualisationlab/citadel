from runcitadel import send_message
from unittest.mock import patch

def test_send_message():
    assert send_message

@patch('websockets.WebSocketClientProtocol')
def test_send_message_logtype(ws):
    ws.closed = False

    send_message(ws, "test", "log")


@patch('websockets.WebSocketClientProtocol')
def test_send_message_logtype_warning(ws):
    ws.closed = False

    send_message(ws, "test", "warning")


