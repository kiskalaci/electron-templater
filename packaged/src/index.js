const electron = require('electron')
var dialog = require('electron').remote.dialog;
var app = require('electron').remote.app;
const XLSX = require('xlsx');
const path = require('path')
const fs = require('fs');
const templater = require('./templater.js');
const merger = require('./mergePdf.js');
const globals = require('./globals.js');
const pjson = require('../package.json');
const { last } = require('pdf-lib');
const templateGrid = document.getElementById('templateGrid');
const fileInputForm = document.getElementById('customFile');
const generateAll = document.getElementById('generateAll');
const addTemplate = document.getElementById('addTemplate');
const Templates = new Map();
const Patients = new Map();


let muhammara = require('muhammara'), PDFDigitalForm = require('./digiform.js');
///var pdfParser = muhammara.createReader('/Users/laszlokiska/Desktop/ANTIGEN_form.pdf');

//var digitalForm = new PDFDigitalForm(pdfParser);
var patientJson;


createTemplateGrid();

//? ========================================================================================================= 
//?                     Creates Template Grid
//? 
//? =========================================================================================================
function createTemplateGrid() {
    fs.readdir(path_templatesFolder, (err, files) => {
        var sablonList = document.getElementById("sablonList");
        sablonList.innerHTML = "";
        templateGrid.innerHTML = "";
        setupVersion();

        files.forEach(file => {

            if (file.includes(".pdf")) {

                var fileInfo = fs.statSync(path.join(path_templatesFolder, file));
                tempFile = new TemplateFile(file, path_templatesFolder + file, false, fileInfo);
                Templates.set(file, tempFile);
                var tag = document.createElement("p");
                var text = document.createTextNode(file);
                tag.appendChild(text);
                tag.className = "btn btn-light"
                tag.id = (file);
                tag.setAttribute("onclick", "buttonToggle()");
                templateGrid.appendChild(tag);

                templateSetup(tempFile, sablonList);
            }
        });
    });
}


//? ========================================================================================================= 
//?                     Setup App Version Info
//? 
//? =========================================================================================================
function setupVersion() {

    document.getElementById("pathToRsc").innerText += path_templatesFolder;
    document.getElementById("appDebug").innerText += pjson.debug;
    document.getElementById("appVersion").innerText += pjson.version;

}



//? ========================================================================================================= 
//?                    Template file button, onclick event 
//?    
//? =========================================================================================================
function buttonToggle() {

    var button = document.getElementById(event.srcElement.id);

    if (Templates.has(button.id)) {


        var file = Templates.get(button.id);


        if (file.isSelected) {
            file.isSelected = false;
            button.style.borderColor = "";
            button.style.color = "";
            button.className = "btn btn-light"
        } else {
            file.isSelected = true;
            button.style.borderColor = "#007bff";
            button.style.color = "#007bff";
        }

    }

}



//? ========================================================================================================= 
//?                     File Input Form Listener - Initiate parser method calls
//? 
//? =========================================================================================================
fileInputForm.addEventListener('change', function () {

    indexedParam = {};
    Patients.clear();

    var path = fileInputForm.files[0].path;
    var workbook = XLSX.readFile(path);
    patientJson = to_json(workbook);

    if (Object.keys(patientJson).length != 0) {

        document.getElementById("inputLabel").innerText = path;
        document.getElementById("tableHeader").innerHTML = '';
        document.getElementById("tableBody").innerHTML = '';

        createHeader(patientJson[excelMunkalapNev][0]);
        createBody(patientJson[excelMunkalapNev]);
    }
});



