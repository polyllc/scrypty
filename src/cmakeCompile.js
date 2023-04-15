let prompt = require("prompt-sync")();
let colorText = require("./scryptylib").colorText;
let s = require("./scryptylib");
let fs = require("fs");
const { exec } = require("child_process");
const cmake = require("./scryptyCmake");


async function findIfCMake(allFiles){
    s.log("Searching for CMakeLists");
    let cmakefile = allFiles.find((element) => {return element.indexOf("CMakeLists.txt") != -1 ? true : false;}) !== undefined ? true : false; //todo, make sure it's in root folder!
    return new Promise((resolve) => {
        resolve(cmakefile);
    });
}


async function compileCmake(folder, programName){

    console.log(colorText(s._cyan, s._bright + "[1]") + " Setup Build Environment (do this one first!)");
    console.log(colorText(s._cyan, s._bright + "[2]") + " Build");
    console.log(colorText(s._cyan, s._bright + "[3]") + " Install");

    let validNum = false;
    let option;
    while(!validNum){
       let r = prompt(colorText(s._cyan, "Choose the CMake command to do. If this the first time you're seeing this prompt while installing this repo, then press 1 (setup build environment): "));


        //geniunely no idea why this works, does prompt make it an integer already? if so, i know how this works
        if(parseInt(r)){
            if(r > 0 && r <= 3){
                option = r;    
                validNum = true;
                s.log("compileCmake, Chose " + r);
            }  
            else{
                console.log(colorText(s._red, "Choose a valid option!"));
            }
        }
        else{
            console.log(colorText(s._red, "Choose a valid option!!"));
        }
    }


    let cmakeResults = cmake.parseCmake(folder + "\\CMakeLists.txt");

    let cmakeResultsArray = [];
    console.log(cmakeResultsArray);

    cmakeResults.forEach((value, key) => {
        cmakeResultsArray.push({name: key, selected: value});
    });

    if(cmakeResultsArray.length == 0){
        runCMake();
    }
    else{
        let results = await s.listOptions(cmakeResultsArray, colorText(s._green, "Choose CMake options, space to toggle, enter to accept\nThese are the default settings, so you can just skip if you want"));
        runCMake(results);
    }
        
        


        

    function runCMake(answers = []) {
        let spinner =  new s.spinner(100, colorText(s._white, "Building", s._bgGreen));
        spinner.start();
        process.stdout.cursorTo(0,0);
        process.stdout.clearScreenDown();
            switch (option) {
                case "1": 
                
                let updatedAnswers = [];

                for(var i = 0; i < cmakeResultsArray.length; i++){
                    if(cmakeResultsArray[i] != answers[i]){
                        updatedAnswers.push(answers[i]);
                    }
                }

                if(updatedAnswers.length > 0){
                    updatedAnswers.forEach(element => {
                        str += element.name.substring(0, element.name.indexOf("|")).trim() + "=" + (element.selected ? "on" : "off") + " ";
                    });
                }
                let str = updatedAnswers.length > 0 ? "-D " : "";

                exec("cd " + folder + " && cmake -D CMAKEs._BUILDs._TYPE= " + str + " -S ./ -B ./build", (error, stdout, stderr) => {
                    spinner.stop();
                    if (error) {
                        console.log(`error: ${error.message}`);
                        s.log("CMake environment build error: " + error, 4);
                        return;
                    }
                    if (stderr) {
                        console.log(`${stderr}`);
                        s.log("CMake environment build stderr: " + stderr, 4);
                        // return;
                    }
                    //console.log(`${stdout}`);
                    s.log("CMake environment build stdout: " + stdout, 2);
                    console.log(colorText(s._green, "Created the build environment! Rescanning for new methods of compiling..."));
                    compile(programName);
                    return;
                }); break;
                case "2": exec("cd " + folder + " && cmake --build ./", (error, stdout, stderr) => {
                    spinner.stop();
                    if (error) {
                        console.log(`error: ${error.message}`);
                        s.log("CMake build error: " + error, 4);
                        console.log(colorText(s._white, "Uh oh! Seems like this repository can't be built with CMake (or something else happened). Try using a different method of compiling.", s._bgRed));
                        return;
                    }
                    if (stderr) {
                        console.log(`${stderr}`);
                        s.log("CMake build stderr: " + stderr, 4);
                        // return;
                    }
                    s.log("CMake build stdout: " + stdout, 2);
                    //console.log(`${stdout}`);
                    console.log(colorText(s._green, "Build Complete!"));
                    return;
                }); break;
                case "3": exec("cd " + folder + " && cmake --install ./", (error, stdout, stderr) => {
                    spinner.stop();
                    if (error) {
                        s.log("CMake install error: " + error, 4);
                        console.log(`error: ${error.message}`);
                        console.log(colorText(s._white, "Uh oh! Seems like this repository can't be installed with CMake (or something else happened). Try using a different method of compiling.", s._bgRed));
                        return;
                    }
                    if (stderr) {
                        s.log("CMake install stderr: " + stderr, 4);
                        console.log(`${stderr}`);
                        // return;
                    }
                    s.log("CMake install stdout: " + stdout, 2);
                    //console.log(`${stdout}`);
                    console.log(colorText(s._green, "Install complete!"));
                    return;
                });
            }
        }
}


exports.findIfCMake = findIfCMake;
exports.compileCmake = compileCmake;