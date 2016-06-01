# Saltpad vision

SaltStack is great, but not very accessible to non-DevOps people. DevOps for me should help people save time and empower them to manage their own part of the infrastructure is a great to help everyone feels more powerful and use their time on most important stuff.

Saltpad tries to minimize the time needed to maintain a SaltStack cluster day after day.

## Saltpad features

 - Efficient clean output for both jobs and highstate jobs, helps you quickly pinpoint the problem in order to fix them.
 - Go back in time to find the job that makes you week-end a mess and see what it output was.
 - Have a quick overview of your cluster, how many minions you have, how many jobs you have, what are your minions version, etc...
 - Define predefined jobs, called "templates" that will help non-devops

## What Saltpad is not

 - Saltpad is not an advanced reporting UI on top of Saltstack.
 - Saltpad is based on salt-api so (almost) everything you can do with salt itself, but not more. If you want for example slack notification, it's out of scope of Saltpad.
