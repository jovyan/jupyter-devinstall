"use strict";
import * as chalk from 'chalk';

var CHECK_MARK = '\u2714';
var CROSS = '\u2716';

/**
 * Indents each line in a block of text.
 * @param  {string} text
 * @return {string}
 */
function indent(text) {
    if (text) {
        let lines = text.split('\n');
        if (lines[lines.length-1].trim().length === 0) lines.splice(-1, 1);
        return '    ' + lines.join('\n    ');
    }
    return text;
}

/**
 * Print a success message
 * @param  {string} text
 */
export function success(text) {
    console.log(chalk.green('  ' + CHECK_MARK + ' ') + chalk.bold(text));
}

/**
 * Print a failure message
 * @param  {string} text
 */
export function failure(text) {
    console.log(chalk.red('  ' + CROSS + ' ') + chalk.bold(text));
}

/**
 * Print details of a failure or success message
 * @param  {string} text
 */
export function details(text) {
    console.log(indent(text));
}

/**
 * Print a section header
 * @param  {string} text
 */
export function section(text) {
    console.log(chalk.bold.blue('\n' + text));
}
