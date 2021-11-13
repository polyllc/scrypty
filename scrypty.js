const https = require("https");
const fs = require("fs");
const request = require("request");
const { exec } = require("child_process");
const unzipper = require("unzipper");
const os = require("os");
var prompt = require("prompt-sync")();
const glob = require("glob");



//color defines

const _black = "\x1b[30m";
const _red = "\x1b[31m";
const _green = "\x1b[32m";
const _yellow = "\x1b[33m";
const _blue = "\x1b[34m";
const _magenta = "\x1b[35m";
const _cyan = "\x1b[36m";
const _white = "\x1b[37m";

const _bgBlack = "\x1b[40m"
const _bgRed = "\x1b[41m"
const _bgGreen = "\x1b[42m"
const _bgYellow = "\x1b[43m"
const _bgBlue = "\x1b[44m"
const _bgMagenta = "\x1b[45m"
const _bgCyan = "\x1b[46m"
const _bgWhite = "\x1b[47m"

const _reset = "\x1b[0m"
const _bright = "\x1b[1m"
const _dim = "\x1b[2m"
const _underscore = "\x1b[4m"
const _blink = "\x1b[5m"
const _reverse = "\x1b[7m"
const _hidden = "\x1b[8m"

function colorText(color, str, bg = _bgBlack){
    return bg + color + str + _reset;
}


function getProgramNameFromURL(url){

    //say url is https://github.com/polyllc/scrypty.git, we only want the scrypty part for the file folder
    if(url.endsWith(".git")){
        return url.substr(url.lastIndexOf("/")+1, url.lastIndexOf(".") - url.lastIndexOf("/")-1); 
    }
    if(url.startsWith("https://github.com") || url.startsWith("http://github.com") || url.startsWith("github.com")){
        //not the first slash, but after the 2nd slash and before the 3rd slash is the name of the repo
        var firstSlash = url.indexOf("/", 8);
        return url.substr(url.indexOf("/", firstSlash+1)+1, (url.indexOf("/", url.indexOf("/", firstSlash+1)+1) == -1 ? url.length : url.indexOf("/", url.indexOf("/", firstSlash+1)+1)) - url.indexOf("/", firstSlash+1) - 1); //its 8 so we skip the /'s from https://
    }
}



//todo
//compile
//  make, cmake, visual studio (hopefully!?!?!?), go compiler, g++, gcc, clang, .net (c#), or just set it in the main.json file for whatever type file how you want to compile with
//run
// java, python, node.js, bat/sh
//NOT supported
// php (burh of course not), sql (idk even how i could go about), unity, unreal or any game engine at that

//make sure all files pass the checksum (if the repo has said checksums)




async function download(url){

    var programName = getProgramNameFromURL(url);

    var fileToDownload = getFile(url);

    if(fileToDownload == "null"){
        console.log("Not a vaild url! Make sure it's a github link (to an actual repo) or a zip file link");
        return;
    }

    console.log(programName);


    if(fileToDownload.endsWith(".git")){
        await gitDownload(fileToDownload, programName);
         //burh async shit strikes again
    }
    else if(fileToDownload.endsWith(".zip")){
        console.log("Downloading zip file " + programName + ".zip...");
        await zipDownload(programName, fileToDownload);
    }
    else{
        console.log("Not a vaild url! Make sure it's a github link (to an actual repo) or a zip file link");
        return;
    }

    //after we've downloaded the file, we need to somehow compile it


}


