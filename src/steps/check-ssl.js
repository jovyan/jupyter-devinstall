import {StepBase} from './base';

export default class CheckSSL extends StepBase {
    
    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        super(globals);
    }
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "";
    }
    
    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        return previousStepResults;
    }
}
