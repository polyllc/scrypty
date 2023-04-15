const http = require("http");
const request = require("request");
const fs = require("fs");
const { exec } = require("child_process");
const unzipper = require("unzipper");
const os = require("os");
let prompt = require("prompt-sync")();
const glob = require("glob");
const s = require("./src/scryptylib");
const util = require('util');
const cmake = require("./src/scryptyCmake");
const path = require("path");
const minimist = require("minimist");



const vsCompile = require("./src/vsCompile");
const cmakeCompile = require("./src/cmakeCompile");
//const execP = util.promisify(require('child_process').exec);

const scryptyVersion = "v0.0.31";

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

let methodNames = ["g++", "gcc", "Visual Studio", "java", "go", "cmake", "make"]; //todo, make into map
let methodCommands = ["g++ --help", "gcc --help", "msbuild -help", "javac -help", "go help", "cmake", "make"];

const _cmakeExecutable = "cmake";
const _msbuildExecutable = "msbuild";
const _gppExecutable = "gpp";
const _gccExecutable = "gcc";
const _javaExecutable = "javac";
const _goExecutable = "go";
const _ninjaExecutable = "ninja";
const _mesonExecutable = "meson";

let verbosity = 0;
//-1, nothing but prompts
//0, normal, prompts + build messages
//1, prompts + build messages + extra warnings (such as scrypty not valid)
//2, 1 and logs from finding files in compile methods and such
//3, 2 and logs from compilebymethod logs (like file finding and matching)
//4, literally log everything


function colorText(color, str, bg = _bgBlack){
    return bg + color + str + _reset;
}



//server code
/*
function requestListener(req, res){
    fs.readFile("index.html", (err, result) =>{
        if(err) { console.error(err); return; }
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(result);
        console.log('read file');
    });
}

const server = http.createServer(requestListener);

server.on("connection", (stream) => {
    console.log('new user');
})


server.listen(8080);
*/


//end server code







function getProgramNameFromURL(url){

    //say url is https://github.com/polyllc/scrypty.git, we only want the scrypty part for the file folder
    if(url.endsWith(".git")){
        return url.substr(url.lastIndexOf("/")+1, url.lastIndexOf(".") - url.lastIndexOf("/")-1); 
    }
    if(url.startsWith("https://github.com") || url.startsWith("http://github.com") || url.startsWith("github.com")){
        //not the first slash, but after the 2nd slash and before the 3rd slash is the name of the repo
        let firstSlash = url.indexOf("/", 8);
        return url.substr(url.indexOf("/", firstSlash+1)+1, (url.indexOf("/", url.indexOf("/", firstSlash+1)+1) == -1 ? url.length : url.indexOf("/", url.indexOf("/", firstSlash+1)+1)) - url.indexOf("/", firstSlash+1) - 1); //its 8 so we skip the /'s from https://
    }
}


//scrypty
//a github repository installer/package installer (by zip link) & runner
//-----------------------------
//what scrpyty DOES do
//  download git repos
//  download zip files and extracts
//  reads scrypty files
//  compiles by instruction on scrypty file
//  finds a way to compile by the repo's files
//  be able to run said repos
//  run scripts as defined in a scripts folder of a repo or defined by the scrypty file
//  delete repos
//what scrypty might do
//  be a package manager
//  install new updates (unless fresh install by user request)
//what scrypty SHOULDN'T do (but is able to)
//  be the sole builder (use make, cmake, sln, gradle or something else instead)



//todo
//finish methods and compiling
//add prerequisite checking (on scryptys)
//add prerequisite installing
//check if compilers/builders are even available on the system, if not, install them
//add help
//add custom os installers (arch, debian, etc)
//add custom run commands on scrypties
//check if certain methods of compiling are even valid or if the tools are installed, if not, install


