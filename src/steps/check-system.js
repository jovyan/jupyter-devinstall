import {testRun} from '../test-run';
import {StepBase} from './base';

export default class CheckSystem extends StepBase {

    /**
     * Gets the name of the section
     * @return {string}
     */
    get section() {
        return "Checking system requirements";
    }

    /**
     * Run the step
     * @param  {object} previousStepResults - results from the previous step
     * @return {Promise|object} results
     */
    run(previousStepResults) {
        let tests = [
            testRun('git --version'),
            testRun('node --version'),
            testRun('npm --version'),
        ];

        if (!this.globals.skipPip) {
            tests = tests.concat([
                testRun('python --version'),
                testRun('python -m pip --version', 'pip'),
                testRun(`python -c "import zmq"`, 'pyzmq', `\`pyzmq\` not installed for \`python\`.  Please install pyzmq for python.
        Before installing pyzmq, you may need to install python and zmq dev packages (\`python-dev\` and \`libzmq3-dev\` on debian based distros).`),
                testRun(`python -c "import pycurl"`, 'pycurl', `\`pycurl\` not installed for \`python\`.  Please install pycurl for python.
        Before installing pycurl, you may need \`libcurl4-openssl-dev\` and \`libssl-dev\` on debian based distros or \`libcurl-devel\` and \`openssl-devel\` on slackware based distros.`)
            ]);
        }

        if (!this.globals.skipNpm) {
            // It would be normal to expect the the node and npm checks here,
            // unfortunately that's not the case.  Some of the Jupyter PIP
            // projects actually piggy back NPM so we still need to check for it.
        }

        return Promise.all(tests);
    }
}
