const prompt = require("prompt-sync")();
const colorText = require("./scryptylib").colorText;
const s = require("./scryptylib");
const fs = require("fs");
const { exec } = require("child_process");
const os = require("os");
const prereqInstaller = require("./prereqInstaller.js");

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

async function compileSingleGPP(folder, file, programName){ //of course later down the line we can set this up to be whatever compiler we want, I'm just using g++ because thats what I know

    if(await s.checkIfExecFails(s.getCppCompiler().testCommand)){
        console.log(colorText(s._red, s._bright + "No C++ compiler found! Would you like to install one? (Y/N)"));
        
        let r = "";
        while(r != ("y" || "n")){
            r = prompt("Y (Install) | N (Don't install)");
            r = r.toLowerCase();
            switch(r){
                case "y":
                    console.log(colorText(s._green, "Installing...")); break;
                case "n":
                    console.log(colorText(s._red, "Not installing... install a C++ compiler before trying again with compiling with C++"));
                    s.log("Skipped install of G++", 2);
                    return 1;

                default: console.log(colorText(s._yellow, "Not a valid option")); break;
            }
        }

        if(fs.existsSync("./installers/gpp.scryptyInstaller")){
           await prereqInstaller.install("./installers/gpp.scryptyInstaller");
        }

    }

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
                    console.log(colorText(s._green, s._bright + "Choose the .cpp file to compile:"));
                    for(let i = 0; i < files.length; i++){
                        console.log(colorText(s._magenta, s._bright + "[" + (i+1) + "]")  + " " + files[i]);
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
                            console.log(colorText(s._yellow, "Skipping... (I guess you really want to see all of the .cpp files, do you)"));
                            file = "none";
                            s.log("Skipped common cpp files");
                            validNum = true;
                        }  
                        else{
                            console.log(colorText(s._red, "Choose a valid option!"));
                        }
                    }
                    else{
                        console.log(colorText(s._red, "Choose a valid option!!"));
                    }
                }
            }
            else{
                file = files[0]; //i mean, it passed the first if, there HAS to be something there
            }
            
        }
    }
    if(file == "none" || file === undefined || file == 2){ //if we still have no file selected
        files = await getDirectories(s._s._dirname + "\\" + programName);
        files = files.filter((e) => { return e.endsWith(".cpp"); });
        console.log(files);
        for(let i = 0; i < files.length; i++){
            files[i] = files[i].substring(files[i].lastIndexOf("/")+1, files[i].length);
            files[i] = files[i].substring(files[i].lastIndexOf("\\")+1, files[i].length);
        }
        console.log(colorText(s._green, s._bright + "Choose the .cpp file to compile:"));
            for(let i = 0; i < files.length; i++){
                console.log(colorText(s._magenta, s._bright + "[" + (i+1) + "]")  + " " + files[i]);
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
                    console.log(colorText(s._red, "Choose a valid option! (you really need to choose an option, please of course)"));
                }
            }
            else if(r == "exit"){
                process.exit();
            }
            else{
                console.log(colorText(s._red, "Choose a valid option!!"));
            }
        }
    }


    let cppVer;
    console.log(colorText(s._magenta, s._bright + "[1] ") + "C++20");
    console.log(colorText(s._magenta, s._bright + "[2] ") + "C++17");
    console.log(colorText(s._magenta, s._bright + "[3] ") + "C++14");
    console.log(colorText(s._magenta, s._bright + "[4] ") + "C++11");
    console.log(colorText(s._magenta, s._bright + "[5] ") + "C++03");

    let validNum = false; //i hate it when local variables become global, probably should be using typescript?!?!!? nah whatever this'll never not work :)
    r = "";

    while(!validNum){

        let r = prompt(colorText(s._green, s._bright + "Choose the C++ version to use (if unsure, try C++17, and if that doesn't work, go down the chain. You can try using C++20, but it's so new, some compilers might not support it): "));

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
                console.log(colorText(s._red, "Choose a valid option!"));
            }
        }
        else{
            console.log(colorText(s._red, "Choose a valid option!"));
        }
    }
    //why would anyone use anything prior to 03 it's not like with c people use c98 all the time, right? .....right? uh oh

    let cppCompileCommand = "g++";
    if(fs.existsSync(__dirname + "/compilers/gpp/bin")){
        cppCompileCommand = __dirname + "\\compilers\\gpp\\bin\\g++.exe";
    }


    console.log("Compiling file " + file);
    s.log("Compiling file " + file + "... cppVer: " + cppVer);
    let spinner = new s.spinner(100, colorText(s._white, "Building", s._bgGreen));
    spinner.start();
    exec(cppCompileCommand + " --std=" + cppVer + " " + file + " -o " + file.substr(0, file.lastIndexOf(".")) + (os.platform() == "win32" ? ".exe" : ""), (error, stdout, stderr) => {
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

exports.compileSingleGPP = compileSingleGPP;
exports.findIfCpp = findIfCpp;