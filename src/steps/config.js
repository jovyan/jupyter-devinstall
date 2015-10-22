import * as prompt from 'prompt';
import {StepBase} from './base';

export default class Config extends StepBase {
    
    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        super(globals);
        globals.option('-u, --upstream [string]', 'name of the upstream git remote [upstream]', 'upstream');
        globals.option('-g, --global', 'global install');
        globals.option('-n, --noInstall', 'don\'t install');
    }
    
    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        // If this is a silent install, don't print the header.
        return this.globals.silent ? "" : "Config";
    }
    
    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        let properties = {};
        properties.install = {
            description: 'Do you want the Python contents to be installed (l)ocally, (g)lobally, or (n)ot at all?',
            required: false,
            pattern: /[lgn]/,
            message: '(l)ocally, (g)lobally, or (n)ot at all',
            default: this.globals.noInstall ? 'n' : (this.globals.global ? 'g' : 'l')
        };
        
        // If we aren't reinstalling, ask what the upstream remote should be labeled as.
        if (!this.globals.reinstall) {
            properties.upstream = {
                description: 'Enter the name you want to use for the git remote that targets upstream',
                required: false,
                default: this.globals.upstream
            };
        }
        
        // If this is a silent execution, return the defaults.
        if (this.globals.silent) {
            defaults = {};
            Object.keys(properties).forEach(property => {
                defaults[property] = properties[property].default;
            });
            return defaults;
        }
        
        // Prompt
        return new Promise(resolve => {
            prompt.start();
            prompt.get({ properties: properties }, (err, result) => {
                if (err) this.abort('User abort', 0);
                resolve(result);
            });
        }).catch((err) => {
            this.abort(['Error while configuring', err], 1);
        });
    }
}