function compile(programName){
    var workingDir = findWorkingDir(programName);
   

    //stuff to find:
    //a scrypty file!! (lmao no one's going to put this into their program)
    //if there's only one file, what type?
    //if there are multiple files, find the one with file names that would make sense
    // like: main.cpp, {programname}.cpp, index.cpp, stuff like that
    //find stuff in the src folder if that exists (or source idk)
    //find stuff in the folder of the program name
    //find stuff in windows/win or linux/lin or mac folders if all else fails
    //make and cmake files, somehow read those and figure it out
    //if there are multiple files, take the file type of all of them and figure it out by majority

    //compiling

    //methods
    //-singleg++  compile only one file, c++ with g++
    //-singlegcc  compile only one file, c with gcc
    //make       compile by make
    //cmake      compile by cmake
    //-vs         compile by visual studio
    //-singlego   compile only one file, go
    //singlejava compile only one file, java
    //gradle     compile by gradle
    //maven      compile by maven (hmm maybe later...)
    //yarn       compile by yarn
    //npm        compile by npm (either by npm install in wdir or asking the user if they know that the package is available on npm already) (find package.json)
    //nmakevs    compile by visual studio's nmake
    //custom     compile by custom commands defined in the scrypty file (maybe one day there'll be a scrypty server with scrypty files?)
    //autocustom compile by instructions found in readme (if all else fails!)


    //ways to find out how to compile
    //scrypty file!!!!!!!
    //check for makefile
    //check for gradle file
    //check for maven file
    //check for package.json
    //check for vs .sln
    // ----- ok the obvious ones end here, down below are just (very educated) guesses that would make sense! -----
    //check if there are multiple files, find the one with file names that would make sense
    // like: main.cpp, {programname}.cpp, index.cpp, stuff like that
    //if there are multiple files, find the most popular extension (doesn't always work, ex: electron)
    //read the readme for compile instructions, use keywords such as `` (code blocks), the current running os, something like building, # building, or something like that
    //find folder with scripts for install.sh or build.sh or something with that (confirm with user!)
    //find install.sh or build.sh (confirm with user!)





    var methods = []; //the methods of compilation, the earlier in the array, the better method of compilation, we still ask the user, but inform them which one is the better option

    var scryptyFile = "none";
    var scrypty;

    var folder = __dirname + "\\" + programName;

    var files = fs.readdirSync(folder);

    var validScrypty = 0;

    var file = ""; //for the file to compile/build off of (like the main .cpp, the .sln, etc)

    if(findIfScrypty(files)){
        console.log("Found Scrypty file!");
        scryptyFile = folder + "\\" + files.find((element) => { return element.endsWith(".scrypty");} );
        if(verifyScrypty(scryptyFile) != 2){
            validScrypty = 1;
            console.log("Verified scrypty!");
            scrypty = parseScrypty(scryptyFile);
            methods.push(getMethod(scrypty)); //we always listen to scrypty file!
        }
    }

    if(validScrypty == 0){
        if(os.hostname() == ("freebsd" || "aix" || "openbsd" || "android" || "sunos")){ //honestly no idea how I'm going to test this, well other than install each os in a vm
            console.error("Sorry! But scrypty doesn't support freebsd, aix, sunos, openbsd or android. Since there wasn't a scrypty file in this repository, you can't compile this using scrypty. The repository was still cloned into: " + folder);
            return;
        }
        //insert finding method code here (without scrypty)

        if(findVSMethod(folder, programName)){
            methods.push("vs");
            file = findVSMethod(folder, programName);
        }
    }

    //compile
    if(methods.length == 1){
        console.log(colorText(_black, "Compiling by " + methods[0], _bgWhite));
        compileByMethod(methods[0], scrypty, folder, programName);
        
    }
    else if(methods.length > 1){
        //insert code to find the best option (prompt user)
    }
    else{
        console.log("Couldn't find a way to compile this repository, make sure it's not a library or something that can't be compiled, or compile it yourself. The repository has been cloned into: " + folder);
        return;
    }
    
    //console.log("Repository installed! Program is found in: " + folder + ". Run this program with `scrypty run " + programName + "`");
    //rl.close();

}


var getDirectories = function (src, callback) { //thanks stackoverflow, Paul Mougel
    glob(src + '/**/*', callback);
}



function findVSMethod(folder, programName){

    var sln = ""; 

    getDirectories(__dirname + "\\" + programName, (err, res) => { //uhh this returns all files in the folder, which takes a while, but compiling takes longer so the user will have to wait :)
        var slns = res.filter((element) => { return element.endsWith(".sln"); });
        preferredSlns = slns.filter((element) => { return (element.substr(element.lastIndexOf("/")).indexOf("dolphin") != -1) ?  element : "" }); //the preferred sln is the slns in the array with the programName in the file name
        notPreferredSlns = slns.filter((element) => { return (element.substr(element.lastIndexOf("/")).indexOf("dolphin") == -1) ?  element : "" }); //to filter out the rest

        if(slns.length == 0){
            return;
        }
        console.log("Found solutions!")
        console.log(colorText(_black, _dim + "Choose a solution to compile (you can choose later if there are more methods to compile whether or not to compile by visual studio solutions)", _bgCyan));

        if(preferredSlns.length != 0){
            console.log(colorText(_green, _bright + "These solutions are the better option to choose from (because they have the repo's name in the file name)"));
            for(var i = 0; i < preferredSlns.length; i++){
                console.log(colorText(_magenta, _bright + "[" + (i+1) + "]")  + " " + preferredSlns[i]);
            }
        }
        if(notPreferredSlns.length != 0){
            console.log(colorText(_yellow, _bright + "Other solutions (might be viable still!)"));
            for(var i = 0; i < notPreferredSlns.length; i++){
                console.log(colorText(_magenta, _bright + "[" + (i+1+preferredSlns.length) + "]")  + " " + notPreferredSlns[i]);
            }
        }

        var r = "";

        var validNum = false;

        while(!validNum){
            r = prompt("Choose solution by the number indicated next to each solution: ");


            //geniunely no idea why this works, does prompt make it an integer already? if so, i know how this works
            if(parseInt(r)){
                if(r > 0 && r <= slns.length){
                    if(parseInt(r) > preferredSlns.length){ //parseInt just in case
                        sln = notPreferredSlns[parseInt(r)-preferredSlns.length-1];
                    }
                    else{
                        sln = preferredSlns[parseInt(r)-1];
                    }
                    validNum = true;
                }    
                else{
                    console.log(colorText(_red, "Choose a valid option!"));
                }
            }
            else{
                console.log(colorText(_red, "Choose a valid option!"));
            }
        }

    });

    return sln;
}



