# Marklogic-Statistics
To fetch the marklogic resources statistics information and push it to slack channel.

## JIRA requirement ticket
[SUP-2723 | Automate Marklogic Statistics Logging to #marklogic_hypercare channel](https://nbcdigital.atlassian.net/browse/SUP-2463)

The application will retrieve the below resource statistics information:
        * CPU Utilized in %
        * Memory Utilized in GB
        * nbc-snl-node AppServer Request Rate in req/sec
        * nbc-park AppServer Request Rate in req/sec


### Setting it up
* Clone repo and do a `npm install`
* Execute the following command -
  `node ./scripts/generateLocalConfig.js prod` to generate  _local.json_.

How to run the application when using it as lambda function:

You need to configure your own local configuration file like local.json from the reference of default.json file.
Note:

  Please refer to the README.md file under config folder


## Running the application locally
* Run the command "node ./node/generateLocalConfig.js <env>" which will generate the local.json
* Please add the environment specific password credential to the local.json
    Ex:   "auth": {
            "password": <value must be given>
          }
* Run the command "node index.js logMLStatistics"
