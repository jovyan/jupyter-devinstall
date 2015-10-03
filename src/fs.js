"use strict";

import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

/**
 * Promiseful version of mkdirp
 * @param  {string} path
 * @return {Promise}
 */
export function mkdir(path) {
    return new Promise((resolve, reject) => {
        mkdirp(path, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Passes if a directory doesn't exist.
 * @param  {string} path
 * @return {Promise}
 */
export function doesntExist(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                resolve();
            } else {
                reject(stats);
            }
        });
    });
}
