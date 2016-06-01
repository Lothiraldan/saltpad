# Limitations

Saltpad source of data is limited to Salt-API. It doesn't store information anywhere except for some limited information in your browser (see [Security](security.md) for more information).

Saltpad has no need for another data persistence storage but it imposes some limitations:

* On reload, most of the information displayed will be lost and Saltpad will need to retrieve them again. It is coherent with the [Security](security.md) model.
* Saltpad try to leverage the real-time event socket of salt-api but it means that a node without any job will not be easily detected by Saltpad, you can always run `salt -v '*' test.ping` to detect them all.
* Saltpad detect valid function names when `sys.list_functions` jobs returns. It does not currently launch this job but if you launch it on your cluster, saltpad should correctly detect and diplay the functions that are available on your cluster.
* Saltpad works best in an environment with the same version for every minion, taking care of the different minions especially when launching a job is not easy and may not work correctly.
* Saltpad is an experiment with a [vision](vision.md). Saltpad is only a Web UI on top of salt-api to make Saltstack more accessible to non console afficionados. Saltpad will not be a layer on top of salt-api and features like ACL right management will not be implemented, they should be implemented in salt-api directly.
