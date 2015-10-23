import * as path from 'path';
import {doesntExist} from '../fs';

import {StepBase} from './base';

export default class CheckDestination extends StepBase {

    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        super(globals);
        globals.option('-o, --overwrite', 'overwrite existing directories');
    }

    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Checking destination";
    }

    /**
     * Checks if the step should run
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|boolean} should run
     */
    shouldRun() {
        return !(this.globals.overwrite || this.globals.reinstall);
    }

    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {

        // Check if any of the org directories already exist.
        return Promise.all(this.globals.orgs.map(org => {
            return doesntExist(path.resolve(this.globals.installdir, org)).then(() => {
                this.success(org + ' doesn\'t exist yet');
            }).catch(err => {
                return org;
            });
        })).then(orgs => {
            orgs = orgs.filter(x => x !== undefined);
            if (orgs.length === 0) {
                return previousStepResults;
            } else {
                return this.yesNo('The directories ' + orgs.join(', ') + ' already exist in the destination, overwrite them? ').then(response => {
                    if (response) {
                        this.success('overwriting ' + orgs);
                        this.globals.overwrite = true;
                        return previousStepResults;
                    } else {
                        this.abort('User abort', 0);
                    }
                });
            }
        });
    }
}
