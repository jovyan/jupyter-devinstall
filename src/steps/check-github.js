import * as request from 'request';

import {StepBase} from './base';

export default class CheckGithub extends StepBase {
    
    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        super(globals);
        globals.option('-r, --reinstall', 'reinstall existing repositories, without recloning');
    }
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Checking github repositories";
    }
    
    /**
     * Checks if the step should run
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|boolean} should run
     */
    shouldRun() {
        return !this.globals.reinstall;
    }
    
    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        return Promise.all(this.globals.repos.map((x, i) => {
            return this.findRepo(this.globals.githubName, x, this.globals.orgRepos[i]);
        
        // Pass along the results from the previous step.
        })).then(() => previousStepResults);
    }
    
    /**
     * Check to see if a repository exists.
     * @param  {string} org
     * @param  {string} repo
     * @param  {string} original - orgRepo string for which the repository 
     *                           should be forked from, used for logging.
     * @return {Promise}
     */
    findRepo(org, repo, original) {
        let orgRepo = org + '/' + repo;
        return new Promise((resolve, reject) => {
            request('http://github.com/' + orgRepo, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                    this.success(orgRepo + ' on GitHub');

                } else {
                    this.failure(orgRepo + ' on GitHub');
                    this.details('Use github.com to fork ' + original + ' to ' + orgRepo);
                    reject(error || response.statusCode);
                }
            });
        });
    }
}
