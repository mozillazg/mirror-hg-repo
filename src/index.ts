'use strict';

import * as core from '@actions/core';
import * as io from '@actions/io';
import * as utils from  "./utils";

async function installGitRemoteHg(dir: string) {
    const gitPath = await io.which('git', true);
    const pipPath = await io.which('pip', true);

    await utils.execOut(pipPath, ['install', 'mercurial==5.5.2', '--user'], false, '');

    const repoPath = `${dir}/git-remote-hg`;
    await io.mkdirP(repoPath);

    await utils.execOut(
        gitPath,
        ['clone', 'https://github.com/mozillazg/git-remote-hg.git', '-b', 'for-gh-action', '--depth', '1', repoPath],
        false, '',
        );

    const chmodPath = await io.which('chmod', true);
    const toolPath = `${repoPath}/git-remote-hg`;
    await utils.execOut(chmodPath, ['+x', `${toolPath}`], false, '');
    await io.cp(toolPath, '/usr/local/bin/git-remote-hg', { recursive: false, force: false });

    return `${repoPath}/track_all_remote_branches.py`;
}

async function mirrorHgRepo(dir: string, hgURL: string, gitURL: string, trackTool: string, forcePush: boolean) {
    const gitPath = await io.which('git', true);
    const pythonPath = await io.which('python', true);
    const bashPath = await io.which('bash', true);
    const repoPath = `${dir}/hg_repo`;
    await io.mkdirP(repoPath);

    await utils.execOut(gitPath, ['clone', `hg::${hgURL}`, repoPath], false, dir);
    await utils.execOut(gitPath, ['config', 'core.notesRef', 'refs/notes/hg'], false, repoPath);
    // await utils.execOut(
    //     bashPath,
    //     ['-c', 'for remote in `git branch|grep -v \'\\* master\'`; do git branch -d $remote; done'],
    //     false, repoPath);
    // await utils.execOut(pythonPath, [trackTool], false, repoPath);

    // await utils.execOut(gitPath, ['pull'], false, repoPath);
    // await utils.execOut(gitPath, ['reset', '--hard', 'default'], false, repoPath);
    await utils.execOut(gitPath, ['fetch', 'origin'], false, repoPath);
    await utils.execOut(gitPath, ['fetch', 'origin', '--tags'], false, repoPath);
    await utils.execOut(bashPath, ['-c', `"${gitPath} branch --track default origin/master || true"`], false, repoPath);

    const extraArgs = [];
    if (forcePush) {
        extraArgs.push('--force');
    }
    await utils.execOut(gitPath, ['push', gitURL, '--all'].concat(extraArgs), false, repoPath);
    await utils.execOut(gitPath, ['push', gitURL, '--tags'].concat(extraArgs), false, repoPath);
}

async function main() {
    const hgRepoURL = core.getInput('source-hg-repo-url', { required: true });
    // const gitDomain = core.getInput('destination-git-domain', { required: false });
    // const gitScheme = core.getInput('destination-git-scheme', { required: false });
    const gitDomain = 'github.com';
    const gitScheme = 'https';
    const gitRepoOwner = core.getInput('destination-git-repo-owner', { required: true });
    const gitRepoName = core.getInput('destination-git-repo-name', { required: true });
    const forcePush = core.getBooleanInput('force-push', { required: false });

    const gitToken = core.getInput('destination-git-personal-token', { required: true });
    core.setSecret(gitToken);

    const reValidStrInput = /^[-\w:\/\.@]+$/;
    const checkInputs = {
        'source-hg-repo-url': hgRepoURL,
        'destination-git-domain': gitDomain,
        'destination-git-scheme': gitScheme,
        'destination-git-repo-owner': gitRepoOwner,
        'destination-git-repo-name': gitRepoName,
        'destination-git-personal-token': gitToken,
    }
    let invalid = false;
    Object.entries(checkInputs).forEach(function (v) {
        if (!reValidStrInput.test(v[1])) {
            core.setFailed(`${v[0]}: invalid input`);
            invalid = true;
        }
    })
    if (invalid) {
        return;
    }

    const gitRepoURL = `${gitScheme}://${gitRepoOwner}:${gitToken}@${gitDomain}/${gitRepoOwner}/${gitRepoName}.git`;

    const tmpDir = await utils.execOut('mktemp', ['-d', '--suffix', '-mirror-hg-dir'], true, '');
    const trackTool = await installGitRemoteHg(tmpDir);
    await mirrorHgRepo(tmpDir, hgRepoURL, gitRepoURL, trackTool, forcePush);
}

main();
