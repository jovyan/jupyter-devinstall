import {StepBase} from './base';
import * as path from 'path';
import {run} from '../run';
import * as chalk from 'chalk';

export default class PIP extends StepBase {
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Install Python packages";
    }
    
    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        if (previousStepResults.install === 'l' || previousStepResults.install === 'g') {
            let chain = Promise.resolve();
            for (let i = 0; i < this.globals.tools.pip.length; i++) {
                let orgRepo = this.globals.tools.pip[i];
                let localFlag = (previousStepResults.install === 'l') ? '--user ' : '';
                let shell = 'python -m pip install ' + localFlag + '-e ' + path.resolve(this.globals.installdir, orgRepo);
                chain = chain.then(() => run(shell)).then(stdout => {
                    this.success(orgRepo + ' installed');
                    this.details(stdout);
                }).catch(err => {
                    this.failure(orgRepo + ' installed');
                    this.abort(err, 1);
                });
            }
            
            return chain.then(() => {
                console.log(chalk.green.bold('Installation was a success!  You can launch the notebook by running `python -m notebook`'));
                return previousStepResults;
            });
        }
    }
}
