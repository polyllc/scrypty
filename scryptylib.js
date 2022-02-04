const fs = require("fs");
const os = require("os");


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

function getScryptyFile(scrypty){ //gets the compile data from scrypty file by os
    switch(os.platform()){
        case "win32":  if(scrypty.compile.win.mainFile != undefined){ return scrypty.compile.win.mainFile; } break;
        case "darwin":  if(scrypty.compile.mac.mainFile != undefined){ return scrypty.compile.mac.mainFile; } break;
        case "linux":  if(scrypty.compile.linux.mainFile != undefined){ return scrypty.compile.linux.mainFile; } break;
        case "aix":  if(scrypty.compile.aix.mainFile != undefined){ return scrypty.compile.aix.mainFile; } break;
        case "freebsd":  if(scrypty.compile.freebsd.mainFile != undefined){ return scrypty.compile.freebsd.mainFile; } break;
        case "openbsd":  if(scrypty.compile.openbsd.mainFile != undefined){ return scrypty.compile.openbsd.mainFile; } break;
        case "sunos":  if(scrypty.compile.sunos.mainFile != undefined){ return scrypty.compile.sunos.mainFile; } break;
        case "android":  if(scrypty.compile.android.mainFile != undefined){ return scrypty.compile.android.mainFile; } break;
    }
    if(scrypty.compile.all.mainFile != undefined){
        return scrypty.compile.all.mainFile; //we've already verified at this point that there are in fact commands when the method is custom
    }
}


function verifyScrypty(scryptyFile){ //so much verifying to do!
    
    var scrypty = parseScrypty(scryptyFile);

    var info = scrypty.info; //not important for compilation or anything really, it just serves as a place to hold info, important when compiling by only a scrypty file though, if a user literally inputs a scrypty file to install


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
            }*/ // that doesn't even make sense? make's only input is the directory, it finds the make file on its own
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
                }

                if(currentOS.method == "custom"){
                    var goodCommands = 0;
                    for(var j = 0; j < currentOS.commands.length; j++){ //make sure all the commands are there
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
        console.error("Uh oh, the scrypty has no valid compilation instructions for your OS at all! But there still might be a way to compile, so continuing...");
        return 1;
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


exports.parseScrypty = parseScrypty;
exports.findIfScrypty = findIfScrypty;
exports.verifyScrypty = verifyScrypty;
exports.getMethod = getMethod;
exports.getScryptyCommands = getScryptyCommands;
exports.getScryptyOS = getScryptyOS;
exports.getScryptyFile = getScryptyFile;