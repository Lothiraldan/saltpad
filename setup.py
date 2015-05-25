#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys


try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

if sys.argv[-1] == 'publish':
    os.system('python setup.py sdist upload')
    sys.exit()


with open('README.rst') as readme_file:
    readme = readme_file.read()

with open('HISTORY.rst') as history_file:
    history = history_file.read().replace('.. :changelog:', '')

with open('_requirements.txt') as requirements_file:
    requirements = requirements_file.read().splitlines()

with open('requirements.txt') as requirements_file:
    requirements.extend([req for req in requirements_file.read().splitlines()
                         if not req.startswith('-r ')])

setup(
    name='saltpad',
    version='0.0.1',
    description='SaltPad is a GUI tool to manage saltstack deployments + orchestration.',
    long_description=readme + '\n\n' + history,
    author='Boris FELD',
    author_email='boris.feld@tinyclues.com',
    url='https://github.com/tinyclues/saltpad',
    packages=[
        'saltpad',
    ],
    package_dir={'saltpad': 'saltpad'},
    include_package_data=True,
    install_requires=requirements,
    zip_safe=False,
    keywords='saltpad',
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'Natural Language :: English',
        "Programming Language :: Python :: 2",
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
    ],
    entry_points={
        'console_scripts': [
            'saltpad = saltpad.saltpad:main',
            'saltpad-vagrant = saltpad.saltpad_vagrant:main'
        ]
    }
)
