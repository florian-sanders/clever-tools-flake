var _ = require("lodash");
var Bacon = require("baconjs");

var Logger = require("../logger.js");

var AppConfig = require("../models/app_configuration.js");
var Application = require("../models/application.js");
var Addon = require("../models/addon.js");

var service = module.exports;

var list = service.list = function(api, params) {
  var alias = params.options.alias;
  var showAll = params.options["show-all"];
  var onlyApps = params.options["only-apps"];
  var onlyAddons = params.options["only-addons"];

  if(onlyApps && onlyAddons) {
    Logger.error("--only-apps and --only-addons are mutually exclusive");
    process.exit(1);
  } else {
    var s_appData = AppConfig.getAppData(alias);

    var s_dependencies = s_appData.flatMap(function(appData) {
      return Bacon.combineTemplate({
        apps: !onlyAddons ? Application.listDependencies(api, appData.app_id, appData.org_id, showAll) : null,
        addons: !onlyApps ? Addon.list(api, appData.app_id, appData.org_id, showAll) : null
      });
    });

    s_dependencies.onValue(function(dependencies) {
      if(dependencies.apps !== null) {
        Logger.println("Applications:");
        Logger.println(dependencies.apps.map(function(x) { return "  " + x.name; }).join('\n'));
      }
      if(dependencies.addons !== null) {
        Logger.println("Addons:");
        Logger.println(dependencies.addons.map(function(x) { return "  " + x.name; }).join('\n'));
      }
    });

    s_dependencies.onError(Logger.error);
  }

};
