python-pip:
    pkg.installed:
        - refresh_modules: true

salt-api:
    pip.installed:
        - require:
            - pkg: python-pip

cherrypy:
    pip.installed:
        - require:
            - pkg: python-pip

salt-api-run:
    cmd.run:
        - name: "salt-api -d"
        - require:
            - pip: salt-api
