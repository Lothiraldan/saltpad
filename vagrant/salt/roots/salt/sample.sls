working_file:
    file.managed:
        - name: /etc/working_file
        - content: "Working file"

changing_file:
    file.managed:
        - name: /etc/changing_file
        - content: "{{ salt['status.uptime'] }}"

bad_file:
    file.managed:
        - name: /etc/bad_file
        - content: "Username doesn't exists"
        - user: inexistant

dependency_file:
    file.managed:
        - name: /etc/dependency_file
        - content: "Missing dependency"
        - require:
            - file: bad_file
