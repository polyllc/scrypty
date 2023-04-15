const fs = require("fs");
const os = require("os");
const path = require("path")


const _black = "\x1b[30m";
const _red = "\x1b[31m";
const _green = "\x1b[32m";
const _yellow = "\x1b[33m";
const _blue = "\x1b[34m";
const _magenta = "\x1b[35m";
const _cyan = "\x1b[36m";
const _white = "\x1b[37m";

exports._black = _black;
exports._red = _red;
exports._green = _green;
exports._yellow = _blue;
exports._magenta = _magenta;
exports._cyan = _cyan;
exports._white = _white;

const _bgBlack = "\x1b[40m"
const _bgRed = "\x1b[41m"
const _bgGreen = "\x1b[42m"
const _bgYellow = "\x1b[43m"
const _bgBlue = "\x1b[44m"
const _bgMagenta = "\x1b[45m"
const _bgCyan = "\x1b[46m"
const _bgWhite = "\x1b[47m"

exports._bgBlack = _bgBlack;
exports._bgRed = _bgRed;
exports._bgGreen = _bgGreen;
exports._bgYellow = _bgYellow;
exports._bgBlue = _bgBlue;
exports._bgMagenta = _bgMagenta;
exports._bgCyan = _bgCyan;
exports._bgWhite = _bgWhite;

const _reset = "\x1b[0m"
const _bright = "\x1b[1m"
const _dim = "\x1b[2m"
const _underscore = "\x1b[4m"
const _blink = "\x1b[5m"
const _reverse = "\x1b[7m"
const _hidden = "\x1b[8m"

exports._bright = _bright;
exports._dim = _dim;
exports._reset = _reset;


