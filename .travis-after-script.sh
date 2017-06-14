#!/bin/bash
source node_modules/park-sh/lib/git.sh
source node_modules/park-sh/lib/travis.sh
set -ev

# Deploy the Serverless stack to the corresponding environment.
# It assumes that the branches are "dev", "stage" and "prod". To override the
# branch names use "export DEPLOYABLE_BRANCHES=(br1 br2 br3 br4)".
source node_modules/park-sh/lib/serverless.sh
doDeploy
