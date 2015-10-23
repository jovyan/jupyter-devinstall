import {StepBase} from './base';
import * as path from 'path';
import {run} from '../run';
import * as chalk from 'chalk';

export default class Clone extends StepBase {

    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Cloning repositories";
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
        let errored;
        return Promise.all(this.globals.orgRepos.map((orgRepo, i) => {
            let url;
            // url = 'git@github.com:' + githubName + '/' + repos[i] + '.git';
            url = 'https://github.com/' + this.globals.githubName + '/' + this.globals.repos[i] + '.git';

            let dir = path.resolve(this.globals.installdir, orgRepo);
            return run('git clone ' + url + ' ' + dir).then(() => {
                this.success(orgRepo + ' cloned');
            }).catch(err => {
                this.failure(orgRepo + ' cloned');
                this.details(err);
                errored = true;
            }).then(() => {
                return run('git -C ' + dir + ' remote add ' + previousStepResults.upstream + ' https://github.com/' + orgRepo + '.git');
            }).then(() => {
                this.success(orgRepo + ' ' + previousStepResults.upstream + ' remote added');
            }).catch(err => {
                this.failure(orgRepo + ' ' + previousStepResults.upstream + ' remote added');
                this.details(err);
                errored = true;
            }).then(() => {
                return run('git -C ' + dir + ' remote update');
            }).then(() => {
                this.success(orgRepo + ' remotes updated');
            }).catch(err => {
                this.failure(orgRepo + ' remotes updated');
                this.details(err);
                errored = true;
            }).then(() => {
                return run('git -C ' + dir + ' checkout ' + previousStepResults.upstream + '/master');
            }).then(() => {
                this.success(orgRepo + ' master checked out');
            }).catch(err => {
                this.failure(orgRepo + ' master checked out');
                this.details(err);
                errored = true;
            });

        // Continue to pass the config on.
        })).then(() => {
            if (errored) {
                console.log('    ' + chalk.bgCyan.white.bold('One or more errors occured while cloning from GitHub, this is probably because the installer is attempting to overwrite existing contents.  Continuing...'));
            }
            return previousStepResults;
        });
    }
}
