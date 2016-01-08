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
        - source_hash: md5=033298b717027f2b84b6180e7c973807
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
