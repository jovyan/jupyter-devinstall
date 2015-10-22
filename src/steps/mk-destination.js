import {StepBase} from './base';
import * as path from 'path';
import {mkdir} from '../fs';

export default class MkDestination extends StepBase {
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Making destination directories";
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
        return Promise.all(this.globals.orgs.map(org => {
            return mkdir(path.resolve(this.globals.installdir, org)).then(() => {
                this.success(org + ' org dir exists');
            }).catch(err => {
                this.failure(org + ' org dir exists');
                throw Error();
            });

        // Return the results from the previous step.
        })).then(() => previousStepResults);
    }
}
