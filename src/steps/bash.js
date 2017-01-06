import {StepBase} from './base';
import * as path from 'path';
import {run} from '../run';

export default class Bash extends StepBase {

    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Install bash packages";
    }

    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        let chain = Promise.resolve();
        if (previousStepResults.install === 'l' || previousStepResults.install === 'g') {
            if (this.globals.tools.bash) {
                for (let i = 0; i < this.globals.tools.bash.length; i++) {
                    let orgRepo = this.globals.tools.bash[i];
                    let repoPath = path.resolve(this.globals.installdir, orgRepo);
                    let shell = `(cd ${repoPath} && bash ${repoPath}/dev-install.sh)`;
                    chain = chain.then(() => run(shell)).then(stdout => {
                        this.success(orgRepo + ' installed');
                        this.details(stdout);
                    }).catch(err => {
                        this.failure(orgRepo + ' installed');
                        this.abort(err, 1);
                    });
                }
            }
        }
        // pass on config
        return chain.then(() => {
            return previousStepResults;
        });
    }
}
