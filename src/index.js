#!/usr/bin/env node
"use strict";

import {install} from './install';

let orgRepos = [
    'pip:ipython/traitlets',
    'pip:ipython/ipython',
    'pip:jupyter/jupyter_core',
    'pip:jupyter/jupyter_client',
    'pip:ipython/ipykernel',
    'pip:jupyter/jupyter_console',
    'pip:jupyter/qtconsole',
    'pip:jupyter/nbformat',
    'pip:jupyter/notebook',
    'pip:ipython/ipywidgets',
    'pip:jupyter/jupyter',
];

install(orgRepos, process.argv);
