python-pip:
    pkg.installed:
        - refresh_modules: true

cherrypy:
    pip.installed:
        - require:
            - pkg: python-pip

salt-api:
    pkg:
        - installed
    service.running:
        - require:
            - pkg: salt-api
            - pip: cherrypy
