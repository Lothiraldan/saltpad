git:
    pkg.installed:
        - module_refresh: True

saltpad_git:
    git.latest:
        - name: https://github.com/tinyclues/saltpad.git
        - target: '/home/vagrant/saltpad'

saltpad_requirements:
    pip.installed:
        - requirements: /home/vagrant/saltpad/requirements.txt
        - require:
            - sls: saltapi
            - git: saltpad_git

chaussette:
    pip.installed:
        - require:
            - sls: saltapi

run_saltad:
    cmd.run:
        - name: "setsid chaussette saltpad.app:app --host 0.0.0.0 --port 5000 >/tmp/saltpad.log 2>&1 < /dev/null &"
        - cwd: "/home/vagrant/saltpad"
        - require:
            - pip: saltpad_requirements