//? ========================================================================================================= 
//?                     Creates Table Header
//? 
//? =========================================================================================================
function createHeader(obj) {

    header = document.getElementById("tableHeader");
    var headRow = document.createElement("tr");
    var cellSelect = document.createElement("th");

    headRow.appendChild(cellSelect);


    var i;
    for (i = 0; i < obj.length; i++) {
        var th = document.createElement("th");
        th.textContent = obj[i];
        th.style.backgroundColor = i == 0 ? "#8fbaff" : "";

        th.addEventListener("click", function () {

            var ignoreFirstColumn = patientNameIndex + 1;
            document.getElementById("tableHeader").rows[0].childNodes[ignoreFirstColumn].style.backgroundColor = "";


            patientNameIndex = this.cellIndex - 1;
            this.style.backgroundColor = "#8fbaff";

        });
        headRow.appendChild(th);
    }

    header.appendChild(headRow);

    if (obj) {
        document.getElementById("gridTitle").style.display = "flex";
        document.getElementById("tableCard").style.display = "flex";

    }

}



//? ========================================================================================================= 
//?                     Creates Table Body
//? 
//? =========================================================================================================
function createBody(obj) {

    body = document.getElementById("tableBody");

    var row;
    for (row = 1; row < obj.length; row++) {

        if (obj[row].length != 0) {  // if empty then dont build table row

            //sorok száma
            var tableRow = document.createElement("tr");

            var tdSelect = document.createElement("td");

            tdSelect.style.display = "flex";
            tdSelect.justifyContent = "space-between";
            //var tdRemove = document.createElement("td");

            var buttonSelect = document.createElement("div");
            var buttonRemove = document.createElement("div");

            buttonSelect.id = obj[row][0] + obj[row][1];
            buttonSelect.className = "btn btn-primary";
            buttonSelect.textContent = "Kiválaszt";

            buttonRemove.className = "btn btn-danger";
            buttonRemove.textContent = "Töröl";



            buttonSelect.addEventListener("click", function (sender) {

                var listOfFiles = selectedFiles();
                var id = sender.toElement.id;
                var outputDir = dialog.showOpenDialogSync({ properties: ["openDirectory"] });

                var currentProcesses = new Array()
                currentProcesses.push("new event");

                if (listOfFiles.length == 0) { //!======================== No file selected

                    alert("Nincsen kiválasztva sablon!");

                } else {
                    createCopyOfTemplates(listOfFiles, outputDir[0]);
                    generateForSingleRow(id, listOfFiles, outputDir[0], currentProcesses);

                }
            });



            buttonRemove.addEventListener("click", function (sender) {

                var sender = sender.toElement;
                var tr = sender.parentElement.parentElement.remove(); //omegalol
                Patients.delete(sender.parentElement.firstElementChild.id);


            });

            tdSelect.appendChild(buttonSelect)
            tdSelect.appendChild(buttonRemove)

            tableRow.appendChild(tdSelect);
            //tableRow.appendChild(tdRemove);
            body.appendChild(tableRow);





            createPatientMap(obj[row]); //!     ===================================================     betegek map feltöl   ==============

            var cell;
            for (cell = 0; cell < obj[0].length; cell++) {  //header's length.
                //cellák száma

                var th = document.createElement("td");
                if (obj[row][cell] != null) {
                    th.textContent = obj[row][cell];
                } else {
                    th.textContent = "";
                }
                tableRow.appendChild(th);
            }

        }
    }
    if (obj) { // ! check if valid validation "Big Brain"
        document.getElementById("gridTitle").style.display = "flex";
    }
}



//? ========================================================================================================= 
//?                     Parses excel workbook - returns 
//?                 
//? =========================================================================================================
function to_json(workbook) {

    var input = document.getElementById("worksheetName");
    if (input.value == "") {
        excelMunkalapNev = input.placeholder;
    } else {
        excelMunkalapNev = input.value;
    }
    var result = {};
    try {
        var lista = XLSX.utils.sheet_to_json(workbook.Sheets[excelMunkalapNev.toString()], { header: 1 });
        assignParameter(lista);

        if (lista.length) result[excelMunkalapNev] = lista;

    } catch (error) {
        fileInputForm.value = "";
        alert("Hibás excel munkalap név!");
    }


    return result;
};



