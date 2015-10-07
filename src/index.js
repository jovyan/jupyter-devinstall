#!/usr/bin/env node
"use strict";
import * as prompt from 'prompt';
import * as chalk from 'chalk';
import * as request from 'request';
import * as path from 'path';
import * as expandTilde from 'expand-tilde';

import {run} from './run';
import {testRun} from './test-run';
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

if (process.argv.length < 4) {
    console.error('Usage: jupyter-devinstall <githubUserName> <installDir>');
    process.exit(1);
}
var githubName = process.argv[2];
var installdir = process.argv[3];

var gh_requirements = Promise.resolve().then(() => {
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
    
    return Promise.all(repos.map((x, i) => findRepo(githubName, x, orgRepos[i])));
}).catch(err => {
    process.exit(1);
});

var downloaded = gh_requirements.then(() => {
    section('Checking system requirements');
    
    return Promise.all([
        testRun('git --version'),
        testRun('python --version'),
        testRun('python -m pip --version', 'pip'),
        testRun('node --version'),
        testRun('npm --version'),
        testRun(`python -c "import zmq"`, 'pyzmq', `\`pyzmq\` not installed for \`python\`.  Please install pyzmq for python.  
Before installing pyzmq, you may need to install python and zmq dev packages (\`python-dev\` and \`libzmq-dev\` on debian based distros).`),
        testRun(`python -c "import pycurl"`, 'pycurl', `\`pycurl\` not installed for \`python\`.  Please install pycurl for python.
Before installing pycurl, you may need \`libcurl4-openssl-dev\` on debian based distros or \`libcurl-devel\` on slackware based distros.`)
    ]);

}).then(() => {
    section('Checking destination');
    
    return Promise.all(orgs.map(org => {
        
        return doesntExist(path.resolve(expandTilde(installdir), org)).then(() => {
            success(org + ' doesn\'t exist yet');
        }).catch(err => {
            failure(org + ' doesn\'t exist yet');
            throw Error();
        });
    }));
}).then(() => {
    section('Config');
    
    return new Promise(resolve => {
        prompt.start();
        prompt.get({
            properties: {
                upstream: {
                    description: 'Enter the name you want to use for the git remote that targets upstream',
                    required: false,
                    default: 'upstream' 
                },
                install: {
                    description: 'Do you want the Python contents to be installed (l)ocally, (g)lobally, or (n)ot at all?',
                    required: false,
                    pattern: /[lgn]/,
                    message: '(l)ocally, (g)lobally, or (n)ot at all',
                    default: 'l' 
                }
            }
        }, function (err, result) {
            if (err) {
                console.error('\nUser exit');
                process.exit(1);
            }
            resolve(result);
        });
    }).catch((err) => {
        console.error(chalk.bgRed('error while configuring'), err);
    });
    
}).then(config => {
    section('Downloading');
    
    return Promise.all(orgs.map(org => {
        return mkdir(path.resolve(expandTilde(installdir), org)).then(() => {
            success(org + ' org dir exists');
        }).catch(err => {
            failure(org + ' org dir exists');
            throw Error();
        });
    })).then(() => config);
}).then(config => {
    
    return Promise.all(orgRepos.map((orgRepo, i) => {
        let url;
        // url = 'git@github.com:' + githubName + '/' + repos[i] + '.git';
        url = 'https://github.com/' + githubName + '/' + repos[i] + '.git';
        
        let dir = path.resolve(expandTilde(installdir), orgRepo);
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
    })).then(() => config);
}).catch(err => {
    console.error('Unhandled error');
    console.error(err);
    process.exit(1);
    
}).then(config => {
    if (config.install === 'l' || config.install === 'g') {
        let chain = Promise.resolve();
        for (let i = 0; i < orgRepos.length; i++) {
            let orgRepo = orgRepos[i];
            let localFlag = config.install === 'l' ? '--user ' : '';
            let shell = 'python -m pip install -e ' + localFlag + path.resolve(expandTilde(installdir), orgRepo);
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
});
