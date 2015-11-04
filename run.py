import sys
from saltpad.app import app

host = app.config['HOST']

if host == '0.0.0.0' and not '--insecure-debug-run' in sys.argv:
    print ("You try to run saltpad in debug mode, please confirm by adding --insecure-debug-run option")
    sys.exit(1)

if host == '0.0.0.0':
    print ("""Please be adviced that saltpad is running in debug mode and """
           """listening to 0.0.0.0 which is very dangerous. If you're not """
           """100% hundred sure of what to do, exit now.""")

app.run(debug=True, host=app.config['HOST'])
