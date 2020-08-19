const { globalShortcut } = require("electron")
const pjson = require('../package.json');
const app = require('electron').remote.app;
const path = require('path');



global.path_templatesFolder = pjson.debug ? "./assets/Template/" : path.join(app.getAppPath() + ".unpacked/", "./assets/Template/");
global.fontFolder = pjson.debug ? "./assets/fonts/" : path.join(app.getAppPath() + ".unpacked/", "./assets/fonts/");
global.excelParam = "Param";
global.patientNameIndex = 0;
global.indexedParam = {};
global.electronTemplatesHelper = "ElectronTemplatesHelper";

