from runcitadel import send_message
from unittest.mock import patch
import pytest

@patch('websockets.WebSocketClientProtocol')
def test_send_message_error_logtype(ws):
    ws.closed = False

    ws.send.return_value = None

    with pytest.raises(ValueError):
        send_message(ws, "test", "err")


@patch('websockets.WebSocketClientProtocol')
def test_send_message_error_messagelength(ws):
    ws.closed = False

    ws.send.return_value = None

    with pytest.raises(ValueError):
        send_message(ws, "", "log")


@patch('websockets.WebSocketClientProtocol')
def test_send_message_error_messagelength2(ws):
    ws.closed = False

    ws.send.return_value = None

    with pytest.raises(ValueError):
        send_message(ws, 't' * 101, "log")

@patch('websockets.WebSocketClientProtocol')
def test_send_message_closed(ws):


    with pytest.raises(ValueError):
        send_message(ws, "test", "log")
