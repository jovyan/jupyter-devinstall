import * as commander from 'commander';
import * as expandTilde from 'expand-tilde';
import * as npmPackage from '../package';
import * as chalk from 'chalk';

/**
 * Perform install
 * @param  {array<string>} orgRepos - list of GitHub organization repositories
 *                                  of the format "tool!organization/repository".
 *                                  i.e. "pip!ipython/ipython" for
 *                                  github.com/ipython/ipython to be installed
 *                                  by pip.
 *                                  Possible tools include pip and npm.
 * @param  {array<string>} argv - from process.argv
 * @return {[type]}          [description]
 */
export function install(orgRepos, argv) {

    // Ordered list of install steps
    let steps = [
        require('./steps/filter'),
        require('./steps/check-ssl'),
        require('./steps/check-github'),
        require('./steps/check-system'),
        require('./steps/check-destination'),
        require('./steps/config'),
        require('./steps/mk-destination'),
        require('./steps/clone'),
        require('./steps/npm'),
        require('./steps/pip')
    ];

    // Contruct steps
    steps = steps.map(step => (new step.default(commander)));

    // Parse args
    commander.option('-s, --silent', 'don\'t prompt the user for anything');
    commander.version(npmPackage.version);
    commander.usage('[options] <githubName> <installdir>');
    commander.parse(argv);

    // Print header
    console.log(chalk.bold.cyan('Jupyter dev install tool'));
    console.log(chalk.bold.cyan('Wizard for setting up a Jupyter development environment'));
    if (commander.args.length < 2) {
        console.error('Not enough arguments');
        process.exit(1);
    }

    // Add globals
    commander.orgRepos = orgRepos.map(x => x.split(':')[1]);
    commander.repos = commander.orgRepos.map(x => x.split('/')[1]);
    commander.orgs = commander.orgRepos.map(x => x.split('/')[0]).filter((x, i, self) => self.indexOf(x) === i);
    commander.githubName = commander.args[0];
    commander.installdir = expandTilde(commander.args[1]);

    // Separate repos based on install tool
    let orgRepoTools = orgRepos.map(x => x.split(':'));
    let tools = orgRepoTools.map(x => x[0]).filter((x, i, self) => self.indexOf(x) === i);
    commander.tools = {};
    tools.forEach(tool => {
        commander.tools[tool] = orgRepoTools.filter(x => x[0] === tool).map(x => x[1]);
    });

    // Run each step sequentially
    let results = Promise.resolve();
    steps.forEach(step => {
        results = results.then(previous => {
            return step.tryRun(previous);
        }).catch(error => {
            console.error('Error while executing ' + step.constructor.name, error, error.stack);
            process.exit(1);
        });
    });
    return results;
}
