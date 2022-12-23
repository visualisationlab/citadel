from ley import ley


def test_inputargs_default_pos():
    def x():
        return True

    try:
        ley.checkInputArgs("abc",
                               1234,
                               "test",
                               "key",
                               "Title",
                               [],
                               [],
                               x)

    except Exception as e:
        print(e)
        assert False


def test_inputargs_startParams_pos():
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
        assert False
