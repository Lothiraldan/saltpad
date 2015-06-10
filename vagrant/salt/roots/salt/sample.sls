working_file:
    file.managed:
        - name: /etc/working_file
        - contents: "Working file"

changing_file:
    file.managed:
        - name: /etc/changing_file
        - contents: "{{ salt['status.uptime'] }}"

unicode_character:
    cmd.run:
        - name: 'echo -e "\xE2\x98\xA0"'
        - shell: /bin/bash

bad_file:
    file.managed:
        - name: /etc/badfile
        - content: "Username doesn't exists"
        - user: inexistant

dependency_file:
    file.managed:
        - name: /etc/dependency_file
        - content: "Missing dependency"
        - require:
            - file: bad_file