async function download(url){


    let programName = getProgramNameFromURL(url);
    await s.setLogFile(programName + (new Date().getTime()/1000));

    s.log("Using Scrypty " + scryptyVersion);
    s.log("Downloading " + url);
    s.log("Program name is " + programName);
    await checkPrerequisitesPromises().then((results) => { //instead of making the function actually print out if it fails or not, we do this because otherwise we would somehow need to make that other function return a promise, and await inside a function that's called by a function that isn't await doesn't work
        let i = 0;
        results.forEach((result) => {
            if(result.value){ //meaning command failed
                console.log(colorText(_red, methodNames[i] + " not found"));
            }
            else{
                console.log(colorText(_green, methodNames[i] + " found"))
            }
            i++;
        });
    });
    

    let fileToDownload = getFile(url);

    if(fileToDownload == "null"){ //how type safe
        console.log("Not a vaild url! Make sure it's a github link (to an actual repo) or a zip file link");
        s.log("Url: " + url + " wasn't valid" , 4);
        return;
    }



    if(fileToDownload.endsWith(".git")){
        await gitDownload(fileToDownload, programName);
        s.log("Downloading by git");
         //burh async shit strikes again
    }
    else if(fileToDownload.endsWith(".zip")){
        console.log("Downloading zip file " + programName + ".zip...");
        await zipDownload(programName, fileToDownload);
        s.log("Downloading zip file");
    }
    else{
        console.log("Not a vaild url! Make sure it's a github link (to an actual repo) or a zip file link");
        s.log("Url: " + url + " wasn't valid" , 4);
        return;
    }

    //after we've downloaded the file, we need to somehow compile it, compile is called by zipDownload or gitDownload


}


async function compile(programName){
    let workingDir = findWorkingDir(programName);
    s.log("Current Working directory: " + workingDir, 1);

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
    //-cmake      compile by cmake
    //-vs         compile by visual studio
    //-singlego   compile only one file, go
    //singlejava compile only one file, java
    //gradle     compile by gradle
    //maven      compile by maven 
    //yarn       compile by yarn
    //npm        compile by npm (either by npm install in wdir or asking the user if they know that the package is available on npm already) (find package.json)
    //nmakevs    compile by visual studio's nmake (why tf do they have 2 builders in one program)
    //meson      compile by meson
    //ninja      compile by ninja
    //-custom     compile by custom commands defined in the scrypty file (maybe one day there'll be a scrypty server with scrypty files?)
    //autocustom compile by instructions found in readme (if all else fails!)


    //ways to find out how to compile
    //scrypty file!!!!!!!
    //check for makefile
    //check for gradle file
    //check for maven file
    //check for package.json
    //check for vs .sln
    //check for yarn.lock
    // ----- ok the obvious ones end here, down below are just (very educated) guesses that would make sense! -----
    //check if there are multiple files, find the one with file names that would make sense
    // like: main.cpp, {programname}.cpp, index.cpp, stuff like that
    //if there are multiple files, find the most popular extension (doesn't always work, ex: electron)
    //read the readme for compile instructions, use keywords such as ` `/``` ``` (code blocks), the current running os, something like building, # building, or something like that
    //find folder with scripts for install.sh or build.sh or something with that (confirm with user!)
    //find building.md or something





    let methods = []; //the methods of compilation, the earlier in the array, the better method of compilation, we still ask the user, but inform them which one is the better option

    let scryptyFile = "none";
    let scrypty;

    let folder = workingDir;

    let files = fs.readdirSync(folder);

    let validScrypty = 0;

    let allFiles = await getDirectories(folder);
    console.log("\n");

    let file = new Map(); //for the file to compile/build off of (like the main .cpp, the .sln, etc)
    file.set("singleg++", "none");

    if(s.findIfScrypty(files)){
        console.log("Found Scrypty file!");
        s.log("Found scrypty file");
        scryptyFile = folder + "\\" + files.find((element) => { return element.endsWith(".scrypty");} );
        if(s.verifyScrypty(scryptyFile) == 0){
            validScrypty = 1;
            console.log("Verified scrypty!");
            s.log("Scrypty verified");
            scrypty = s.parseScrypty(scryptyFile); 
            //todo support multiple methods
            methods.push(s.getMethod(scrypty)); //we always listen to scrypty file!
            file.set(s.getMethod(scrypty));
        }
    }
    if(validScrypty == 0){
        if(os.hostname() == ("freebsd" || "aix" || "openbsd" || "android" || "sunos")){ //honestly no idea how I'm going to test this, well other than install each os in a vm
            console.error("Sorry! But scrypty doesn't support freebsd, aix, sunos, openbsd or android. Since there wasn't a scrypty file in this repository, you can't compile this using scrypty. The repository was still cloned into: " + folder);
            s.log("Can't find compilation instructions for " + os.hostname() + " from scrypty file", 4);
            return;
        }
        file = await findMethods(folder, programName, methods, allFiles); //no idea why, but methods is global, so we don't even need to return that
    }


    //compile
    if(methods.length == 1){
        console.log(colorText(_black, "Compiling by " + methods[0], _bgWhite));
        s.log("Compiling by " + methods[0], 2);
        compileByMethod(methods[0], scrypty, folder, programName, file, allFiles);
        
    }
    else if(methods.length > 1){
        //insert code to find the best option (prompt user)
        console.log(colorText(_green, _bright + "Found more than one way to compile"));
        s.log("More than one way to compile: " + methods);
        for(let i = 0; i < methods.length; i++){
            console.log(colorText(_cyan, _bright + "[" + (i+1) + "]") + " " + methods[i]);
        }
        let validNum = false;
        while(!validNum){
           let r = prompt("Choose the way you want to compile: ");
            if(parseInt(r)){
                if(r > 0 && r <= methods.length){
                    console.log(colorText(_black, "Compiling by " + methods[parseInt(r)-1], _bgWhite));
                    s.log("Compiling by " + methods[parseInt(r)-1], 1);
                    compileByMethod(methods[parseInt(r)-1], scrypty, folder, programName, file, allFiles);                    
                    validNum = true;
                }  
                else{
                    console.log(colorText(_red, "Choose a valid option!"));
                }
            }
            else{
                console.log(colorText(_red, "Choose a valid option!!"));
            }
        }
    }
    else{
        console.log("Couldn't find a way to compile this repository, make sure it's not a library or something that can't be compiled, or compile it yourself. The repository has been cloned into: " + folder);
        s.log("Can't compile repository, no way found", 4);
        return;
    }
}

