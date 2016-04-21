# Make apache accessible from internet

Now that your apache configuration works locally, let's make it accessible from the internet.

## Configure ssl

If you want to access saltpad and your salt-api over the internet, you're likely to want to configure SSL on apache.

Your configuration should currently looks like:

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

Mozilla has a very nice [ssl generator website](https://mozilla.github.io/server-side-tls/ssl-config-generator/) that could helps tweak your apache configuration, but here is a most secure apache configuration for reference:

```apache
<VirtualHost *:443>
    SSLEngine on
    SSLCertificateFile      /path/to/signed_certificate_followed_by_intermediate_certs
    SSLCertificateKeyFile   /path/to/private/key
    SSLCACertificateFile    /path/to/all_ca_certs


    # HSTS (mod_headers is required) (15768000 seconds = 6 months)
    Header always set Strict-Transport-Security "max-age=15768000"

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

# modern configuration, tweak to your needs
SSLProtocol             all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite          ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256
SSLHonorCipherOrder     on
SSLCompression          off
SSLSessionTickets       off

# OCSP Stapling, only in httpd 2.3.3 and later
SSLUseStapling          on
SSLStaplingResponderTimeout 5
SSLStaplingReturnResponderErrors off
SSLStaplingCache        shmcb:/var/run/ocsp(128000)
```

You will need a ssl certificate for activating ssl, you can either buy one, generate one or use [let's encrypt](https://letsencrypt.org/) for generating one.

In the configuration above, the saltpad configuration is left blank (...), it's because it's not ssl dependent, please see below for the saltpad / salt-api configuration.

## Salt-api configuration

Saltpad requires to access to salt-api in order to work. For the moment, salt-api only listen to localhost connections and it's a good thing.

We will need to "proxy" requests from apache to salt-api on a specific URL, let's choose "/api", your configuration should now looks like:

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

  # Salt-api specific
  <Location "/api/">
    ProxyPass "http://localhost:8000/"
  </Location>

</VirtualHost>
```

You need to be sure that the port in the ProxyPass line match the port you configure for salt-api.

For an ssl-enabled configuration, it's similar, just add the `# Salt-api specific` part above the `# Saltpad specific` part.

Now reload the configuration:

```bash
sudo a2ensite saltpad
sudo service apache2 reload
```

From your salt-master, let's check that the configuration works correctly.

If you have enabled ssl, replace `http://localhost/` by `https://SALTPAD.YOURDNS/` in below commands.

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

Check that apache correctly proxy request to salt-api on the choosen URL:

```
curl http://localhost/api/
```

Should match the output of:

```
curl http://localhost:8000/ # Salt-api port
```

## Saltpad configuration

Now that your salt-api instance is accessible from internet (don't forget to open the port and whitelist your IPs if necessary), we need to tweak the saltpad configuration a little.

You will need to change `API_URL` to match the DNS of your salt-api server (in our example it was `SALTPAD.YOURDNS`).

If you enabled ssl, you will also need to set `SECURE_HTTP` to `true` or saltpad will try to connect over a non encrypted connection.

You don't need to reload the webserver, just save the `settings.json` file and go at `http://SALTPAD.YOURDNS/` or `https://SALTPAD.YOURNDS/` to access Saltpad and start mastering your Saltstack environment.
