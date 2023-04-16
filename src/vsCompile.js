let prompt = require("prompt-sync")();
let colorText = require("./scryptylib").colorText;
let s = require("./scryptylib");
let fs = require("fs");
const { exec } = require("child_process");




function findIfVS(allFiles){
    let slns = allFiles.filter((element) => { return element.endsWith(".sln") || element.endsWith(".vcxproj") || element.endsWith(".csproj"); });
    if(slns.length > 0){
        return true;
    }
    return false;
}


async function findVSMethod(allFiles, programName){ //todo make it so if there's only one sln, just continue

    let sln = ""; 

        let slns = allFiles.filter((element) => { return element.endsWith(".sln"); });
        preferredSlns = slns.filter((element) => { return (element.toLowerCase().substr(element.lastIndexOf("/")).indexOf(programName) != -1) ?  element : "" }); //the preferred sln is the slns in the array with the programName in the file name
        notPreferredSlns = slns.filter((element) => { return (element.toLowerCase().substr(element.lastIndexOf("/")).indexOf(programName) == -1) ?  element : "" }); //to filter out the rest

        if(slns.length == 0){
            return;
        }
        //todo, separate vcxproj from slns by listing separate by user choice
        console.log("Found solutions!");
        s.log("Found " + preferredSlns.length + " preferred solutions and " + notPreferredSlns.length + " not preferred solutions");
        s.log("Preferred Solutions: " + preferredSlns, 2);
        s.log("Not Preferred Solutions: " + notPreferredSlns, 2);

        console.log(colorText(s._black, s._dim + "Choose a solution to compile (you can choose later if there are more methods to compile whether or not to compile by visual studio solutions)", s._bgCyan));
        console.log("\n");


        console.log(colorText(s._green, colorText(s._cyan, s._bright + "[0]") + s._bright + " Skip/Don't compile by Visual Studio"));

        if(preferredSlns.length != 0){
            console.log(colorText(s._green, s._bright + "These solutions are the better option to choose from (because they have the repo's name in the file name)"));
            for(let i = 0; i < preferredSlns.length; i++){
                console.log(colorText(s._magenta, s._bright + "[" + (i+1) + "]")  + " " + preferredSlns[i]);
            }
        }
        console.log("\n");
        if(notPreferredSlns.length != 0){
            console.log(colorText(s._yellow, s._bright + "Other solutions (might still be viable!)"));
            for(let i = 0; i < notPreferredSlns.length; i++){
                console.log(colorText(s._magenta, s._bright + "[" + (i+1+preferredSlns.length) + "]")  + " " + notPreferredSlns[i]);
            }
        }

        let r;

        let validNum = false;

        while(!validNum){
            console.log("Choose solution by the number indicated next to each solution");
            r = prompt("Type in '+' for more options:");


            //geniunely no idea why this works, does prompt make it an integer already? if so, i know how this works
            if(parseInt(r) || r == "0"){
                if(r > 0 && r <= slns.length){
                    if(parseInt(r) > preferredSlns.length){ //parseInt just in case
                        sln = notPreferredSlns[parseInt(r)-preferredSlns.length-1];
                    }
                    else{
                        sln = preferredSlns[parseInt(r)-1];
                    }
                    validNum = true;
                }  
                else if(r == "0"){
                    console.log(colorText(s._red, "Not compiling by Visual Studio (skipped by user)"));
                    s.log("Skipped compiling by sln");
                    validNum = true;
                }  
                else{
                    console.log(colorText(s._red, "Choose a valid option!"));
                }
            }
            else if(r.toLowerCase() == "+"){
                console.log(colorText(s._green, "Showing more options..."));
                s.log("Showing more options", 2);
                slns = allFiles.filter((element) => { return element.endsWith(".sln") || element.endsWith(".vcxproj") || element.endsWith(".csproj"); });
                preferredSlns = slns.filter((element) => { return (element.toLowerCase().substr(element.lastIndexOf("/")).indexOf(programName) != -1) ?  element : "" }); //the preferred sln is the slns in the array with the programName in the file name
                notPreferredSlns = slns.filter((element) => { return (element.toLowerCase().substr(element.lastIndexOf("/")).indexOf(programName) == -1) ?  element : "" }); //to filter out the rest
        
                if(slns.length == 0){
                    return;
                }
                s.log("Found " + preferredSlns.length + " preferred solutions/vcxproj and " + notPreferredSlns.length + " not preferred solutions/vcxproj");
                s.log("Preferred Solutions/vcxproj: " + preferredSlns, 2);
                s.log("Not Preferred Solutions/vcxproj: " + notPreferredSlns, 2);
                if(preferredSlns.length != 0){
                    console.log(colorText(s._green, s._bright + "These solutions are the better option to choose from (because they have the repo's name in the file name)"));
                    for(let i = 0; i < preferredSlns.length; i++){
                        console.log(colorText(s._magenta, s._bright + "[" + (i+1) + "]")  + " " + preferredSlns[i]);
                    }
                }
                console.log("\n");
                if(notPreferredSlns.length != 0){
                    console.log(colorText(s._yellow, s._bright + "Other solutions (might still be viable!)"));
                    for(let i = 0; i < notPreferredSlns.length; i++){
                        console.log(colorText(s._magenta, s._bright + "[" + (i+1+preferredSlns.length) + "]")  + " " + notPreferredSlns[i]);
                    }
                }
        
        
            }
            else{
                console.log(colorText(s._red, "Choose a valid option!!"));
            }
        }
    return new Promise((resolve) => {
        s.log("Sln chosen: " + sln);
        resolve(sln);
    });
}

