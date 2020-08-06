var DocxMerger = require('docx-merger');

const fs = require('fs');
const path = require('path');
const globals = require('./globals.js');



//? ========================================================================================================= 
//?                    Return Temp Dir Path, creates dir if non existent
//?                     
//? =========================================================================================================
function getTemporaryDirectory() {
    try {
        if (fs.existsSync(tempFolder) == false) {
            fs.mkdirSync(tempFolder);
            return tempFolder;
        }
    } catch (error) {
        console.log("sikertelen temp dir készítés");
    }
    return tempFolder;
}



//? ========================================================================================================= 
//?                     Delete Temp Dir Content
//?                     
//? =========================================================================================================
function deleteTemporaryDirectoryContent() {
    try {
        if (fs.existsSync(tempFolder) == true) {

            var files = fs.readdirSync(tempFolder);
            for (var i = 0; i < files.length; i++) {
                fs.unlinkSync(path.join(tempFolder, files[i]));
            }
        }
    } catch (error) {
        console.log("sikertelen temp dir törlés");
    }
}


//? ========================================================================================================= 
//?                     Merge Conntent 
//!                     -- debug
//!                     -- sometimes fails and returns "unidentified" instead of TemplateFile obj. 
//!                     -- Docx templater receives returned value and fails if return value is null.
//? =========================================================================================================
function generateSingleFile(paths) {
    try {

        var outputPath = getTemporaryDirectory();
        deleteTemporaryDirectoryContent();


        outputPath = path.join(outputPath, tempDocumentName);

        var fileList = [];
        for (var i = 0; i < paths.length; i++) {
            var toAdd = fs.readFileSync(paths[i].filePath, 'binary');
            fileList.push(toAdd);
        }


        var docx = new DocxMerger({}, fileList);


        debugger;
        docx.save('nodebuffer', function (data) {
            // fs.writeFile("output.zip", data, function(err){/*...*/});
            fs.writeFileSync(outputPath, data, function (err) {
                console.log(err);
            });
        });

        var fileInfo = fs.statSync(outputPath);
        var file = new TemplateFile(tempDocumentName, tempFolder + tempDocumentName, false, fileInfo);

        return file;

    } catch (error) {
        debugger;
        console.log("sikertelen generálás: $error")
    }
}

module.exports = { generateSingleFile }


