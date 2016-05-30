salt-api:
    cmd.run:
        - name: "salt-api -d"
        - unless: "pgrep salt-api"