function getDirectories(src, array = []) { 
    return new Promise(resolve =>{ //to make it valid with await
        glob(src + '/**/*', (error, res) => {
            if(error){
                console.error(error);
           }

        resolve(res) });
    }); 
    files = fs.readdirSync(src);

    let arrayOfFiles = array || [];
  
    s.clearLine();
    process.stdout.write("Found " + arrayOfFiles.length + " files");

    files.forEach(function(file) {
      if (fs.statSync(src + "/" + file).isDirectory()) {
        arrayOfFiles = getDirectories(src + "/" + file, arrayOfFiles);
      } else {
        arrayOfFiles.push(path.join(src, "/", file));
      }
    })
  
    arrayOfFiles.forEach(element => {
       element.replaceAll("\\", "/"); 
    });
    return arrayOfFiles;
}

async function findMethods(folder, programName, methods, allFiles) {
    
    let file = new Map();
    
    //order of best compilation to worst
    //cmake, often you need to create the build environment, so cmake should always be first
    //vs sln, often after you make the build environment, a new sln pops up
    //

    let cmakeF = await cmakeCompile.findIfCMake(allFiles);
    if(cmakeF){
        s.log("Can compile by CMake...");
        methods.push("cmake");
    }

    let vs = await vsCompile.findIfVS(allFiles); //todo, make this so it happens after the fact, not before knowing the list of the build options
    if (vs) {
        s.log("Can compile by Visual Studio (there are .slns available, unknown whether projects of inner libraries or not)...");
        methods.push("vs");
    }

    let cpp = await findIfCpp(folder, programName, allFiles);
    if(cpp){
        s.log("Can compile by G++...");
        methods.push("singleg++");
        if(cpp != 1){
            file.set("singleg++", cpp);
        }
    }

    let gradle = findIfGradle(folder);
    if(gradle){
        s.log("Can compile by gradle...");
        methods.push("gradle");
    }

    return new Promise((resolve) => {
        resolve(file); //some methods don't return files, so we just return undefined, and thats ok because compileByMethod wont even access file if its not needed
    });
}


function findIfGradle(folder){
    return fs.existsSync(folder + "/build.gradle");
}

