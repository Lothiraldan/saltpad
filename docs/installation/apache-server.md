# Serve saltpad with apache

## Install apache

apache is packaged in most OSes, install it on your salt-master with your favorite package manager:

```bash
apt-get install apache2
```

## Configure apache

Once you have a configurated salt-api and saltpad files unzipped in a directory, we can now configure apache to serve theses files and makes them available for web browsers.

If you have extracted saltpad to the directory `/code/saltpad`, a very basic apache configuration that will serve saltpad is located just below, you need to place it in /etc/apache2/sites-available/saltpad.conf:

```apache
<VirtualHost *:80>
  ServerName saltpad.example.com
  ServerAdmin webmaster@example.com
  LogLevel warn
  ErrorLog "/var/log/apache2/saltpad-error.log"
  CustomLog "/var/log/apache2/saltpad-access.log" combined

  # Saltpad specific
  DocumentRoot /code/saltpad
  <Directory "/code/saltpad">
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !index
    RewriteRule (.*) /index.html [L]
    #FallbackResource /index.html
  </Directory>

</VirtualHost>
```

Note: the much simpler 'FallbackResource' which does not require mod_rewrite, requires apache/httpd version >= 2.2.16.

Enable the site and reload apache:
```bash
sudo a2ensite saltpad
sudo service apache2 reload
```

__Warning, the previous example configurations ARE NOT SUITABLE for production, you will need to configure ssl for production environment so don't open the webserver to the whole web yet, we will configure ssl later.__

You will need to change the root path if you deployed saltpad elsewhere and the server_name to point to the DNS name of your salt-master.

## Check configuration

We can now check that everything should works correctly.

Check that apache serves saltpad correclty:

```
curl http://localhost/
```

Expected output:

```
<!doctype html>
<html lang="en" data-framework="react">
    <head>
        <meta charset="utf-8">
        <title>SaltPad</title>
    <link href="/static/styles.css" rel="stylesheet"></head>
    <body>
        <div id="app"></div>
    <script src="/static/vendors.js"></script><script src="/static/app.js"></script></body>
</html>
```

Check that apache serves saltpad config file correctly:

```
curl http://localhost/static/settings.json
```

The output should match the content of the `settings.json` file you deployed earlier.

Now it's unlickely that you have a browser on the salt-master so congratulations you now have a saltpad installation only accessible from your salt-master machine.

We will change that and allow you to access saltpad from your browser in the [next part](apache-across-internet-cors.md).