//? ========================================================================================================= 
//?                     Return selected files 
//?                 
//? =========================================================================================================
function selectedFiles() {

    var listOfFiles = [];

    Templates.forEach(function (value, tempKey, map) {
        if (value.isSelected) {
            listOfFiles.push(value);
        }
    });
    return listOfFiles;
};



//? ========================================================================================================= 
//?                     Initiates file generation method calls
//?                 
//? =========================================================================================================
async function generateForSingleRow(id, listOfFiles, outputDir, currentProcesses) {

    var key = id;
    var appDataPath;
    var toMerge = [];


    if (listOfFiles.length == 1) { //!======================== No merge needed

        appDataPath = ResolveChildDirectory(getAppDataPath(), key);
        templater.generateFile(Patients.get(key), listOfFiles[0], outputDir, function (paths) {

            //idle;
            //mergecallback(paths, listOfFiles, toMerge, key, appDataPath, currentProcesses);

        });

    } else { //!======================== merging

        appDataPath = ResolveChildDirectory(getAppDataPath(), key);

        for (var i = 0; i < listOfFiles.length; i++) {
            templater.generateFileToAppData(Patients.get(key), listOfFiles[i], appDataPath, function (paths) {
                mergecallback(paths, listOfFiles, toMerge, key, outputDir, appDataPath, currentProcesses);
            });


        }
    }
}



//? ========================================================================================================= 
//?                     Merge All Pdf Callback
//?                 
//? =========================================================================================================
function mergecallback(paths, listOfFiles, toMerge, key, outputDir, appDataPath, currentProcesses) {

    try {

        toMerge.push(paths);
        if (listOfFiles.length == toMerge.length) {
        
            merger.mergePdf(toMerge, Patients.get(key), outputDir, appDataPath);
            toMerge = [];
        }
        currentProcesses.pop();

        console.log(paths);


    } catch (error) {
        debugger;
        console.log(error);
    }
}



//? ========================================================================================================= 
//?                     Generate pdf for each datarow
//?                 
//? =========================================================================================================
generateAll.addEventListener("click", function () {
    var body = document.getElementById("tableBody");
    var children = body.childNodes;
    var listOfFiles = selectedFiles();
    var outputDir = dialog.showOpenDialogSync({ properties: ["openDirectory"] });

    if (listOfFiles.length == 0) { //!======================== No file selected

        alert("Nincsen kiválasztva sablon!");

    } else {


        var currentProcesses = new Array();
        for (var i = 0; i < (children.length * listOfFiles.length); i++) {  //! match the numbers of events
            currentProcesses.push("new event");
        }



        createCopyOfTemplates(listOfFiles, outputDir[0]);

        children.forEach(function (row, index, array) {
            generateForSingleRow(row.childNodes[0].firstElementChild.id, listOfFiles, outputDir[0], currentProcesses)
        });


    }
});



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



//? ========================================================================================================= 
//?                     Indexed Param setup. Assigns an index to each excel header item
//?                     
//? =========================================================================================================
function assignParameter(param) { // ! header debug fontos
    indexedParam = {};
    var i;
    for (i = 0; i < param[0].length; i++) {

        param[0][i] = param[0][i].trim();

        if (param[0][i] != "" || param[0][i] != null) { // if there is an emty string in the header, so it doesnt count as a column
            var ujkulcs = i;
            indexedParam[ujkulcs] = param[0][i];
        }
    }
}



//? ========================================================================================================= 
//?                     Setup Patient Map
//?                     
//? =========================================================================================================
function createPatientMap(map) {

    var rekord = {};
    var i;
    for (i = 0; i < Object.keys(indexedParam).length; i++) {
        map[i] == null ? "" : map[i];
        //rekord.set(indexedParam[i], map[i]);
        rekord[indexedParam[i]] = map[i];
    }
    Patients.set(map[0] + map[1], rekord);
}



