'use strict';

import * as actionsExec from '@actions/exec';
import { ExecOptions } from '@actions/exec';

async function exec(command: string, args: string[], silent: boolean, cwd: string) {
    let stdout = '';
    let stderr = '';

    const options: ExecOptions = {
        silent: silent,
        ignoreReturnCode: true
    };
    if (cwd !== '') {
        options.cwd = cwd;
    }
    options.listeners = {
        stdout: (data: Buffer) => {
            stdout += data.toString();
        },
        stderr: (data: Buffer) => {
            stderr += data.toString();
        }
    };

    const returnCode: number = await actionsExec.exec(command, args, options);

    return {
        success: returnCode === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim()
    };
}

export async function execOut(command: string, args: string[], silent: boolean, cwd: string) {
    return await exec(command, args, silent, cwd).then(function (ret) {
        if (ret.stderr != '' && !ret.success) {
            throw new Error(ret.stderr + '\n\n' + ret.stdout);
        }
        return ret.stdout.trim();
    });
}
