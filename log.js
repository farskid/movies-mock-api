const endpointLog = (verb, endpoint) => {
  console.log(`log: ${Date.now()} ${verb} ${endpoint}`);
};
const log = (...args) => console.log(`log: ${Date.now()} `, ...args);
module.exports = { endpointLog, log };
