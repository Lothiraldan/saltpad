# Saltpad requirements

Saltpad is a React application which interact with your Saltstack cluster through the [salt-api](https://docs.saltstack.com/en/latest/topics/netapi/).

SaltPad is mainly coded in Javascript and should be compatible with all modern browsers.

Saltpad has some hard dependencies that your cluster needs to meet.

## Saltstack version

There is more than one way to deploy saltpad and it impacts the required saltstack version.

Anyway Saltpad has been tested with SaltStack 2015.8.8+ so you require at least this version for your salt-master and salt-api.

## Job cache

Saltpad retrieve past job result by using the [jobs runner](https://docs.saltstack.com/en/latest/ref/runners/all/salt.runners.jobs.html). By default, the salt-master store job output on disk, but you may change it by setting the [master job cache setting key](https://docs.saltstack.com/en/latest/topics/jobs/job_cache.html).

As Saltpad interact with the salt-master through the salt-api, you will need to use a [master job cache](https://docs.saltstack.com/en/latest/topics/jobs/external_cache.html#master-job-cache-master-side-returner) if you want to store job output in a DB for example.

Not [all returners](https://docs.saltstack.com/en/latest/ref/returners/all/index.html#all-salt-returners) are equals, [some](https://docs.saltstack.com/en/latest/ref/returners/all/salt.returners.smtp_return.html#module-salt.returners.smtp_return) will send some message and forget about the job and [others](https://docs.saltstack.com/en/latest/ref/returners/all/salt.returners.postgres_local_cache.html#module-salt.returners.postgres_local_cache) will store job output in a more permanent matters.

When using a returner that send job output by sms, slack, email..., saltpad has now way to retrieve it later.

You can test it your configured returner store job output or not, launch this command on your salt-master (this can take some times!):

```
salt-run jobs.list_jobs
```

If you have some output, congratulations, saltpad should be able to retrieve job history!

## Netapi

Saltstack has two netapi implementation:

 - [rest_cherrypy](https://docs.saltstack.com/en/latest/ref/netapi/all/salt.netapi.rest_cherrypy.html), the more mature implementation.
 - [rest_tornado](https://docs.saltstack.com/en/latest/ref/netapi/all/salt.netapi.rest_tornado.html), the more recent but faster implementation.
 
As rest_tornado is more recent, they're not feature equals and depending of your netapi implementation saltpad might requires different saltstack version.

### Rest-tornado

Rest-tornado until recently lacks some features required for Saltpad to run. At this time, the changes have been merged to develop branch, but not merged to a stable version __yet__, so if you want to use rest-tornado right now with saltpad you will need a develop version of salt-master.

These changes should lands in the future 2016.3 release, be patient!

__I do not recommend installing a develop version of SaltStack on your production system!__

### Rest-cherrypy

Rest-cherrypy implementation could work with saltpad in version 2015.8.8 but requires some specific deployment process detailled later.

If you want the most easy deployment, you will need a develop version of your salt-master but saltpad could be deployed with a 2015.8.8 version of rest_cherrypy

## Compatiblity table

Here is a summary of the saltpad requirements and compatibility with salt-master version and salt-api implementation:


| Salt Version  | Netapi            | Master_job_cache  | Supported?    | Issue if not supported                                |
|-------------- |---------------    |------------------ |------------   |---------------------------------------------------    |
| develop       | rest_tornado      | * (all)           | YES           |                                                       |
| develop       | rest_cherrypy     | * (all)           | YES           |                                                       |
| 2015.8.8      | rest_cherrypy     | * (all)           | PARTIALLY     | Only via rest_cherrypy single-app page deployment     |
