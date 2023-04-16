let colorText = require("./scryptylib").colorText;
let s = require("./scryptylib");
let fs = require("fs");
const os = require("os");
const request = require("request");
const { exec } = require("child_process");

async function install(file){
    return new Promise((resolve) => {
        let osName = "windows";
        let result = false;
        switch(os.platform()){
            case "win32": osName = "windows"; break;
        }
        const installFile = JSON.parse(fs.readFileSync(file));
        if(!fs.existsSync(__dirname + "/compilers")){
            fs.mkdirSync(__dirname + "/compilers");
        }
        request.get(installFile.file[osName].primary).on('error', console.error)
        .pipe(fs.createWriteStream(__dirname + "/compilers/setup-x86_64.exe")) //create the zip file
        .on('finish', async () =>{
            let command = installFile.command[osName].commands[0];
            command = command.replace("${working_dir}", __dirname + "\\compilers\\gpp");
            command = command.replace("${file_dir}", __dirname + "\\compilers");
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    s.log(error, 4);
                    resolve(false);
                    return;
                }
                if (stderr) {
                    console.log(`${stderr}`);
                    s.log(stderr, 4);
                // return;
                }
                console.log(`${stdout}`);
                s.log(stdout, 2);
                resolve(true);
            });
        });
    });
}


exports.install = install;