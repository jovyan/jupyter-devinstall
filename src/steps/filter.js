import {StepBase} from './base';

export default class Filter extends StepBase {

    /**
     * Public constructor
     *
     * Here the step should register any commandline options it needs with
     * commander.
     * @param  {Commander} globals
     */
    constructor(globals) {
        super(globals);
        globals.option('-P, --skip-pip', 'skip pip projects');
        globals.option('-N, --skip-npm', 'skip npm projects');
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
        let disallowedTools = [];
        if (this.globals.skipPip) disallowedTools.push('pip');
        if (this.globals.skipNpm) disallowedTools.push('npm');
        if (disallowedTools.length > 0) {
            this.details('user disabled the following installers ' + String(disallowedTools));
            Object.keys(this.globals.tools).forEach(tool => {
                if (disallowedTools.indexOf(tool) !== -1) {
                    this.globals.tools[tool].forEach(orgRepo => {
                        this.globals.orgRepos.splice(this.globals.orgRepos.indexOf(orgRepo), 1);
                    });
                    delete this.globals.tools[tool];
                }
            });

            // Reconstruct repos and orgs lists.
            this.globals.repos = this.globals.orgRepos.map(x => x.split('/')[1]);
            this.globals.orgs = this.globals.orgRepos.map(x => x.split('/')[0]).filter((x, i, self) => self.indexOf(x) === i);
        }
        return previousStepResults;
    }
}
