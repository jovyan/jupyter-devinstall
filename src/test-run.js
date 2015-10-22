import {run} from './run';
import {success, failure, details} from './logging';

export function testRun(command, alias, failureDetails) {
    alias = alias || command.split(' ')[0];
    
    return run(command).then(stdout => {
        success(alias + ' is installed');
        if (stdout.trim().length > 0) {            
            details(stdout);
        }
    }).catch(err => {
        failure(alias + ' is installed');
        details(failureDetails || alias + ' is not installed, please install ' + alias + '');
        process.exit(1);
    });
}
