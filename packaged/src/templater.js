var dialog = require('electron').remote.dialog;
var fs = require('fs');
var path = require('path');
const globals = require('./globals.js');
const pjson = require('../package.json');
var muhammara = require('muhammara');
const { exec } = require('child_process');
let fillForm = require('./fillform.js').fillForm;
let lockForm = require('./lockform.js').lockForm;

function getAppDataPath() {
    switch (process.platform) {
        case "darwin": {
            return path.join(process.env.HOME, "Library", "Application Support", pjson.name);
        }
        case "win32": {
            return path.join(process.env.APPDATA, pjson.name);
        }
        case "linux": {
            return path.join(process.env.HOME, pjson.name);
        }
        default: {
            console.log("Unsupported platform!");
            process.exit(1);
        }
    }
}

function getBinaryPath() {
    switch (process.platform) {
        case "darwin": {
            return "/usr/local/bin/pdftk";
        }
        case "win32": {
            return "pdftk";
        }
        case "linux": {
            return path.join(process.env.HOME, pjson.name);
        }
        default: {
            console.log("Unsupported platform!");
            process.exit(1);
        }
    }
}




// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
        }, {});
    }
    return value;
}




function errorHandler(error) {
    console.log(JSON.stringify({ error: error }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}





//? ========================================================================================================= 
//?                     Fill pdf form
//?                     
//? =========================================================================================================
function generateFile(PatientData, TemplateFile, outputDir, appDataPath, cb) {
    try {

        var fileName = TemplateFile.fileName;
        fileName = PatientData[indexedParam[0]] + "_" + fileName;
        var filePath = path.join(outputDir, fileName);
        filePath = resolveOutPutFilePath(filePath);
        var temporaryFile = getTemporaryFilePath(appDataPath, fileName);


        var writer = muhammara.createWriterToModify(TemplateFile.filePath, {
            modifiedFilePath: temporaryFile
        });
        fillForm(writer, PatientData);
        writer.end();


        writer = muhammara.createWriterToModify(temporaryFile, {
            modifiedFilePath: filePath
        });
        lockForm(writer);
        writer.end();

        fs.unlinkSync(temporaryFile, (err) => { if (err) { console.log("Cannot delete temporary pdf file: " + err) } });
        fs.rmdirSync(appDataPath);

        //alert("A pdf sikeresen generálódott!");
        cb(filePath);
    } catch (error) {
        debugger;
        errorHandler(error);
    }
}



//? ========================================================================================================= 
//?                     Fill pdf form
//?                     
//? =========================================================================================================
function generateFileToAppData(PatientData, TemplateFile, appDataPath, cb) {
    try {


        var fileName = TemplateFile.fileName;
        fileName = PatientData[indexedParam[0]] + "_" + fileName;
        var filePath = path.join(appDataPath, 'flattened' + fileName);
        filePath = resolveOutPutFilePath(filePath);
        var temporaryFile = getTemporaryFilePath(appDataPath, fileName);


        var writer = muhammara.createWriterToModify(TemplateFile.filePath, {
            modifiedFilePath: temporaryFile
        });
        fillForm(writer, PatientData);
        writer.end();


        writer = muhammara.createWriterToModify(temporaryFile, {
            modifiedFilePath: filePath
        });
        lockForm(writer);
        writer.end();

        fs.unlinkSync(temporaryFile, (err) => { if (err) { console.log("Cannot delete temporary pdf file: " + err) } });

        cb(filePath);

    } catch (error) {
        debugger;
        errorHandler(error);
    }
}




function getTemporaryFilePath(appDataPath, fileName) {

    var fileExtension = '.pdf';
    var filePath = path.join(appDataPath, fileName);
    var counter = 0;


    while (fs.existsSync(filePath)) {

        var pathWithoutExtension = filePath.split(".pdf");
        pathWithoutExtension = pathWithoutExtension[0];

        pathWithoutExtension = pathWithoutExtension.replace("(" + counter + ")", "");
        counter++;
        pathWithoutExtension = pathWithoutExtension + "(" + counter + ")";

        filePath = pathWithoutExtension + fileExtension;
    }
    return filePath;
}


function resolveOutPutFilePath(filePath) {


    var fileExtension = '.pdf';
    var counter = 0;


    while (fs.existsSync(filePath)) {

        var pathWithoutExtension = filePath.split(".pdf");
        pathWithoutExtension = pathWithoutExtension[0];

        pathWithoutExtension = pathWithoutExtension.replace("(" + counter + ")", "");
        counter++;
        pathWithoutExtension = pathWithoutExtension + "(" + counter + ")";

        filePath = pathWithoutExtension + fileExtension;
    }
    return filePath;
}


module.exports = { generateFile, generateFileToAppData };