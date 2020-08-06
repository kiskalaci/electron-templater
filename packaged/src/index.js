const electron = require('electron')
var dialog = require('electron').remote.dialog;
var app = require('electron').remote.app;
const XLSX = require('xlsx');
const path = require('path')
const fs = require('fs');
const templateGrid = document.getElementById('templateGrid');
const fileInputForm = document.getElementById('customFile');
const Templates = new Map();
const Patients = new Map();
const templater = require('./templater.js');
const merger = require('./mergedocx.js');
const globals = require('./globals.js');
const pjson = require('../package.json');

var patientJson;


//? ========================================================================================================= 
//?                     Creates Template Grid
//? 
//? =========================================================================================================
fs.readdir(path_templatesFolder, (err, files) => {
    var sablonList = document.getElementById("sablonList");

    setupVersion();

    files.forEach(file => {

        if (file.includes(".docx")) {

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

            addTemplate(tempFile, sablonList);
        }
    });
});



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
    var emptycell = document.createElement("th");
    headRow.appendChild(emptycell);

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
            var button = document.createElement("div");

            button.id = obj[row][0] + obj[row][1];
            button.className = "btn btn-link";
            button.textContent = "Select Patient"
            button.addEventListener("click", function (sender) {
                selectPatientOnClick(sender);
            });

            body.appendChild(tableRow);
            tableRow.appendChild(button);


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
        alert("Hibás excel munkalap név!");
    }


    return result;
};



//? ========================================================================================================= 
//?                     Initiates file generation method calls
//?                 
//? =========================================================================================================
function selectPatientOnClick(sender) {
    var key = sender.toElement.id
    var outputDir = dialog.showOpenDialogSync({ properties: ["openDirectory"] });
    var innerChildDirectory = ResolveChildDirectory(outputDir, key);
    var selected = false;

    var listOfFiles = [];
    Templates.forEach(function (value, tempKey, map) {
        if (value.isSelected) {
            selected = true;
            listOfFiles.push(value);
        }
    });

    if (selected == false) { //!======================== No file selected

        alert("Nincsen kiválasztva sablon!");

    } else if (listOfFiles.length == 1) { //!======================== No merge needed

        templater.generateFile(Patients.get(key), listOfFiles[0], innerChildDirectory);

    } else { //!======================== merging

        var tempFile = merger.generateSingleFile(listOfFiles);
        debugger;
        templater.generateFile(Patients.get(key), tempFile, innerChildDirectory);

    }
}




//? ========================================================================================================= 
//?                     Resolves save directory
//?                 
//? =========================================================================================================
function ResolveChildDirectory(outputDir, key) {
    outputDir += "/"; //TODO

    var counter = 0;
    var ertek = indexedParam[patientNameIndex];
    var innerDirPath = outputDir + Patients.get(key)[ertek];

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
    debugger;
}



//? ========================================================================================================= 
//?                     Indexed Param setup. Assigns an index to each excel header item
//?                     
//? =========================================================================================================
function createPatientMap(map) {

    var rekord = {};
    var i;
    for (i = 0; i < Object.keys(indexedParam).length; i++) {
        map[i] == null ? "" : map[i];
        rekord[indexedParam[i]] = map[i];
    }
    Patients.set(map[0] + map[1], rekord);
}



//? ========================================================================================================= 
//?                     Add Template to "Sablonok Tab"
//?                     
//? =========================================================================================================
function addTemplate(TemplateFile, sablonList) {


    var li = document.createElement("li");
    var delButton = document.createElement("button");
    var title = document.createElement("p");
    var date = document.createElement("small");
    var block = document.createElement("div");
    var hidden = document.createElement("div");


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
    delButton.className = "delButton";
    delButton.className = "btn btn-link delButton";
    delButton.textContent = "töröl";

    //append children
    block.appendChild(title);
    block.appendChild(date);
    li.appendChild(block);
    //li.appendChild(title);
    li.appendChild(delButton);

    sablonList.appendChild(li);

}



//TODO ========================================================================================================= 
//TODO                    Delete Template
//TODO                    
//TODO =========================================================================================================
function removeSablon(TemplateFile) {
    debugger;
}

class TemplateFile {
    constructor(fileName, filePath, isSelected, fileInfo) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.isSelected = isSelected;
        this.fileInfo = fileInfo;
    }
}