async function findIfCpp(folder, programName, allFiles){
    //what we really hope, no one uses .cc or .cxx
    let file;
    //what to check:
    //1) if there's a main/projectname/index.cpp file
    //2) if a large proportion of the files are cpp (usually this means either a full on cpp project or most likely, compile by cmake or sln)
    //3) if there's literally only one file and it's a .cpp file
    let cppfiles = allFiles.filter((e) => {return e.endsWith(".cpp")});

    if(fs.existsSync(folder + "\\main.cpp") || fs.existsSync(folder + ".cpp") || fs.existsSync(folder + "\\index.cpp")){
        //probably a singlecpp, confirm later
        s.log("findIfCpp: Found a main/programname/index.cpp");
        file = 1;
    }
    if(cppfiles.length >= allFiles.length/2 && allFiles.length > 1){ //to prevent empty folders from compiling
        //worth a shot, right?
        s.log("findIfCpp: more cpp files than half of the total number of files");
        file = 1;
    }

    if(fs.existsSync(folder + "\\main.cpp") || fs.existsSync(folder + "\\" + programName + ".cpp") || fs.existsSync(folder + "\\index.cpp")){
        file = 2;
        s.log("findIfCpp: found a Found a main/programname/index.cpp in programname subfolder");
    }

    if(cppfiles.length == 1){
        file = cppfiles[0].substring(cppfiles[0].lastIndexOf("/")+1, cppfiles[0].length);
    }
    return new Promise((resolve) => {
        s.log("findIfCpp: File to compile by (if there is one): " + file);
        resolve(file);
    });
}


async function compileByMethod(method, scrypty, folder, programName, file = new Map(), allFiles = []){
    switch(method){
        case "singleg++": 
            if(scrypty !== undefined){
                compileSingleGPP(folder, folder + "\\" + s.getScryptyOS(scrypty).mainFile, programName); break;
            }
            else {
                if(file.get("singleg++") == 2){
                    folder += "\\" + programName;
                }
                compileSingleGPP(folder, file.get("singleg++"), programName); break;
            }
        case "singlegcc": 
            if(scrypty !== undefined){
                compileSingleGCC(folder, folder + "\\" + s.getScryptyOS(scrypty).mainFile); break;
            }
            else {
                compileSingleGCC(folder, file.get("singlegcc")); break;
            }
        case "singlego": 
            if(scrypty !== undefined){
                compileSingleGo(folder, folder + "\\" + s.getScryptyOS(scrypty).mainFile); break;
            }
            else {
                compileSingleGo(folder, file.get("singlego")); break;
            }
        case "vs":
            if(scrypty !== undefined){
                await compileVSSolution(folder, folder + "\\" +  s.getScryptyOS(scrypty).vsSolution, programName);
            }
            else{
                let vs = await vsCompile.findVSMethod(allFiles, programName);
                await vsCompile.compileVSSolution(folder, vs, programName);
            }
            break;

        case "cmake":
            cmakeCompile.compileCmake(folder, programName);
            break;
        case "gradle":
            compileGradle(folder);
            break;
        case "custom":
            compileCustom(folder, scrypty);
            break;
    }
    console.log("Repository installed! Program is found in: " + folder + ". Run this program with `scrypty run " + programName + "`");
}

