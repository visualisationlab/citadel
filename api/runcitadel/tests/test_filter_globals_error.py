from runcitadel import filter_globals

import types
import pytest

x = 3

def test_filter_globals_error():
    def a(): return x

    with pytest.raises(Exception):
        fun = types.FunctionType(a.__code__, filter_globals(a),
                                 a.__name__,
                                 a.__defaults__,
                                 a.__closure__)

        fun()
