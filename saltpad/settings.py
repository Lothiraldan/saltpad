from .default_settings import *

try:
    from .local_settings import *
except ImportError:
    pass
