===================================
SaltPad GUI Walkthrough
===================================

Login
-----

Login with your SaltStack external auth credentials before anything else.

.. image:: login.png

DashBoard
---------

In this view you have a quick view about your infrastructure, how many minions do you have, how many are up, how many are in sync with your formulas (WIP) and a list of recent jobs.

.. image:: dashboard.png


Minions list
------------

This view list your minions, their name, their status (up or down), their version, their roles, latest synchronization check jobs (state.highstate --test=True) and a quick link to run a synchronization check job.

.. image:: minions.png

You can filter your minions using the input bar above the table, you can filter on anything in the table, minion name, salt-minion version, minions with jobs in errors.

.. image:: minions_filtered.png

Minions deployments
-------------------

This view is quite similar to the minions list view but it list deployments jobs (state.highstate) and the link will launch a deployment job too. This view is also filterable.

.. image:: deployments_filtered.png

Minions keys
------------

This view will help you manage your minions keys. It list all minions accepted keys with their fingerprint (WIP) and a button to delete / reject each key.

.. image:: minion_keys.png

You can also accept pending keys.

.. image:: minion_keys_pending.png

Minion details
--------------

If you click on a minion name on any of the last third views, the minion detail view will show you the minion grains, the minion last jobs (WIP) and a button to delete / reject this minion key.

.. image:: minion_details.png

Job history
-----------

The job history view list every jobs executed by the Salt-Master you are currently connected to, even jobs launched in CLI or other tools using the API.

.. image:: job_history.png

It's also filterable.

.. image:: job_history_filtered.png

Highstate output
----------------

The highstate output view is the main point to using SaltPad, it helps you quickly identify failing steps and is much more easy to read.

.. image:: highstate_result.png

Each minion is listed with its status. The background color depict the succes or not of the deployment. For each minion, the number of steps in errors, steps with failed requirement, steps in warning, steps with changes and steps without changes is listed.

By default, the list of steps in errors and the list of steps with changes are displayed. For each section, you can click on the arrow to display / hide content.

.. image:: highstate_output_errors_details.png
.. image:: highstate_output_changes_details.png
.. image:: highstate_output_success_details.png

Job result
----------

For other job, the job result view use a different layout. It list all minions impacted by the job and if you click on a minion, you will have its result.

.. image:: job_result_raw.png

.. image:: job_result_raw_details.png


You can also aggregate results, SaltPad will try to regroup minions by result. It's more useful if you have a little number of available results or if you have a certain state and you want all your minions to match this state.

.. image:: job_result_aggregate.png

Moreover, on all job result views, including the highstate output, you can click the "redo job" button to launch a new job with the same arguments.

.. image:: job_result_raw.png

.. image:: job_result_redone.png

Run job
-------

The run job view is quite similar to halite. You must choose a target and a function.
.. image:: run.png

When you start typing the function, SaltPad will show you the revelant documentation.

.. image:: run_1.png

When the function will exactly match an existing function, SaltPad will show you additionnal fields to fill in.

.. image:: run_2.png

Required fields are prefixed by a *.

.. image:: run_3.png

Optional arguments are hided by default but you can display them by clicking on the arrow.

.. image:: run_4.png

Templates jobs
--------------

Template jobs are predefined jobs that you can launch by clicking on just one button. The list view will show them, with their target and their function.

.. image:: template_list.png

You can also add a new one, the interface is quite similar to the run job view.

.. image:: template_add.png

Once added, you will be able to run it with just a click on the "Launch now" link.

.. image:: template_added.png
.. image:: template_runned.png

Minion debug
------------

The minion debug is a special view dedicated to help you quickly identify why your minion doesn't deploy as you want it. The view collect as many useful information and try to present you in a meaningfull way (WIP).

.. image:: debug.png

It show you the minion pillar.

.. image:: debug_pillar.png

Which sls files will be executed.

.. image:: debug_state.png

The exact list of steps which will be executed, display will be a lot more exploitable in the future.

.. image:: debug_highstate.png

Its grains.

.. image:: debug_grains.png
