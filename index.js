/* eslint-disable no-console */
'use strict';
const functions = require('./handler');

if (process.argv[2] && functions[process.argv[2]]) {
  console.log(`Start: ${new Date()}`);
  functions[process.argv[2]](null, null, () => {
    console.log(`End: ${new Date()}`);
  });
}
else {
  console.log(`Please provide a valid function name as logMLStatistics`);
}