function compileByMethod(method, scrypty, folder, programName, file = "none"){
    switch(method){
        case "singleg++": 
        if(scrypty !== undefined){
            compileSingleGPP(folder, getScryptyOS(scrypty).mainFile); break;
        }
        else {
            compileSingleGPP(folder, file); break;
        }
        case "singlegcc": 
        if(scrypty !== undefined){
            compileSingleGCC(folder, getScryptyOS(scrypty).mainFile); break;
        }
        else {
            compileSingleGCC(folder, file); break;
        }
        case "singlego": 
        if(scrypty !== undefined){
            compileSingleGo(folder, getScryptyOS(scrypty).mainFile); break;
        }
        else {
            compileSingleGo(folder, file); break;
        }
        case "vs":
            if(scrypty !== undefined){
                compileVSSolution(folder, programName + "\\" + getScryptyOS(scrypty).vsSolution);
            }
            break;
        case "custom":
            compileCustom(folder, scrypty);
            break;
    }
}

function compileSingleGPP(folder, file){
    console.log("Compiling file " + file + "...");
    exec("g++ " + folder + "\\" + file + " -o " + folder + "\\" + file.substr(0, file.lastIndexOf(".")) + (os.platform() == "win32" ? ".exe" : ""), (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
           // return;
        }
        console.log(`${stdout}`);
    });
}


function compileSingleGCC(folder, file){ //todo, test it
    console.log("Compiling file " + file + "...");
    exec("gcc " + folder + "\\" + file + " -o " + folder + "\\" + file.substr(0, file.lastIndexOf(".")) + (os.platform() == "win32" ? ".exe" : ""), (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
           // return;
        }
        console.log(`${stdout}`);
    });
}


function compileSingleGo(folder, file){ //todo, test it
    console.log("Compiling file " + file + "...");
    exec("go build " + folder + "\\" + file, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
           // return;
        }
        console.log(`${stdout}`);
    });
}
function compileVSSolution(folder, file){ //todo, be able to select the solution configuration
    console.log(colorText(_magenta, "Compiling solution..."));
    exec("msbuild " + file, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            console.log(colorText(_white, "Uh oh! The build failed! Most likely the .sln or any of the files that the .sln mentions has an error in it. It also might be an error due to not having MSBuild in your environment variables! Another common error is not having the right build tools installed, which you can install using the Visual Studio installer.", _bgRed));
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
           // return;
        }
        console.log(`${stdout}`);
    });
}


async function compileCustom(folder, scrypty){


    console.log("The scrypty file has set the compilation method to custom, which means custom commands are being executed. Make sure you trust the source before you continue.");



    var r = "";

    while(r != ("y" || "n")){
        r = prompt("Y (Continue) | N (Don't continue) | C (Check commands)");
        r = r.toLowerCase();
        switch(r){
            case "y":
                console.log(colorText(_green, "Continuing...")); break;
            case "n":
                console.log(colorText(_red, "Not continuing... trying to find other ways to compile"));
                return 1;
            case "c":
                console.log("Commands:");
                for(var i = 0; i < getScryptyCommands(scrypty).length; i++){
                    console.log(getScryptyCommands(scrypty)[i].cmd);
                }
                break;

            default: console.log(colorText(_yellow, "Not a valid option")); break;
        }
    }
    

    var len = getScryptyCommands(scrypty).length;
    var i = 0;
    console.log("running custom commands...");
    while(len > i){
        cmd = getScryptyCommands(scrypty)[i].cmd;
        console.log("command #" + (i+1) + ": " + cmd);
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`${stderr}`);
               // return;
            }
            console.log(`${stdout}`);
        });
        i++;
    }
}


