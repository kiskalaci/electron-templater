const { globalShortcut } = require("electron")
const pjson = require('../package.json');
const app = require('electron').remote.app;
const path = require('path');


global.path_templatesFolder = pjson.debug ? "./assets/Template/" : path.join(app.getAppPath(), "./assets/Template/");
global.tempFolder = pjson.debug ? "./assets/Temp/" : path.join(app.getAppPath(), "./assets/Temp");
global.tempDocumentName = "output.docx";
global.excelMunkalapNev = "Sheet1";//"PáciensLista";
global.excelParam = "Param"
global.patientNameIndex = 0;
global.indexedParam = {};