let logfilename = "";

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
    
    let scrypty = parseScrypty(scryptyFile);

    let info = scrypty.info; //not important for compilation or anything really, it just serves as a place to hold info, important when compiling by only a scrypty file though, if a user literally inputs a scrypty file to install


    //return codes:
    //0 everything is good to go!
    //1 continue to compile with other methods, scrypty file is not formatted correctly or portions are missing
    //2 unsupported os that doesn't have scrypty instructions on how to compile

    let compile = scrypty.compile;
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
    

    let numOS = 0; //we need to check to make sure there's at least on compile instruction per scrypty file

    for(let i = 0; i < 9; i++){ //since I don't want to repeat the same code for all 3 os's, we just loop through them
        let currentOS;
        let currentOSStr;

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
                    let goodCommands = 0;
                    for(let j = 0; j < currentOS.commands.length; j++){ //make sure all the commands are there
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
    return 0;
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

function getLogFile(){
    if(logfilename === undefined ||  logfilename == ""){
        return new Date().getTime()/1000;
    }
    else{
        return logfilename;
    }
}

function setLogFile(filename){
    logfilename = filename;
    return new Promise((resolve) =>{
        resolve(logfilename);
    }); //literally just so we can await
}

function log(message, severity = 1){

    if(!fs.existsSync("\\..\\scryptyLogs")){
        fs.mkdirSync(path.join(__dirname, '../scryptyLogs'), { recursive: true })
    }
    if(!fs.existsSync("\\..\\repositories")){
        fs.mkdirSync(path.join(__dirname, '../repositories'), { recursive: true })
    }

    let file = getLogFile();

    let logstr;
    let date = new Date().toLocaleTimeString("en-GB"); //yessir, day month year
    switch(severity){
        case 1: logstr = "[LOG " + date + "] "  + message; break;
        case 2: logstr = "[INFO " + date + "] "  + message; break;
        case 3: logstr = "[WARNING " + date + "] "  + message; break;
        case 4: logstr = "[ERROR " + date + "] "  + message; break;
    }
    fs.appendFile(__dirname + "\\..\\scryptyLogs\\" + file + ".scryptylog", logstr + "\n", (err) => {
        if (err) throw err;
    });
    //severity logs
    //1 is normal log
    //2 is info log
    //3 is warning log
    //4 is error log

}

function logBoth(message, severity = 1){
    console.log(message);
    log(message, severity);
}

function clearLine(){
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0); 
}

function clearMultipleLines(num){
    for(var i = 0; i < num; i++){
        process.stdout.cursorTo(0,-1);
        process.stdout.clearLine(0);
    }
}

class spinner {
    constructor(speed, text){
        this.speed = speed;
        this.text = text;
        this.interval = 0;
    }

    start(){
        this.current = 0;
        this.num = new int(0);
        this.interval = setInterval(this.spin, this.speed, new int(0), this.text);
    }
    
    spin(num, text){
        switch(num.getNum()%4){
            case 0:
                clearLine();
                process.stdout.write(text + " |");
                break;
            case 1:
                clearLine();
                process.stdout.write(text + " /");
                break;
            case 2:
                clearLine();
                process.stdout.write(text + " -");
                break;
            case 3:
                clearLine();
                process.stdout.write(text + " \\");
                break;
        }
        num.addOne();
    }

    stop(){
        clearInterval(this.interval);
    }
}
//for above, since spin isn't technically part of the class (because its called upon a non class function, setInterval), this.current doesn't work
class int {
    number
    constructor(num){
        this.number = num;
    }
    getNum(){
        return this.number;
    }
    setNum(num){
        this.number = num;
    }
    addOne(){
        this.number++;
    }
}




async function listOptions(options, text){

    //options format looks like this
    /*
    [{
        name: "things",
        selected: false
    },
    {
        name: "another thing",
        selected: false
    }]

    */
    var index = 0;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("hex");

    process.stdout.cursorTo(0,0);
    process.stdout.clearScreenDown();
    var returned = displayListOptions(options, text, index);
    index = returned.index;
    options = returned.options;

    return new Promise((resolve) => {
        process.stdin.on('data', (key) => {
            process.stdout.cursorTo(0,0);
            process.stdout.clearScreenDown();
            returned = displayListOptions(options, text, index, key);
            index = returned.index;
            options = returned.options;
            if(key == "03"){ //ctrl+c (at least on windows)
                process.exit();
            }
            if(key == "0d"){
                process.stdin.setRawMode(false);
                process.stdin.on('data',()=>{}); //so this function doesnt run anymore and take priority
                process.stdin.resume();
                resolve(options);
            }
        });
    });
}

function displayListOptions(options, text, index = 0, key = "none"){

    //clearMultpleLines(options.length+1);

    if(key == "1b5b41"){ //up arrow
        if(index > 0){
            index--;
        }
    }  
    if(key == "1b5b42"){ //down arrow
        if(index < options.length-1){
            index++;
        }
    }
    if(key == "20"){
        options[index].selected = !options[index].selected;
    }
    console.log(text);
    for(var i = 0; i < options.length; i++){
        var str = "";
        if(options[i].selected){
            str += "(" + colorText(_green, "*") + ")";
        }
        else{
            str += "( )";
        }
        if(index == i){
            str += colorText(_black, " " + options[i].name, _bgWhite);
        }
        else{
            str += colorText(_bright, " " + options[i].name);
        }
        process.stdout.write(str + "\n");
    }
    return {index:index, options:options};
}








exports.spinner = spinner;
exports.parseScrypty = parseScrypty;
exports.findIfScrypty = findIfScrypty;
exports.verifyScrypty = verifyScrypty;
exports.getMethod = getMethod;
exports.getScryptyCommands = getScryptyCommands;
exports.getScryptyOS = getScryptyOS;
exports.getScryptyFile = getScryptyFile;
exports.log = log;
exports.setLogFile = setLogFile;
exports.logBoth = logBoth;
exports.clearLine = clearLine;
exports.getLogFile = getLogFile;
exports.listOptions = listOptions;
exports.colorText = colorText;