//? ========================================================================================================= 
//?                     Add Template to "Sablonok Tab"
//?                     
//? =========================================================================================================
function templateSetup(TemplateFile, sablonList) {


    var li = document.createElement("li");
    var delButton = document.createElement("button");
    var title = document.createElement("p");
    var date = document.createElement("small");
    var block = document.createElement("div");
    // var hidden = document.createElement("div");


    //list item setup
    li.style.justifyContent = "space-between";
    li.style.display = "flex";
    li.className = "list-group-item";

    //p add text
    date.className = "text-muted";
    title.textContent = TemplateFile.fileName;
    var datetext = "";
    var time = TemplateFile.fileInfo.mtime;
    datetext = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + "/" + time.getFullYear();
    date.textContent = "Utolsó Modosítás Dátuma: " + datetext;

    //del button setup
    delButton.className = "btn btn-danger";
    delButton.textContent = "töröl";

    delButton.addEventListener("click", function (param) {

        removeSablon(TemplateFile, li);


    });

    //append children
    block.appendChild(title);
    block.appendChild(date);
    li.appendChild(block);
    //li.appendChild(title);
    li.appendChild(delButton);

    sablonList.appendChild(li);

}



//? ========================================================================================================= 
//?                    Delete Template and remove from grid
//?                    
//? =========================================================================================================
function removeSablon(TemplateFile, row) {
    try {
        fs.unlinkSync(TemplateFile.filePath);
        row.parentNode.removeChild(row);
        var temp = document.getElementById(TemplateFile.fileName);
        temp.parentNode.removeChild(temp);
        Templates.delete(TemplateFile.fileName);

    } catch (error) {
        console.log(error);
        debugger;
    }

}



//? ========================================================================================================= 
//?                   Add Template to file system
//?                    
//? =========================================================================================================
addTemplate.addEventListener("click", function (sender) {

    try {
        var file = dialog.showOpenDialogSync();

        if (file[0].includes(".pdf")) {
            var fileName = file[0].split("/");
            fileName = fileName[fileName.length - 1];

            var destination = path.join(path_templatesFolder, fileName);

            fs.copyFileSync(file[0], destination, (err) => {
                if (err) throw err;
                console.log('pdf file was copied to destination directory');
            });


            createTemplateGrid();
        } else {
            alert("Nem megfelelő fájl formátum !");
        }
    } catch (error) {

    }



});



//? ========================================================================================================= 
//?                   Create Copy of tempfile in output dir since asar format
//?                    only allows read and not write of rsc files (ex: template files :)..)
//? =========================================================================================================
function createCopyOfTemplates(listOfFiles, outputDir) {
    /*
        try {
    
            outputDir = path.join(outputDir, electronTemplatesHelper)
    
            if (fs.existsSync(outputDir)) {
                fs.readdir(outputDir, (err, files) => {
                    files.forEach(file => {
                        fs.unlinkSync(path.join(outputDir, file));
                    });
                });
            } else {
                fs.mkdirSync(outputDir);
            }
    
    
            for (var i = 0; i < listOfFiles.length; i++) {
    
                var fileName = listOfFiles[i].filePath.split("/");
                fileName = fileName[fileName.length - 1];
                var tempPath = path.join(outputDir, fileName);
                fs.copyFileSync(listOfFiles[i].filePath, tempPath);
                listOfFiles[i].filePath = tempPath;
                listOfFiles[i].templatesHelperDir = outputDir;
            }
    
        } catch (error) {
            console.log(error);
            debugger;
        }
    */
}






//? ========================================================================================================= 
//?                   Get App Data Path
//?                    
//? =========================================================================================================
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





class TemplateFile {
    constructor(fileName, filePath, isSelected, fileInfo) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.isSelected = isSelected;
        this.fileInfo = fileInfo;
    }
}