async function compileSingleGPP(folder, file, programName){
    if(file == "none" || file === undefined || file == 2){ 
        if(fs.existsSync(folder + "\\main.cpp") || fs.existsSync(folder + "\\" + programName + ".cpp") || fs.existsSync(folder + "\\index.cpp")){
            let files = [];
            if(fs.existsSync(folder + "\\main.cpp")){
                files.push("main.cpp");
            }
            if(fs.existsSync(folder + "\\" + programName + ".cpp")){
                files.push(programName + ".cpp");
            }
            if(fs.existsSync(folder + "\\index.cpp")){
                files.push("index.cpp");
            }
            s.log(files + " exist of prenamed files", 2);
            if(files.length > 1){
                    console.log(colorText(_green, _bright + "Choose the .cpp file to compile:"));
                    for(let i = 0; i < files.length; i++){
                        console.log(colorText(_magenta, _bright + "[" + (i+1) + "]")  + " " + files[i]);
                    }
        
                let r;
        
                let validNum = false;
        
                while(!validNum){
                    r = prompt("Choose the .cpp file by typing in the number next to the file: ");
    
                    if(parseInt(r) || r == "0"){
                        if(r > 0 && r <= files.length){
                            file = files[r-1];
                            validNum = true;
                        }  
                        else if(r == "0"){
                            console.log(colorText(_yellow, "Skipping... (I guess you really want to see all of the .cpp files, do you)"));
                            file = "none";
                            s.log("Skipped common cpp files");
                            validNum = true;
                        }  
                        else{
                            console.log(colorText(_red, "Choose a valid option!"));
                        }
                    }
                    else{
                        console.log(colorText(_red, "Choose a valid option!!"));
                    }
                }
            }
            else{
                file = files[0]; //i mean, it passed the first if, there HAS to be something there
            }
            
        }
    }
    if(file == "none" || file === undefined || file == 2){ //if we still have no file selected
        files = await getDirectories(__dirname + "\\" + programName);
        files = files.filter((e) => { return e.endsWith(".cpp"); });
        console.log(files);
        for(let i = 0; i < files.length; i++){
            files[i] = files[i].substring(files[i].lastIndexOf("/")+1, files[i].length);
            files[i] = files[i].substring(files[i].lastIndexOf("\\")+1, files[i].length);
        }
        console.log(colorText(_green, _bright + "Choose the .cpp file to compile:"));
            for(let i = 0; i < files.length; i++){
                console.log(colorText(_magenta, _bright + "[" + (i+1) + "]")  + " " + files[i]);
            }

        let r;

        let validNum = false;

        while(!validNum){
            r = prompt("Choose the .cpp file by typing in the number next to the file: ");

            if(parseInt(r) || r == "0"){
                if(r > 0 && r <= files.length){
                    file = files[r-1];
                    validNum = true;
                }  
                else{
                    console.log(colorText(_red, "Choose a valid option! (you really need to choose an option, please of course)"));
                }
            }
            else if(r == "exit"){
                process.exit();
            }
            else{
                console.log(colorText(_red, "Choose a valid option!!"));
            }
        }
    }


    let cppVer;
    console.log(colorText(_magenta, _bright + "[1] ") + "C++20");
    console.log(colorText(_magenta, _bright + "[2] ") + "C++17");
    console.log(colorText(_magenta, _bright + "[3] ") + "C++14");
    console.log(colorText(_magenta, _bright + "[4] ") + "C++11");
    console.log(colorText(_magenta, _bright + "[5] ") + "C++03");

    let validNum = false; //i hate it when local variables become global, probably should be using typescript?!?!!? nah whatever this'll never not work :)
    r = "";

    while(!validNum){

        let r = prompt(colorText(_green, _bright + "Choose the C++ version to use (if unsure, try C++17, and if that doesn't work, go down the chain. You can try using C++20, but it's so new, some compilers might not support it): "));

        if(parseInt(r) || r == "0"){
            if(r > 0 && r <= 5){
                switch(r){
                    case "1": cppVer = "c++20"; break;
                    case "2": cppVer = "c++17"; break;
                    case "3": cppVer = "c++14"; break;
                    case "4": cppVer = "c++11"; break;
                    case "5": cppVer = "c++03"; break;
                }
                validNum = true;
            }    
            //no skipping! you need to select something
            else{
                console.log(colorText(_red, "Choose a valid option!"));
            }
        }
        else{
            console.log(colorText(_red, "Choose a valid option!"));
        }
    }
    //why would anyone use anything prior to 03 it's not like with c people use c98 all the time, right? .....right? uh oh


    console.log("Compiling file " + file);
    s.log("Compiling file " + file + "... cppVer: " + cppVer);
    let spinner = new s.spinner(100, colorText(_white, "Building", _bgGreen));
    spinner.start();
    exec("g++ --std=" + cppVer + " " + file + " -o " + file.substr(0, file.lastIndexOf(".")) + (os.platform() == "win32" ? ".exe" : ""), (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
            console.log(`error: ${error.message}`);
            s.log(error, 4);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            s.log(stderr, 4);
           // return;
        }
        console.log(`${stdout}`);
        s.log(stdout, 2);
    });
}


