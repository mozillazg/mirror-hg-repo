mirror-hg-repo
----------------

A GitHub Action to mirror Mercurial (hg) repository to GitHub.

.. contents::

Example Usage
==============

.. code-block:: yaml

      - name: Setup Python 2
        uses: actions/setup-python@v4
        with:
          python-version: 2.7

      - name: mirror https://foss.heptapod.net/pypy/cffi
        uses: 'mozillazg/mirror-hg-repo@v1'
        with:
          source-hg-repo-url: 'https://foss.heptapod.net/pypy/cffi'
          destination-git-repo-owner: 'mozillazg'
          destination-git-repo-name: 'cffi'
          destination-git-personal-token: '${{ secrets.PERSONAL_GIT_TOKEN }}'

Inputs
======

* ``source-hg-repo-url``: (**Required**) The clone URL of a Mercurial (hg) repository. e.g. https://foss.heptapod.net/pypy/cffi
* ``destination-git-repo-owner``: (**Required**) The owner of Github repository.
* ``destination-git-repo-name``: (**Required**) The name of Github repository.
* ``destination-git-personal-token``: (**Required**) A `Github personal access token`_ which have permission to push codes to the repository.
* ``force-push``: (Optional) Run ``git push`` command with the ``--force`` flag. The default value is: ``false``

.. _Github personal access token: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token
