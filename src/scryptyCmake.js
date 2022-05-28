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
        let key = el.substring(el.indexOf("\"")+1, el.lastIndexOf("\""));
        let value = el.substring(el.lastIndexOf("\""), el.lastIndexOf(")"));
        if(value == "off"){  //sometimes, its not a simple on or off, they're actually variables, but we don't really know what the variables are in reference to
            value = false;
            options.set(key, value);
        }
        else if(value == "on"){
            value = true;
            options.set(key, value);
        }
        //so
        //key = Use your installed copy of curl
        //value = false
        
    });
    return options;
}


exports.parseCmake = parseCmake;