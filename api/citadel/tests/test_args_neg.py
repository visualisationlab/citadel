from ley import ley


def test_inputargs_notitle():
    def x():
        return True

    try:
        ley.checkInputArgs("abc",
                               1234,
                               "test",
                               "key",
                               "",
                               [],
                               [],
                               x)


    except Exception as e:
        print(e)
        assert True
        return

    assert False

def test_inputargs_wrongargs():
    def x():
        return True

    try:
        ley.checkInputArgs(123,
                               "1234",
                               123,
                               123,
                               "Title",
                               [],
                               [],
                               x)

    except Exception as e:
        print(e)
        assert True
        return
    assert False


def test_inputargs_wrongstartParams():
    def x():
        return True

    startParams = [
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": 123
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        }
    ]

    try:
        ley.checkInputArgs("abc",
                                1234,
                                "test",
                                "key",
                                "Title",
                                startParams,
                                [],
                                x)

    except Exception as e:
        print(e)
        assert True
        return

    assert False



def test_inputargs_tooManyStartParams():
    def x():
        return True

    startParams = [
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        },
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        },
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        },
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        },
        {
            "attribute": "test_string",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test_number",
            "type": "number",
            "defaultValue": 1234
        },
        {
            "attribute": "test_boolean",
            "type": "boolean",
            "defaultValue": True
        }
    ]
    try:
        ley.checkInputArgs("abc",
                                1234,
                                "test",
                                "key",
                                "Title",
                                startParams,
                                [],
                                x)

    except Exception as e:
        print(e)
        assert True
        return

    assert False
