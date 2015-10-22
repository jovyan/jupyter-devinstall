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
        return Promise.all([
            testRun('git --version'),
            testRun('python --version'),
            testRun('python -m pip --version', 'pip'),
            testRun('node --version'),
            testRun('npm --version'),
            testRun(`python -c "import zmq"`, 'pyzmq', `\`pyzmq\` not installed for \`python\`.  Please install pyzmq for python.  
    Before installing pyzmq, you may need to install python and zmq dev packages (\`python-dev\` and \`libzmq-dev\` on debian based distros).`),
            testRun(`python -c "import pycurl"`, 'pycurl', `\`pycurl\` not installed for \`python\`.  Please install pycurl for python.
    Before installing pycurl, you may need \`libcurl4-openssl-dev\` on debian based distros or \`libcurl-devel\` on slackware based distros.`)
        ]);

    }
}
