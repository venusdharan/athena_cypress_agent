var api = require("./api")
const fs = require("fs");
const Confirm = require('prompt-confirm');
const { io } = require("socket.io-client");
const agent_info = require("./agent_info");
const spawn = require('child_process').spawn;
var status = {}
status.agent_status = "connected";
status.agent_running = "stopped";
const path = require("path")
module.exports.init = async function (on,pkg) {
    console.log("cypress agent init");
    var project_path = process.cwd();
    var package_json = pkg; //require(project_path + "/package.json");
    // if(fs.existsSync(project_path + "/cypress.config.js")){
    //     cypress_json = require(project_path + "/cypress.config.js");
    // }else{
    //     console.log(" Cypress config not found");
    //     console.log("Please configure  Cypress in cypress.config.js");
    //     process.exit(1);
    // }

    // if(cypress_json == null){
    //     console.log(" Cypress config not found");
    //     console.log("Please configure  Cypress in cypress.config.js");
    //     process.exit(1);
    // }
    if (!package_json.agent_cypress) {
        console.log("Tiny Cypress config not found");
        console.log("Please configure Tiny Cypress in package.json");
        process.exit(1);
    }
    //if (!settings) throw new Error('Settings not found');
    api.init(package_json.agent_cypress.server_url);


    on('after:run',async (results) => {
        results.project_id = package_json.agent_cypress.project_id;
        results.name = package_json.agent_cypress.name;;
        await api.AfterRun(results);
    })

    // on('after:screenshot', async (details) => {
    //     details.project_id = settings.project_id;
    //     await api.AfterScreenshot(details);
    // })

    on('after:spec', async(spec, results) => {
        var data = {
            
        }
        if(results){
            data.results = results;
        }
        if(spec){
            data.spec= spec;
        }
        data.project_id = package_json.agent_cypress.project_id;
        data.name = package_json.agent_cypress.name;
        await api.AfterSpec(data);
    })

    // on('before:browser:launch', async (browser = {}, launchOptions) => {
    //     var data = {
    //         browser : browser,
    //         launchOptions : launchOptions
    //     }
    //     data.project_id = settings.project_id;
    //     await api.BeforeBrowserLaunch(data);
    // })

    on('before:run', async (details) => {
        try {
            details.project_id = package_json.agent_cypress.project_id;
            details.name = package_json.agent_cypress.name;
            var d = await api.BeforeRun(details);
            //console.log(d)
        } catch (error) {
            console.log(error);
        }
    })

    on('before:spec', async (spec) => {
        try {
            data = {
                spec : spec,
              
            }
            data.project_id = package_json.agent_cypress.project_id;
            data.name = package_json.agent_cypress.name;
            var d = await api.BeforeSpec(data);
            //console.log(d)
        } catch (error) {
            console.log(error);
        }
       
    })

    // on('file:preprocessor', async (file) => {
    //     await api.FilePreprocessor(file)
    // })

    // on('task', async (task) => {
    //     // ...
    // })
}

var on = null;
var config = null;
var settings = null;



module.exports.plugin = require("./agent_cypress");