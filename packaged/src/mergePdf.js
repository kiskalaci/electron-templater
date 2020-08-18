const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path')
var muhammara = require('muhammara'),
    lockForm = require('./lockform.js').lockForm;



async function mergePdf(sources, PatientData, outputDir, appDataPath) {

    try {

        var merger = new PDFMerger();
        var fileName = "output.pdf";
        var fileExtension = ".pdf";
        //! indexedParam[ x ] should be function param

        fileName = PatientData[indexedParam[0]] + "_" + fileName;
        var filePath = path.join(outputDir, fileName);
        for (var i = 0; i < sources.length; i++) {
            merger.add(sources[i]);
        }


        var counter = 0;
        while (fs.existsSync(filePath)) {

            var pathWithoutExtension = filePath.split(".pdf");
            pathWithoutExtension = pathWithoutExtension[0];

            pathWithoutExtension = pathWithoutExtension.replace("(" + counter + ")", "");
            counter++;
            pathWithoutExtension = pathWithoutExtension + "(" + counter + ")";

            filePath = pathWithoutExtension + fileExtension;
        }

        await merger.save(filePath);

        sources = [];

        var files = fs.readdirSync(appDataPath);
        for (var i = 0; i < files.length; i++) {
            var filaPath = path.join(appDataPath, files[i]);
            if (fs.existsSync(filaPath)) {
                fs.unlinkSync(filaPath);
            }
        }
        fs.rmdirSync(appDataPath);





        var writer = muhammara.createWriterToModify(filePath, {
            modifiedFilePath: "/Users/laszlokiska/Desktop/output.pdf"
        });


        lockForm(writer);
        writer.end();
    } catch (error) {
        console.log(error);
        debugger;
    }
}




//? ========================================================================================================= 
//?                     Resolves save directory
//?                 
//? =========================================================================================================
function ResolveChildDirectory(outputDir, key) {

    var counter = 0;
    var ertek = indexedParam[patientNameIndex];


    //var innerDirPath = path.join(outputDir, Patients.get(key).get(ertek));//!==========================================     Compatible with map!
    var innerDirPath = path.join(outputDir, Patients.get(key)[ertek]);

    while (fs.existsSync(innerDirPath)) {
        innerDirPath = innerDirPath.replace("(" + counter + ")", "");
        counter++;
        innerDirPath = innerDirPath + "(" + counter + ")";
    }
    //TODO              makes dir even if no template is selected. Results in error + empty dir created
    fs.mkdirSync(innerDirPath);

    return innerDirPath;
}



module.exports = { mergePdf }



/*
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
            // fs.writeFile("output.zip", data, function(err){//error});
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


*/