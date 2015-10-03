"use strict";

import * as child_process from 'child_process';

/**
 * Run a shell command
 * @param  {string} cmd
 * @return {Promise<stdout, stderr>} Promise with standard output and error results
 */
export function run(cmd) {
    return new Promise((res, rej) => {
        child_process.exec(cmd, function(error, stdout, stderr) {
            if (error !== null) {
                rej(error);
            } else {
                res(stdout, stderr);
            }
        });
    });
}
