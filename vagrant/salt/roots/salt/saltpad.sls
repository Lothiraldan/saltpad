nginx:
    pkg:
        - installed
    service.running:
        - enable: True
        - reload: True

git:
    pkg.installed:
        - module_refresh: True

saltpad_git:
    git.latest:
        - name: https://github.com/tinyclues/saltpad.git
        - target: /opt/saltpad
        - rev: saltpad_v2

saltpad_config:
    file.managed:
        - name: /opt/saltpad/settings.json
        - source: salt://settings.json

saltpad_site:
    file.managed:
        - name: /etc/nginx/sites-enabled/saltpad
        - source: salt://saltpad.site
        - template: jinja
        - watch_in:
            - service: nginx