function compileSingleGCC(folder, file){ //todo, test it
    console.log("Compiling file " + file + "...");
    s.log("Compiling file " + file + "...");
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
    s.log("Compiling file " + file + "...");
    exec("cd " + folder  + " && go build " + folder + "\\" + file, (error, stdout, stderr) => {
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


function compileGradle(folder){
    s.log("Gradle Compile");
    exec("cd " + folder + " && gradlew build", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            s.log("Gradle build error: " + error, 4);
            console.log(colorText(_white, "Uh oh! Seems like this gradle file isn't meant for building", _bgRed));
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            s.log("Gradle build stderr: " + stderr, 4);
        // return;
        }
        s.log("Gradle build stdout: " + stdout, 2);
        console.log(`${stdout}`);
    });
}

async function compileCustom(folder, scrypty){


    console.log("The scrypty file has set the compilation method to custom, which means custom commands are being executed. Make sure you trust the source before you continue.");

    s.log("Custom commands: " + s.getScryptyCommands(scrypty), 2);

    let r = "";

    while(r != ("y" || "n")){
        r = prompt("Y (Continue) | N (Don't continue) | C (Check commands)");
        r = r.toLowerCase();
        switch(r){
            case "y":
                console.log(colorText(_green, "Continuing...")); break;
            case "n":
                console.log(colorText(_red, "Not continuing... trying to find other ways to compile"));
                s.log("Skipped custom");
                return 1;
            case "c":
                console.log("Commands:");
                for(let i = 0; i < s.getScryptyCommands(scrypty).length; i++){
                    console.log(s.getScryptyCommands(scrypty)[i].cmd);
                }
                break;

            default: console.log(colorText(_yellow, "Not a valid option")); break;
        }
    }
    

    let len = s.getScryptyCommands(scrypty).length;
    let i = 0;
    console.log("running custom commands...");
    s.log("Running custom commands");
    while(len > i){ //probably should await this...
        cmd = s.getScryptyCommands(scrypty)[i].cmd;
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




function findWorkingDir(programName){
    //with the method below, we can clone the git repo to the root of our directory
    //but the problem is zip files don't behave the same way, so we'll have to check whether there's a single folder inside the folder and cd into there
    let folder = __dirname + "\\repositories\\" + programName;
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


if(process.argv.length > 2){
    run(process.argv[2]);
}
else{
    run("https://github.com/battlecode/duckstation");
}


function run(link){
    displayScryptyInfo();
    download(link);
}


function displayScryptyInfo(){
    console.log("Welcome to Scrypty!");
    console.log("Using Scrypty Version " + scryptyVersion);
}


async function checkPrerequisitesPromises(){
    let promises = [];
    for(let i = 0; i < methodNames.length; i++){
        promises.push(checkIfExecFails(methodCommands[i]));
    }   
    return Promise.allSettled(promises);
}

function checkIfExecFails(command){
    let fails = true;
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if(error){
                fails = true;
            }
            else{
                fails = false;
            }
            resolve(fails);
        });
    });
}

async function gitDownload(url, programName){

    let folder = __dirname + "\\repositories\\" + programName;

    fs.mkdir(folder, (err) => {
        //  console.error(err); it just keeps saying that we've already made this directory so lets just comment this out for now
        s.log("Directory for program already exists, probably an accidental redownload or forceful recompile", 3);
        return;
    });


    let spinner = new s.spinner(100, "Cloning into " + folder);
    spinner.start();
    s.log("Cloning into " + folder + "...");

    exec("git clone " + url + " " + folder + " --recursive", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            s.log(error, 4);
         //   return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            s.log(stderr, 3);
           // return;
        }
        spinner.stop(); 
        s.log(stdout, 2);
        compile(programName);
        s.log("Starting to compile");
    });
}

async function zipDownload(programName, url) {

    let folder = __dirname + "\\repositories\\" + programName;

    fs.mkdir(folder, (err) => {
        //  console.error(err); it just keeps saying that we've already made this directory so lets just comment this out for now
        return;
    });

    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream("./" + programName + "/" + url.substr(url.lastIndexOf("/")))) //create the zip file
        .on('finish', async () =>{
            console.log("unzipping...");
            s.log("unzipping file");
            fs.createReadStream("./" + programName + "/" + url.substr(url.lastIndexOf("/"))) //unzip
            .pipe(unzipper.Extract({ path: './' + programName }));
             fs.unlink("./" + programName + "/" + url.substr(url.lastIndexOf("/")), (err) => {
                if(err){
                    console.error(err);
                    s.log(err, 4);
                    return;
                }
                console.log("compiling");
                compile(programName);
                s.log("Starting to compile");
             });
        });
}