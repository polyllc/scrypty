const https = require("https");
const fs = require("fs");
const request = require("request");
const { exec } = require("child_process");
const unzipper = require("unzipper");
const findit = require('findit');

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

//make sure all files passes the checksum (if the repo has said checksums)




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
    //singleg++  compile only one file, c++
    //singlegcc  compile only one file, c
    //make       compile by make
    //cmake      compile by cmake
    //vs         compile by visual studio
    //singlego   compile only one file, go
    //singlejava compile only one file, java
    //gradle     compile by gradle
    //maven      compile by maven
    //yarn       compile by yarn
    //npm        compile by npm (either by npm install in wdir or asking the user if they know that the package is available on npm already)
    //nmakevs    compile by visual studio's nmake
    //custom     compile by custom commands defined in the scrypty file (maybe one day there'll be a scrypty server with scrypty files?)
    //autocustom compile by instructions found in readme


    //ways to find out how to compile
    //scrypty file!!!!!!!
    //check for makefile
    //check for gradle file
    //check for maven file
    //check for yarn.lock
    //check for package.json
    //check for vs .sln
    // ----- ok the obvious ones end here, down below are just (very educated) guesses that would make sense! -----
    //check if there are multiple files, find the one with file names that would make sense
    // like: main.cpp, {programname}.cpp, index.cpp, stuff like that
    //if there are multiple files, find the most popular extension (not always working)
    //read the readme for compile instructions, use keywords such as `` (code blocks), the current running os, something like building, # building, or something like that





    var methods = []; //the methods of compilation, the earlier in the array, the better method of compilation, we still ask the user, but inform them which one is the better option

    var scryptyFile = "none";

    var folder = __dirname + "\\" + programName;

    var files = fs.readdirSync(folder);
    if(findIfScrypty(files)){
        scryptyFile = folder + "\\" + files.find((element) => { return element.endsWith(".scrypty");} );
        if(!verifyScrypty(scryptyFile)){
            console.log("Found scrypty file! But it doesn't seem to be formatted correctly :(. Trying other ways to compile...");
        }
        else{
            methods.push(parseScrypty(scryptyFile)['compile']['method']); //we always listen to scrypty file!
            console.log("Found Scrypty file!");
        }
    }

    if(methods.length == 1){
        switch(methods[0]){
            case "singleg++": 
            if(scryptyFile != "none"){
                compileSingleGPP(folder, parseScrypty(scryptyFile)['compile']['mainFile']); break;
            }
            else {
                break;
            }
            case "custom":
                compileCustom(folder, scryptyFile);
        }
    }
    else if(methods.length > 1){
        //insert code to find the best option (prompt user)
    }
    else{
        console.log("Couldn't find a way to compile this repository, make sure it's not a library or something that can't be compiled, or compile it yourself. The repository has been cloned into: " + folder);
        return;
    }
    
    console.log("Repository installed! Program is found in: " + folder + ". Run this program with `scrypty run " + programName + "`");
    //stuff to find
    //find folder with scripts for install.sh or build.sh or something with that (confirm with user!)
    //find install.sh or build.sh (confirm with user!)

}



function compileSingleGPP(folder, file){
    console.log("Compiling file " + file + "...");
    exec("g++ " + folder + "\\" + file + " -o " + folder + "\\" + file.substr(0, file.lastIndexOf(".")) + ".exe", (error, stdout, stderr) => {
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


function compileCustom(folder, scrypty){
    scrypty = parseScrypty(scrypty);
    var len = scrypty['compile']['commands'].length;
    var i = 0;
    console.log("running custom commands...");
    while(len > i){
        cmd = scrypty['compile']['commands'][i]['cmd'];
        console.log("command #" + i+1 + ": " + cmd);
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



function verifyScrypty(scryptyFile){
    return true;
}

function findIfScrypty(files, programType, folder) {
    if (files.find((element) => { return element.endsWith(".scrypty"); })) { //lets go, a scrypty file!
        return 1;
    }
    return 0;
}

function parseScrypty(file){
    return JSON.parse(fs.readFileSync(file).toString());
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


download("https://github.com/polyllc/jump-cutter-revamped.git");



async function gitDownload(url, programName){

    var folder = __dirname + "\\" + programName;

    await fs.mkdir(folder, (err) => {
        //  console.error(err); it just keeps saying that we've already made this directory so lets just comment this out for now
        return;
    });

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
