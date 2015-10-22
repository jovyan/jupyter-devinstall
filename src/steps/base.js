import * as chalk from 'chalk';
import * as prompt from 'prompt';
import {success, failure, details, section} from '../logging';
import * as _ from 'underscore';

/**
 * Represents a single step in the installation process.
 */
export class StepBase {
    
    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        this.globals = globals;
        
        // Logging functions
        this.success = success;
        this.failure = failure;
        this.details = details;
    }
    
    /**
     * Abort the installation
     * @param  {object|array<object>} message
     * @param  {number} [errorCode=1]
     */
    abort(message, errorCode=1) {
        if (!_.isArray(message)) {
            message = [message];
        }
        message.forEach(text => {
            if (!_.isString(text)) {
                text = String(text);
            }
            
            if (text.length > 0) {                
                console.error(chalk.red(String(text)));
            }
        });
        process.exit(errorCode);
    }
    
    /**
     * Prompt the user for a yes/no answer.
     * @param  {string} message
     * @return {Promise<boolean>} true if yes, false otherwise
     */
    yesNo(message) {
        if (this.globals.silent) {
            return Promise.resolve(false);
        } else {
            return new Promise(resolve => {
                prompt.start();
                prompt.get({
                    properties: {
                        overwrite: {
                            description: message + ' (y)es or (n)o',
                            required: true,
                            pattern: /[yn]/,
                            message: '(y)es or (n)o',
                            default: 'n' 
                        },
                    }
                }, (err, result) => {
                    if (err || result.overwrite !== 'y') {
                        resolve(false);
                    }
                    resolve(true);
                });
            });
        }
    }
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() { }
    
    /**
     * Tries to run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    tryRun(previousStepResults) {
        return Promise.resolve(this.shouldRun()).then(shouldRun => {
            if (shouldRun) {
                
                // If a section title was specified, print that title.
                if (this.section && this.section.length > 0) {
                    section(this.section);
                }
                
                // Run the step.
                return this.run(previousStepResults);
            } else {
                return previousStepResults;
            }
        });
    }
    
    /**
     * Checks if the step should run
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|boolean} should run
     */
    shouldRun(previousStepResults) {
        return true;
    }
    
    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) { }
}
