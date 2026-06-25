const dashboardServer = require('../lib/dashboardServer');

module.exports = (req, res) => {
  dashboardServer.handleRequest(req, res);
};
