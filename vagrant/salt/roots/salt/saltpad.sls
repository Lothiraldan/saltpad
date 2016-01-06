nginx:
    pkg:
        - installed
    service.running:
        - enable: True
        - reload: True
    file.absent:
        - name: /etc/nginx/sites-enabled/default
        - watch_in:
            - service: nginx

saltpad:
    archive.extracted:
        - name: /opt/saltpad
        - source: https://github.com/tinyclues/saltpad/releases/download/v0.1/dist.zip
        - source_hash: md5=8dc18a0821e0a745cc5dc425e2ea05a6
        - archive_format: zip
        - user: www-data
        - if_missing: /opt/saltpad/inexistent
        - require:
            - pkg: nginx

saltpad_config:
    file.managed:
        - name: /opt/saltpad/settings.json
        - source: salt://settings.json
        - require:
            - archive: saltpad

saltpad_site:
    file.managed:
        - name: /etc/nginx/sites-enabled/saltpad
        - source: salt://saltpad.site
        - template: jinja
        - watch_in:
            - service: nginx
