"use strict"
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';

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
};

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
};
