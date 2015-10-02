#!/usr/bin/env node
"use strict"
import * as prompt from 'prompt';
import * as chalk from 'chalk';
import * as request from 'request';
import * as path from 'path';
import * as expandTilde from 'expand-tilde';

import {run} from './run';
import {success, failure, details, section} from './logging';
import {mkdir, doesntExist} from './fs';

console.log(chalk.bold.cyan('Jupyter dev install tool'));
console.log(chalk.bold.cyan('Wizard for setting up a Jupyter development environment'));

var orgRepos = [
    'ipython/traitlets',
    'ipython/ipython',
    'jupyter/jupyter_core',
    'jupyter/jupyter_client',
    'ipython/ipykernel',
    'jupyter/jupyter_console',
    'jupyter/qtconsole',
    'jupyter/nbformat',
    'jupyter/notebook',
    'ipython/ipywidgets',
    'jupyter/nbconvert'
];
var repos = orgRepos.map(x => x.split('/')[1]);
var orgs = orgRepos.map(x => x.split('/')[0]).filter((x, i, self) => self.indexOf(x) === i);

section('Config');
var config = new Promise(resolve => {
    prompt.start();
    prompt.get({
        properties: {
            githubName: {
                description: 'Enter your GitHub user name',
                required: true
            },
            installdir: {
                description: 'Enter the installation directory.  The installer will create ' + orgs.join(', ') + ' subfolders here.',
                required: false,
                default: '~' 
            },
            upstream: {
                description: 'Enter the name you want to use for the git remote that targets upstream',
                required: false,
                default: 'upstream' 
            },
            install: {
                description: 'Do you want the contents to be installed completely (y/n)?',
                required: false,
                pattern: /[yn]/,
                message: '`y` or `n` only',
                default: 'y' 
            }
        }
    }, function (err, result) {
        resolve(result);
    });
}).catch((err) => {
    console.error(chalk.bgRed('error while configuring'), err);
});


var sys_requirements = config.then(() => {
    section('Checking system requirements');
    return run('git --version');
}).then(stdout => {
    success('git installed');
    details(stdout);
}).catch(err => {
    failure('git installed');
    details('`git` not installed.  Please install git.');
    process.exit(1);
}).then(() => {
    return run('python --version');
}).then(stdout => {
    success('python installed');
}).catch(err => {
    failure('python installed');
    details('`python` not installed.  Please install python.');
    process.exit(1);
}).then(() => {
    return run('python -m pip --version');
}).then(stdout => {
    success('pip installed');
    details(stdout);
}).catch(err => {
    failure('pip installed');
    details('`pip` not installed.  Please install pip.');
    process.exit(1);
}).then(() => {
    return run('node --version');
}).then(stdout => {
    success('node installed');
    details(stdout);
}).catch(err => {
    failure('node installed');
    details('`node` not installed.  Please install node.');
    process.exit(1);
}).then(() => {
    return run('npm --version');
}).then(stdout => {
    success('npm installed');
    details(stdout);
}).catch(err => {
    failure('npm installed');
    details('`npm` not installed.  Please install npm.');
    process.exit(1);
}).then(() => {
    return run(`python -c "import zmq"`);mistune
}).then(stdout => {
    success('pyzmq installed');
}).catch(err => {
    failure('pyzmq installed');
    details(`\`pyzmq\` not installed for \`python\`.  Please install pyzmq for python.  
Before installing pyzmq, you may need to install python and zmq dev packages (\`python-dev\` and \`libzmq-dev\` on debian based distros).`);
    process.exit(1);
}).then(() => {
    return run(`python -c "import pycurl"`);mistune
}).then(stdout => {
    success('pycurl installed');
}).catch(err => {
    failure('pycurl installed');
    details(`\`pycurl\` not installed for \`python\`.  Please install pycurl for python.
Before installing pycurl, you may need \`libcurl4-openssl-dev\` on debian based distros or \`libcurl-devel\` on slackware based distros.`);
    process.exit(1);
}).then(() => config);

// 
var gh_requirements = sys_requirements.then((config) => {
    section('Checking github repositories');

    function findRepo(org, repo, original) {
        let orgRepo = org + '/' + repo;
        return new Promise((resolve, reject) => {
            request('http://github.com/' + orgRepo, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    success(orgRepo + ' on GitHub');
                    resolve(body);
                } else {
                    failure(orgRepo + ' on GitHub');
                    details('Use github.com to fork ' + original + ' to ' + orgRepo);
                    reject(error || response.statusCode);
                }
            });
        });
    }
    
    return Promise.all(repos.map((x, i) => findRepo(config.githubName, x, orgRepos[i])));
}).catch(err => {
    process.exit(1);
}).then(() => config);

var downloaded = gh_requirements.then(config => {
    section('Downloading');
    
    return Promise.all(orgs.map(org => {
        
        return doesntExist(path.resolve(expandTilde(config.installdir), org)).then(() => {
            success(org + ' doesn\'t exist yet');
        }).catch(err => {
            failure(org + ' doesn\'t exist yet');
            throw Error();
        });
    })).then(() => config);
}).then(config => {
    
    return Promise.all(orgs.map(org => {
        return mkdir(path.resolve(expandTilde(config.installdir), org)).then(() => {
            success(org + ' org dir exists');
        }).catch(err => {
            failure(org + ' org dir exists');
            throw Error();
        });
    })).then(() => config);
}).then(config => {
    return Promise.all(orgRepos.map((orgRepo, i) => {
        let url;
        // url = 'git@github.com:' + config.githubName + '/' + repos[i] + '.git';
        url = 'https://github.com/' + config.githubName + '/' + repos[i] + '.git';
        
        let dir = path.resolve(expandTilde(config.installdir), orgRepo);
        return run('git clone ' + url + ' ' + dir).then(() => {
            success(orgRepo + ' cloned');
        }).catch(err => {
            failure(orgRepo + ' cloned');
        }).then(() => {
            return run('git -C ' + dir + ' remote add ' + config.upstream + ' https://github.com/' + orgRepo + '.git');
        }).then(() => {
            success(orgRepo + ' ' + config.upstream + ' remote added');
        }).catch(err => {
            failure(orgRepo + ' ' + config.upstream + ' remote added');
        }).then(() => {
            return run('git -C ' + dir + ' remote update');
        }).then(() => {
            success(orgRepo + ' remotes updated');
        }).catch(err => {
            failure(orgRepo + ' remotes updated');
        }).then(() => {
            return run('git -C ' + dir + ' checkout ' + config.upstream + '/master');
        }).then(() => {
            success(orgRepo + ' master checked out');
        }).catch(err => {
            failure(orgRepo + ' master checked out');
        });
    }));
}).catch(err => {
    process.exit(1);
}).then(() => config);

downloaded.then(config => {
    if (config.install === 'y') {
        let chain = Promise.resolve();
        for (let i = 0; i < orgRepos.length; i++) {
            let orgRepo = orgRepos[i];
            let shell = 'python -m pip install --user -e ' + path.resolve(expandTilde(config.installdir), orgRepo);
            chain = chain.then(() => run(shell)).then(stdout => {
                success(orgRepo + ' installed');
                details(stdout);
            }).catch(err => {
                failure(orgRepo + ' installed');
                console.error(err);
                process.exit(1);
            });
        }
        
        chain.then(() => {
            console.log(chalk.green.bold('Installation was a success!  You can launch the notebook by running `python -m IPython notebook`'));
        });
    }
})
