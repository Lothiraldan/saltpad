python-pip:
    pkg.installed:
        - refresh_modules: true

salt-api:
    pkg:
        - installed
    service.running:
        - require:
            - pkg: salt-api