function compileVSSolution(folder, file, programName){
    console.log(colorText(s._magenta, "Compiling solution..."));
    s.log("Compiling solution " + file + "...");



    //config platforms for reference :)
    /*
    GlobalSection(SolutionConfigurationPlatforms) = preSolution
		CodeCoverage|Any CPU = CodeCoverage|Any CPU
		Debug|Any CPU = Debug|Any CPU
		Linux|Any CPU = Linux|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection


    and for vcxproj:
    
      <ItemGroup Label="ProjectConfigurations">
            <ProjectConfiguration Include="Debug|x64">
            <Configuration>Debug</Configuration>
            <Platform>x64</Platform>
            </ProjectConfiguration>
            <ProjectConfiguration Include="Release|x64">
            <Configuration>Release</Configuration>
            <Platform>x64</Platform>
            </ProjectConfiguration>
        </ItemGroup>
    */
    let sln = [];
    fs.readFile(file, 'utf8', (err, data) => {

        if(file.endsWith(".sln")){
            sln = data.substr(data.indexOf("GlobalSection(SolutionConfigurationPlatforms) = preSolution") + "GlobalSection(SolutionConfigurationPlatforms) = preSolution".length, data.substr(data.indexOf("GlobalSection(SolutionConfigurationPlatforms) = preSolution")).indexOf("EndGlobalSection"));
            sln = sln.split("\n");
        }
        else{
            let foundConfigPlatform = true;
            let newData = data;
            while(foundConfigPlatform){
                if(newData.indexOf("<ProjectConfiguration Include=\"") != -1){
                    newData = newData.substring(newData.indexOf("<ProjectConfiguration Include=\"")+"<ProjectConfiguration Include=\"".length, newData.length);
                    let configPlatform = newData.substring(0, newData.indexOf("\""));
                    if(!sln.includes(configPlatform)){
                        sln.push(configPlatform);
                    }
                    else{
                        foundConfigPlatform = false; 
                    }
                    newData = newData.substring(newData.indexOf("\""), newData.length);
                } 
                else{
                    foundConfigPlatform = false;
                }
            }
        }

        sln = sln.filter((element) => { return element.indexOf("|") != -1});

        let configs = [];
        let platforms = [];

        for(let i = 0; i < sln.length; i++){
            sln[i] = sln[i].replaceAll('\r', '').replaceAll('\t', '');
            sln[i] = sln[i].substr(0, sln[i].indexOf("=") != -1 ? sln[i].indexOf("=")-1 : sln[i].length); //to also get rid of the space before the =
            configs[i] = sln[i].split("|")[0];
            platforms[i] = sln[i].split("|")[1];
        }

        console.log(colorText(s._green, "Configuration Platforms:"));

        for(let i = 0; i < sln.length; i++){
            console.log(colorText(s._magenta, "[" + (i+1) + "]") + " " + colorText(s._green, s._bright + sln[i]));
        }

        let validNum = false;

        let config;
        let platform;

        while(!validNum){

            let r = prompt("Choose a configuration platform to compile: ");

            //geniunely no idea why this works, does prompt make it an integer already? if so, i know how this works
            if(parseInt(r) || r == "0"){
                if(r > 0 && r <= sln.length){
                    config = configs[r-1];
                    platform = platforms[r-1];
                    validNum = true;
                    s.log("Chose config " + config + ", platform " + platform);
                }    
                else if(r == "0"){
                    console.log(colorText(s._yellow, "Skipping... (using the default might still work, if not, choose one for your system, there's a reason why this option is hidden!)"));
                    s.log("Skipped config platform", 2);
                    validNum = true;
                }
                else{
                    console.log(colorText(s._red, "Choose a valid option!"));
                }
            }
            else{
                console.log(colorText(s._red, "Choose a valid option!"));
            }
        }

        validNum = false;
        let vsVer;


        console.log(colorText(s._magenta, "[0] ") + colorText(s._yellow, "Skip/Use default"));
        console.log(colorText(s._magenta, "[1] ") + colorText(s._cyan, "Visual Studio 2017"));
        console.log(colorText(s._magenta, "[2] ") + colorText(s._cyan, "Visual Studio 2019"));
        console.log(colorText(s._magenta, "[3] ") + colorText(s._cyan, "Visual Studio 2022"));

        while(!validNum){

            let r = prompt("Select your Visual Studio version (if you just downloaded it, then you probably have 2022): ");

            if(parseInt(r) || r == "0"){
                if(r > 0 && r <= 3){
                    switch(r){
                        case "1": vsVer = "v141"; break;
                        case "2": vsVer = "v142"; break;
                        case "3": vsVer = "v143"; break;
                    }
                    validNum = true;
                    s.log("Chose vsVer " + vsVer, 2);
                }    
                else if(r == "0"){
                    console.log(colorText(s._green, "Skipping..."));
                    s.log("Skipped vsVer", 2);
                    validNum = true;
                }
                else{
                    console.log(colorText(s._red, "Choose a valid option!"));
                }
            }
            else{
                console.log(colorText(s._red, "Choose a valid option!"));
            }
        }


        let vssdk;

        console.log(colorText(s._magenta, "[0] ") + colorText(s._yellow, "Skip/Use default"));
        console.log(colorText(s._magenta, "[1] ") + colorText(s._cyan, "10.0.17134.0"));
        console.log(colorText(s._magenta, "[2] ") + colorText(s._cyan, "10.0.17763.0"));
        console.log(colorText(s._magenta, "[3] ") + colorText(s._cyan, "10.0.18362.0"));
        console.log(colorText(s._magenta, "[4] ") + colorText(s._cyan, "10.0.19041.0"));
        console.log(colorText(s._magenta, "[5] ") + colorText(s._cyan, "10.0.20348.0"));
        console.log(colorText(s._magenta, "[6] ") + colorText(s._cyan, "10.0.22000.0"));

        validNum = false;

        while(!validNum){

            let r = prompt("Select the preferred Windows 10 SDK: ");

            if(parseInt(r) || r == "0"){
                if(r > 0 && r <= 6){
                    switch(r){
                        case "1": vssdk = "10.0.17134.0"; break;
                        case "2": vssdk = "10.0.17763.0"; break;
                        case "3": vssdk = "10.0.18362.0"; break;
                        case "4": vssdk = "10.0.19041.0"; break;
                        case "5": vssdk = "10.0.20348.0"; break;
                        case "6": vssdk = "10.0.22000.0"; break;
                    }
                    validNum = true;
                    s.log("Chose sdk " + vssdk, 2);
                }    
                else if(r == "0"){
                    console.log(colorText(s._green, "Skipping..."));
                    s.log("Skipped sdk", 2);
                    validNum = true;
                }
                else{
                    console.log(colorText(s._red, "Choose a valid option!"));
                }
            }
            else{
                console.log(colorText(s._red, "Choose a valid option!"));
            }
        }
        

        ///p:WindowsTargetPlatformVersion=xx;WindowsTargetPlatformMinVersion=xx

        let cp = config !== undefined ? " /property:Configuration=\"" + config + "\" /property:Platform=\"" + platform + "\" " : "";
        let pt = vsVer !== undefined ? " /p:PlatformToolset=" + vsVer : "";
        let sdk = vssdk !== undefined ? " /p:WindowsTargetPlatformVersion=\"" + vssdk + "\";WindowsTargetPlatformMinVersion=\"" + vssdk  + "\" " : "";

        let spinner =  new s.spinner(100, colorText(s._white, "Building", s._bgGreen));
        spinner.start();
        process.stdout.cursorTo(0,0);
        process.stdout.clearScreenDown();

        exec("msbuild -t:restore" + sdk + " -p:RestorePackagesConfig=true " + pt + cp + " " + file, {maxBuffer: 1024 * 4000}, (error, stdout, stderr) => { //restore nuget packages (if needed)
            if (stderr) {
               // console.log(`${stderr}`);
                s.log("restore stderr: " + stderr, 4);
            // return;
            }
            //console.log(`${stdout}`);
            s.log("restore stdout: " + stdout, 2);
            if (error) {
                console.log(`error: ${error.message}`);
                s.log("restore error: " + error.message, 4);
                console.log(colorText(s._white, "Uh oh! The build might have failed, but sometimes this part is irrelevant anyways, so continuing", s._bgMagenta));
               // return;
            }
           
            exec("msbuild -m " + file + sdk + pt + cp, {maxBuffer: 1024 * 4000}, (error, stdout, stderr) => {
                spinner.stop();
                if (stderr) {
                  //  console.log(`${stderr}`);
                    s.log("sln build stderr: " + stderr, 4);
                // return;
                }
                //console.log(`${stdout}`);
                    s.log("sln build stdout: " + stdout, 2);
                if (error) {
                    console.log(`error: ${error.message}`);
                    s.log("sln build error: " + error, 4);
                    console.log(colorText(s._white, `Uh oh! The build failed! Most likely the .sln or any of the files that the .sln mentions has an error in it. It also might be an error due to not having MSBuild in your environment variables! Another common error is not having the right build tools installed, which you can install using the Visual Studio installer.
                    You can also try these things:
                    - Changing the build tools version (visual studio version option)
                    - Changing the platform configuration
                    - Changing the Windows SDK version
                    - Choosing another .sln
                    - Making sure that you've set up the build environment (using something like cmake or whatever the repo says)
                    - Install all of the prerequesits 
                    - If there are other options to compile, try those instead`, s._bgRed));
                    console.log(colorText(s._black, "Most importantly, update Visual Studio and check the scrypty log! scryptyLogs/" + s.getLogFile() + ".scryptylog", s._bgGreen));
                }
                else{
                    return new Promise((resolve) =>{
                        resolve(sln);
                    });
                }
            });
        });
    });
    return new Promise((resolve) =>{
        resolve(sln);
    });
}

exports.findIfVS = findIfVS;
exports.compileVSSolution = compileVSSolution;
exports.findVSMethod = findVSMethod;