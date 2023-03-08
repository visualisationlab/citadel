import websockets
import ssl
import pathlib
import json
from jsonschema import validate
from jsonschema import exceptions
import jsonschema

LOGTYPES = 'log', 'warning'
MESSAGE_MAXLENGTH = 100


def send_message(websocket: websockets.WebSocketClientProtocol, message: str,
                 level='log'):
    if level not in LOGTYPES:
        raise ValueError(f'Invalid log type: {level}')

    if len(message) > MESSAGE_MAXLENGTH:
        raise ValueError(f'Message is too long: {len(message)}')

    if (len(message) == 0):
        raise ValueError(f'Message is empty')

    # Check connection
    if websocket.closed:
        raise ValueError(f'Websocket connection is closed')

    message = json.dumps({
        'level': level,
        'message': message
    })

    websocket.send(message)


def finalize(websocket: websockets.WebSocketClientProtocol, msg: str):
    if (len(msg) == 0):
        raise ValueError(f'Message is empty')

    if len(msg) > MESSAGE_MAXLENGTH:
        raise ValueError(f'Message is too long: {len(msg)}')

    websocket.send(json.dumps({
        'level': 'log',
        'message': msg
    }))

    return [[], [], []]


def terminate(websocket: websockets.WebSocketClientProtocol, msg: str):
    if (len(msg) == 0):
        raise ValueError(f'Message is empty')

    if len(msg) > MESSAGE_MAXLENGTH:
        raise ValueError(f'Message is too long: {len(msg)}')

    websocket.send(json.dumps({
        'level': 'error',
        'message': msg
    }))

    return [[], [], []]


def validate_params_schema(data):
    FIELD_MINLENGTH = 1
    FIELD_MAXLENGTH = 30
    VALUE_MAXLENGTH = 100

    schema = {
        "type": "array",
        "description": "Start parameters schema",
        "items": {
            "type": "object",
            "oneOf": [
                {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": FIELD_MAXLENGTH
                        },
                        "type": {
                            "const": "string",
                            "description": "The type of the attribute"
                        },
                        "defaultValue": {
                            "type": "string",
                            "description": "The default value of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": VALUE_MAXLENGTH

                        }
                    },
                    "additionalProperties": False
                }, {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": FIELD_MAXLENGTH
                        },
                        "type": {
                            "const": "integer",
                            "description": "The type of the attribute"
                        },
                        "defaultValue": {
                            "type": "integer",
                            "description": "The default value of the attribute"
                        }
                    },
                    "additionalProperties": False
                }, {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": VALUE_MAXLENGTH
                        },
                        "type": {
                            "const": "integer",
                            "description": "The type of the attribute"
                        },
                        "defaultValue": {
                            "type": "integer",
                            "description": "The default value of the attribute"
                        },
                        "min": {
                            "type": "integer",
                            "description": "The minimum value of the attribute"
                        },
                        "max": {
                            "type": "integer",
                            "description": "The maximum value of the attribute"
                        }
                    },
                    "required": ["min", "max"],
                    "additionalProperties": False
                },
                {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": FIELD_MAXLENGTH
                        },
                        "type": {
                            "const": "float",
                            "description": "The type of the attribute",
                        },
                        "defaultValue": {
                            "type": "number",
                            "description": "The default value of the attribute"
                        }
                    },
                    "additionalProperties": False
                },
                {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": FIELD_MAXLENGTH
                        },
                        "type": {
                            "const": "float",
                            "description": "The type of the attribute",
                        },
                        "defaultValue": {
                            "type": "number",
                            "description": "The default value of the attribute"
                        },
                        "min": {
                            "type": "number",
                            "description": "The minimum value of the attribute"
                        },
                        "max": {
                            "type": "number",
                            "description": "The maximum value of the attribute"
                        },
                    },
                    "required": ["min", "max"],
                    "additionalProperties": False,
                },
                {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "string",
                            "description": "The name of the attribute",
                            "minLength": FIELD_MINLENGTH,
                            "maxLength": FIELD_MAXLENGTH
                        },
                        "type": {
                            "const": "boolean",
                            "description": "The type of the attribute"
                        },
                        "defaultValue": {
                            "type": "boolean",
                            "description": "The default value of the attribute"
                        }
                    },
                    "additionalProperties": False
                }
            ]
        }
    }

    validate(data, schema)

    if (len(data) > 10):
        raise ValueError("Start params length must be max 10")


def process_response(response, simulatefun):
    print("Processing data...")

    try:
        jsonObj = json.loads(response)

        params = {}

        for param in jsonObj['data']['params']:
            if (param['type'] == 'integer'):
                params[param['attribute']] = int(param['value'])
            elif (param['type'] == 'string'):
                params[param['attribute']] = str(param['value'])
            elif (param['type'] == 'float'):
                params[param['attribute']] = float(param['value'])
            elif (param['type'] == 'boolean'):
                params[param['attribute']] = bool(param['value'])

        print("Simulating step...")

        res = simulatefun(jsonObj['data']['nodes'],
                                jsonObj['data']['edges'], params)

        params = [res[2][param['attribute']]
                    for param in jsonObj['data']['params']]

        return res
    except Exception as e:
        print(f'Error! {e}')


async def connect(url: str,
                  port: int,
                  sid: str,
                  key: str,
                  title: str,
                  startParams: json,
                  simulatefun,
                  schema: json = None,
                  externalContext: ssl.SSLContext = None):
    """Connects API to the VisGraph server."""

    # Check if port is valid.
    if (port < 0 or port > 65535):
        raise ValueError("Port must be between 0 and 65535")

    #  Check if title is valid and larger than 0.
    if (len(title) > 50):
        raise ValueError("Title must be less than 50 characters")

    if (len(title) == 0):
        raise ValueError("Title must be at least 1 character")

    # Check if startParams is valid.
    validate_params_schema(startParams)

    uri = f"wss://{url}:{int(port)}?sid={sid}&key={key}"

    print("Connecting to {}:{}...".format(url, port))

    validator = jsonschema.Validator

    try:
        validator.check_schema(schema)

        has_schema = True
    except Exception as e:
        has_schema = False

    context = True

    if (externalContext is not None):
        context = externalContext

    async with(websockets.connect(uri, max_size=2 ** 25, ssl=context)) as websocket:
        print("Connected")

        await websocket.send(json.dumps({
            'sessionID': sid,
            'messageSource': 'simulator',
            'messageType': 'set',
            'dataType': 'register',
            'apiKey': key,
            'data': json.dumps(startParams),
            'validator': has_schema,
            'title': title,
        }))

        while (1):
            response = await websocket.recv()

            result = process_response(response, simulatefun)

            await websocket.send(json.dumps({
                'sessionID': sid,
                'messageSource': 'simulator',
                'messageType': 'set',
                'dataType': 'data',
                'apiKey': key,
                'params': {
                    'nodes': result[0],
                    'edges': result[1],
                    'params': result[2]
                },
            }))
