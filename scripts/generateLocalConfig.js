'use strict';

const fs = require('fs');

const LOCAL_CONFIG_PATH = 'config/local.json';

if (!process.argv[2]) {
  console.log('Please provide an environment name that matches a filename in the config directory');
}
else {
  const env = process.argv[2];
  const ENV = env.toUpperCase();
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID ||
    process.env[`AWS_ACCESS_KEY_ID_${ENV}`];
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ||
    process.env[`AWS_SECRET_ACCESS_KEY_${ENV}`];

  const conf = {
    env,
    auth: {
      password: process.env[`PASSWORD_${ENV}`]
    },
    lambda: {
      auth: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
      }
    }
  };
  let exists;
  try {
    fs.statSync(LOCAL_CONFIG_PATH);
    exists = true;
  }
  catch (e) {
    exists = false;
  }

  if (!exists) {
    fs.writeFile(LOCAL_CONFIG_PATH, JSON.stringify(conf, null, 2), (err) => {
      if (err) {
        throw err;
      }
      console.log(`${LOCAL_CONFIG_PATH} generated successfully.`);
    });
  }
  else {
    console.log(`${LOCAL_CONFIG_PATH} already exists.`);
  }
}
