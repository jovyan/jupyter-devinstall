"use strict"
import * as chalk from 'chalk';

var CHECK_MARK = '\u2714';
var CROSS = '\u2716';
function indent(text) {
    if (text) {
        let lines = text.split('\n');
        if (lines[lines.length-1].trim().length === 0) lines.splice(-1, 1);
        return '    ' + lines.join('\n    ');
    }
    return text;
};
export function success(text) {
    console.log(chalk.green('  ' + CHECK_MARK + ' ') + chalk.bold(text));
};
export function failure(text) {
    console.log(chalk.red('  ' + CROSS + ' ') + chalk.bold(text));
};
export function details(text) {
    console.log(indent(text));
};
export function section(text) {
    console.log(chalk.bold.blue('\n' + text));
};
