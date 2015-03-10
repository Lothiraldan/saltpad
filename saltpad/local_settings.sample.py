# TODO: If salt-master is not in localhost, uncomment and change API URL
#API_URL = 'https://YOURSALTMASTER.net'
# TODO: Generate a random key with os.urandom(24)
SECRET_KEY = ''

# Uncomment next line if you want to add sentry support
# You'll also need to install raven[flask]
# SENTRY_DSN = "https://YOUR_SENTRY_DSN"

# Uncomment next line if your API use a self-signed HTTPS certificate
# VERIFY_SSL = False

# You can make saltpad bind 0.0.0.0 (all server address) but you should
# only bind 0.0.0.0 for testing purposes, you should really deploy
# saltpad in production using a wsgi server (like gunicorn or chaussette)
# behind nginx, you have been warned!
# HOST = "0.0.0.0"

# You can customize the external auth module to use, by default, pam is used
# EAUTH = "pam"