function getMethod(scrypty){
    switch(os.platform()){
        case "win32":  if(scrypty.compile.win != undefined){ return scrypty.compile.win.method; } break;
        case "darwin":  if(scrypty.compile.mac != undefined){ return scrypty.compile.mac.method; } break;
        case "linux":  if(scrypty.compile.linux != undefined){ return scrypty.compile.linux.method; } break;
        case "aix":  if(scrypty.compile.aix != undefined){ return scrypty.compile.aix.method; } break;
        case "freebsd":  if(scrypty.compile.freebsd != undefined){ return scrypty.compile.freebsd.method; } break;
        case "openbsd":  if(scrypty.compile.openbsd != undefined){ return scrypty.compile.openbsd.method; } break;
        case "sunos":  if(scrypty.compile.sunos != undefined){ return scrypty.compile.sunos.method; } break;
        case "android":  if(scrypty.compile.android != undefined){ return scrypty.compile.android.method; } break; 
    }
    if(scrypty.compile.all != undefined){
        return scrypty.compile.all.method; //we've already verified at this point that there are in fact commands when the method is custom
    }
}

function getScryptyCommands(scrypty){
    switch(os.platform()){
        case "win32":  if(scrypty.compile.win != undefined){ return scrypty.compile.win.commands; } break;
        case "darwin":  if(scrypty.compile.mac != undefined){ return scrypty.compile.mac.commands; } break;
        case "linux":  if(scrypty.compile.linux != undefined){ return scrypty.compile.linux.commands; } break;
        case "aix":  if(scrypty.compile.aix != undefined){ return scrypty.compile.aix.commands; } break;
        case "freebsd":  if(scrypty.compile.freebsd != undefined){ return scrypty.compile.freebsd.commands; } break;
        case "openbsd":  if(scrypty.compile.openbsd != undefined){ return scrypty.compile.openbsd.commands; } break;
        case "sunos":  if(scrypty.compile.sunos != undefined){ return scrypty.compile.sunos.commands; } break;
        case "android":  if(scrypty.compile.android != undefined){ return scrypty.compile.android.commands; } break;
    }
    if(scrypty.compile.all != undefined){
        return scrypty.compile.all.commands; //we've already verified at this point that there are in fact commands when the method is custom
    }
}

function getScryptyOS(scrypty){ //gets the compile data from scrypty file by os
    switch(os.platform()){
        case "win32":  if(scrypty.compile.win != undefined){ return scrypty.compile.win; } break;
        case "darwin":  if(scrypty.compile.mac != undefined){ return scrypty.compile.mac; } break;
        case "linux":  if(scrypty.compile.linux != undefined){ return scrypty.compile.linux; } break;
        case "aix":  if(scrypty.compile.aix != undefined){ return scrypty.compile.aix; } break;
        case "freebsd":  if(scrypty.compile.freebsd != undefined){ return scrypty.compile.freebsd; } break;
        case "openbsd":  if(scrypty.compile.openbsd != undefined){ return scrypty.compile.openbsd; } break;
        case "sunos":  if(scrypty.compile.sunos != undefined){ return scrypty.compile.sunos; } break;
        case "android":  if(scrypty.compile.android != undefined){ return scrypty.compile.android; } break;
    }
    if(scrypty.compile.all != undefined){
        return scrypty.compile.all; //we've already verified at this point that there are in fact commands when the method is custom
    }
}


