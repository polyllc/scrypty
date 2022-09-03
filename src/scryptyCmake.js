const fs = require('fs');
let prompt = require("prompt-sync")();
const s = require("./scryptylib");

function parseCmake(file){
    let contents = fs.readFileSync(file, 'utf8');
    let splitUp = contents.split("\n");
    splitUp = splitUp.filter((el) => { return el.toLowerCase().startsWith("option(") });

    //example: option(USE_SHARED_CURL    "Use your installed copy of curl" off)\r

    let options = new Map();

    splitUp.forEach((el) => {
        let key =  el.substring(el.indexOf("(")+1, el.indexOf("\"")).trim() + " | " + el.substring(el.indexOf("\"")+1, el.lastIndexOf("\""));
        let value = el.substring(el.lastIndexOf("\"")+1, el.lastIndexOf(")")).trim();
        if(value.toLowerCase() == "off"){  //sometimes, its not a simple on or off, they're actually variables, but we don't really know what the variables are in reference to
            options.set(key, false);
        }
        else if(value.toLowerCase() == "on"){
            options.set(key, true);
        }
        //we set it to true and false so listOptions can be used for more than one use case (in comparison to off/on)
        //so
        //key = USE_SHARED_CURL | Use your installed copy of curl
        //value = false

        
    });
    return options;
}



exports.parseCmake = parseCmake;