'use strict';

const AppConfig = require('../models/app_configuration.js');
const { sendToApi } = require('../models/send-to-api.js');
const Logger = require('../logger.js');
const application = require('@clevercloud/client/cjs/api/application.js');
const organisation = require('@clevercloud/client/cjs/api/organisation.js');

async function listNamespaces (params) {
  const { alias } = params.options;
  const { ownerId } = await AppConfig.getAppDetails({ alias });

  const namespaces = await organisation.getNamespaces({ id: ownerId }).then(sendToApi);

  Logger.println('Available namespaces: ' + namespaces.map(({ namespace }) => namespace).join(', '));
};

async function add (params) {
  const { alias, namespace } = params.options;
  const { ownerId, appId } = await AppConfig.getAppDetails({ alias });

  const { port } = await application.addTcpRedir({ id: ownerId, appId }, { namespace }).then(sendToApi);

  Logger.println('Successfully added tcp redirection on port: ' + port);
};

async function remove (params) {
  const [port] = params.args;
  const { alias, namespace } = params.options;
  const { ownerId, appId } = await AppConfig.getAppDetails({ alias });

  await application.removeTcpRedir({ id: ownerId, appId, sourcePort: port, namespace }).then(sendToApi);

  Logger.println('Successfully removed tcp redirection.');
};

module.exports = { listNamespaces, add, remove };