function verifyScrypty(scryptyFile){ //so much verifying to do!
    
    var scrypty = parseScrypty(scryptyFile);

    var info = scrypty.info; //not important for compilation or anything really, it just serves as a place to hold info, important when compiling by a scrypty file though


    //return codes:
    //0 everything is good to go!
    //1 continue to compile with other methods, scrypty file is not formatted correctly or portions are missing
    //2 unsupported os that doesn't have scrypty instructions on how to compile

    var compile = scrypty.compile;
    if(scrypty.compile === undefined){
        console.error("\x1b[31m%s\x1b[0m", "Uh oh, the compile portion of the scrypty file is missing! Cannot use this scrypty to compile...");
        return 1;
    }
    if(scrypty.compile.all === undefined){
        switch(os.platform()){
            case "win32":
                if(scrypty.compile.win === undefined){
                    console.error(colorText(_yellow, "Uh oh, the scrypty file doesn't have any compilation instructions for windows, but there still might be a way to compile it, so continuing..."));
                    return 1;
                }
                break;
            case "darwin":
                if(scrypty.compile.mac === undefined){
                    console.error(colorText(_yellow, "Uh oh, the scrypty file doesn't have any compilation instructions for macOS, but there still might be a way to compile it, so continuing..."));
                    return 1;
                }
                break;
            case "linux":
                if(scrypty.compile.linux === undefined){
                    console.error(colorText(_yellow, "Uh oh, the scrypty file doesn't have any compilation instructions for linux, but there still might be a way to compile it, so continuing..."));
                    return 1;
                }
                break;
            case "aix":
                if(scrypty.compile.aix === undefined){
                    console.error(colorText(_red, "Uh oh, the scrypty file doesn't have any compilation instructions for AIX. Scrypty does not officially support AIX, so it will not continue."));
                    return 2;
                }
                break;
            case "freebsd":
                if(scrypty.compile.freebsd === undefined){
                    console.error(colorText(_red, "Uh oh, the scrypty file doesn't have any compilation instructions for FreeBSD. Scrypty does not officially support FreeBSD, so it will not continue."));
                    return 2;
                }
                break;
            case "openbsd":
                if(scrypty.compile.openbsd === undefined){
                    console.error(colorText(_red, "Uh oh, the scrypty file doesn't have any compilation instructions for OpenBSD. Scrypty does not officially support OpenBSD, so it will not continue."));
                    return 2;
                }
                break;
            case "sunos":
                if(scrypty.compile.sunos === undefined){
                    console.error(colorText(_red, "Uh oh, the scrypty file doesn't have any compilation instructions for SunOS. Scrypty does not officially support SunOS, so it will not continue."));
                    return 2;
                }
                break;
            case "android":
                if(scrypty.compile.android === undefined){
                    console.error(colorText(_red, "Uh oh, the scrypty file doesn't have any compilation instructions for Android. Scrypty does not officially support Android, so it will not continue."));
                    return 2;
                }
                break;     
        }
    }
    

    var numOS = 0; //we need to check to make sure there's at least on compile instruction per scrypty file

    for(var i = 0; i < 9; i++){ //since I don't want to repeat the same code for all 3 os's, we just loop through them
        var currentOS;
        var currentOSStr;

        switch(i){ 
            case 0: currentOS = scrypty.compile.win; currentOSStr = "win32"; break;
            case 1: currentOS = scrypty.compile.mac; currentOSStr = "darwin"; break;
            case 2: currentOS = scrypty.compile.linux; currentOSStr = "linux"; break;
            case 3: currentOS = scrypty.compile.freebsd; currentOSStr = "freebsd"; break;
            case 4: currentOS = scrypty.compile.openbsd; currentOSStr = "openbsd"; break;
            case 5: currentOS = scrypty.compile.sunos; currentOSStr = "sunos"; break;
            case 6: currentOS = scrypty.compile.android; currentOSStr = "android"; break;
            case 7: currentOS = scrypty.compile.aix; currentOSStr = "aix"; break;  
            case 8: currentOS = scrypty.compile.all; currentOSStr = "all"; break; //all is to be used as a last resort, as we prefer os specific instructions
        }
        if(currentOS != undefined && currentOSStr == "all" || currentOS != undefined && currentOSStr == os.platform()){
            if(currentOS.method === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, no method of compilation was provided! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == ("singleg++" || "singlegcc" || "singlego" || "singlejava") && currentOS.mainFile === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be " + currentOS.method + ", but no main file was provided to compile! But there still might be a way to compile it, so continuing..."));
            }
           /* else if(currentOS.method == "make" && currentOS.makeFile === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be make, but no makefile was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == "cmake" && currentOS.cmake === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be cmake, but no makefile was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }*/ // that doesn't even make sense? make's only input is the directoy, it finds the make file on its own
            else if(currentOS.method == "gradle" && currentOS.gradle === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be Gradle, but no gradle file was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == "maven" && currentOS.maven === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be Maven, but no maven file was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == "vs" && currentOS.vsSolution === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be Visual Studio, but no VS Solution was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == "nmake" && currentOS.nmake === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be nmake, but no nmake file was specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            else if(currentOS.method == "custom" && currentOS.commands === undefined){
                console.error(colorText(_cyan, "For OS: " + currentOSStr) + colorText(_yellow, " Uh oh, the method was provided to be custom, but no commands were specified in the scrypty! But there still might be a way to compile it, so continuing..."));
            }
            //we don't need to check for npm because we can just assume that npm install will install it, but if there is a package specified, install that instead
            else{


                if(currentOS.method != "make" && currentOS.method != "cmake" && currentOS.method != "singleg++" && currentOS.method != "singlegcc" && currentOS.method != "gradle" && currentOS.method != "cmake" && currentOS.method != "maven" && currentOS.method != "vs" && currentOS.method != "nmake" && currentOS.method != "custom" && currentOS.method != "singlego" && currentOS.method != "singlejava"){
                    numOS--;
                    console.log("down one")
                }

                if(currentOS.method == "custom"){
                    var goodCommands = 0;
                    console.log(currentOS.commands.length);
                    for(var j = 0; j < currentOS.commands.length; j++){
                        if(currentOS.commands[j].cmd === undefined){
                            goodCommands--;
                        }
                    }
                    if(goodCommands < 0){
                        numOS--; //subtract + add == 0
                    }
                }
                numOS++; //we only add up the valid os instructions
            }
        }

    }

    if(numOS == 0){
        console.error("Uh oh, the scrypty has no valid compilation instructions for your OS at all! But there still might be a way to compile, so contining...");
        return 2;
    }

}

function findIfScrypty(files) {
    if (files.find((element) => { return element.endsWith(".scrypty"); })) { //lets go, a scrypty file!
        return 1;
    }
    return 0;
}

function parseScrypty(file){
    return JSON.parse(fs.readFileSync(file).toString()); //its literally just a json.parse, but saying parseScrypty sounds so much better :)
}

function findWorkingDir(programName){
    //with the method below, we can clone the git repo to the root of our directory
    //but the problem is zip files don't behave the same way, so we'll have to check whether there's a single folder inside the folder and cd into there
    var folder = __dirname + "\\" + programName;
    fs.readdir(folder, function (err, files) {
        if (err) {
          console.log(err);
          return;
        }
        if(files.length == 2){ //2 files, the zip and the folder
            if(fs.lstatSync(folder + "\\" + files[0]).isDirectory()){ //the only folder is a dir
                folder = folder + "\\" + files[0];
            }
            else if(fs.lstatSync(folder + "\\" + files[1]).isDirectory()){
                folder = folder + "\\" + files[1];
            }
            else{
                folder = folder;
            }
        }
        else{
            folder = folder;
        }
      });
    
    return folder;
}



function getFile(url){
    if(url.endsWith(".zip") || url.endsWith(".git")){
        return url;
    }
    else if(url.startsWith("https://github.com") || url.startsWith("http://github.com") || url.startsWith("github.com")){ //say if someone puts https://github.com/polyllc/alexa/ they won't get shat on
        if(url.lastIndexOf("/") == url.length){
            url = url.substr(0, length-1); //get rid of the last slash if need be
        }
        return url + ".git"; //thanks github for making it easy on me
    }
    else{
        return "null";
    }

}


//download("https://github.com/electron/electron");
compile("dolphin");



async function gitDownload(url, programName){

    var folder = __dirname + "\\" + programName;

    await fs.mkdir(folder, (err) => {
        //  console.error(err); it just keeps saying that we've already made this directory so lets just comment this out for now
        return;
    });

    console.log("Cloning into " + folder + "...");

    exec("git clone " + url + " " + folder, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
           // return;
        }
        console.log(`${stdout}`);
        compile(programName);
    });
}

async function zipDownload(programName, url) {

    var folder = __dirname + "\\" + programName;

    await fs.mkdir(folder, (err) => {
      //  console.error(err); it just keeps saying that we've already made this directory so lets just comment this out for now
        return;
    });

    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("./" + programName + "/" + url.substr(url.lastIndexOf("/")))) //create the zip file
        .on('finish', async () =>{
            console.log("unzipping...");
            fs.createReadStream("./" + programName + "/" + url.substr(url.lastIndexOf("/"))) //unzip
            .pipe(unzipper.Extract({ path: './' + programName }));
             fs.unlink("./" + programName + "/" + url.substr(url.lastIndexOf("/")), (err) => {
                if(err){
                    console.error(err);
                    return;
                }
                console.log("compiling");
                compile(programName);
             });
        });
}
