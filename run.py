from saltpad.app import app

app.run(debug=True, host=app.config['HOST'])
