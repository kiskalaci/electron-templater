const PDFMerger = require('pdf-merger-js');
const fs = require('fs');
const path = require('path')
var muhammara = require('muhammara'),
    lockForm = require('./lockform.js').lockForm;

var furthermerge = [];

async function mergePdf(sources, PatientData, outputDir, appDataPath, currentProcesses) {

    try {
        debugger;
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


        furthermerge.push(filePath);

        sources = [];

        var files = fs.readdirSync(appDataPath);
        for (var i = 0; i < files.length; i++) {
            var filaPath = path.join(appDataPath, files[i]);
            if (fs.existsSync(filaPath)) {
                fs.unlinkSync(filaPath);
            }
        }
        fs.rmdirSync(appDataPath);

        processCounter(currentProcesses, outputDir);

    } catch (error) {
        console.log(error);
        furthermerge = [];
        debugger;
    }
}


function processCounter(currentProcesses, outputDir) {


    currentProcesses.pop();


    var modal = document.getElementById("myModal");
    var progressBar = document.getElementById("progressBar");
    var doneCount = modal.value - currentProcesses.length;

    var width = (doneCount / modal.value) * 100 + "%";

    progressBar.style.width = width;
    progressBar.innerText = doneCount + "/" + modal.value;

    if (currentProcesses.length == 0) {

        if (furthermerge.length > 1) {
            mergePdfFurther(furthermerge, outputDir);
        } else {
            var delayInMilliseconds = 1000; //1 second

            setTimeout(function () {

                progressBar.innerText = "kész :)!";


                setTimeout(function () {

                    modal.style.display = "none";


                }, delayInMilliseconds);

            }, delayInMilliseconds);
            furthermerge = [];
        }
    }

}



async function mergePdfFurther(sources, outputDir) {

    try {

        var merger = new PDFMerger();
        var fileName = "output.pdf";
        var fileExtension = ".pdf";
        //! indexedParam[ x ] should be function param

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



        for (var i = 0; i < furthermerge.length; i++) {
            if (fs.existsSync(furthermerge[i])) {
                fs.unlinkSync(furthermerge[i]);
            }
        }


        var delayInMilliseconds = 1000; //1 second

        setTimeout(function () {
            progressBar.innerText = "kész :)!";
            setTimeout(function () {
                modal.style.display = "none";
            }, delayInMilliseconds);
        }, delayInMilliseconds);


        furthermerge = [];
    } catch (error) {
        console.log(error);
        furthermerge = [];
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


