#!/usr/bin/env node

const fs = require("fs");
const { io } = require("socket.io-client");
const agent_info = require("./agent_info");
const spawn = require('child_process').spawn;
var status = {}
status.agent_status = "connected";
status.agent_running = "stopped";
const path = require("path");
const Confirm = require('prompt-confirm');

async function start(pkg) {
    try {
        const cypress = require('cypress');
        // var project_path = process.cwd();
        var package_json = pkg
        // var cypress_json = null
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
       

        if (package_json.agent_cypress) {
            console.log("Cypress Remote Runner Agent");
            
            const socket = io(package_json.agent_cypress.server_url);
            // const prompt = new Confirm({
            //     name: 'sync_mode', 
            //     message: 'Old Tests are found. Do you want to sync with server? or Clear old tests?',
            // });
            // var ans = await prompt.ask();
            // console.log(ans);

            socket.on("connect", async function () {
                console.log("Connected to Tiny Cypress Server");
                var res = await agent_info.getinfo();
                // console.log("-------------Hardware-----------");
                // console.table(res.hardware);
                // console.log("-------------CPU----------------");
                // console.table(res.cpu);
                // console.log("-------------Memory-------------");
                // console.table(res.memory);
                // console.log("-------------OS-----------------");
                // console.table(res.os);

                var d = {
                    project_id: package_json.agent_cypress.project_id,
                    system_info: res,
                    status: status,
                    
                }
                d = {
                    ...d , ...package_json.agent_cypress
                }
                console.log("Project ID ", d)
                socket.emit("join_agent", d);
            });

            //var res = await agent_info.getinfo();
            // var d = {
            //     agent_id: socket.id,
            //     project_id: package_json.agent_cypress.project_id,
            //     system_info: res,
            //     status: status,
            //     agent_name: package_json.agent_cypress.agent_name
            // };
            // socket.emit("agent_info_recv", d);

            socket.on("agent_start", async function (data) {
                
                if(package_json.agent_cypress.agent_name == data.agents){
                    console.log("Agent Start Requested");
                    if(status.agent_running == "stopped"){
                        status.agent_running = "started";
                        console.log("Agent Started");
                        cypress.run(cypress_json)
                        .then(result => {
                            var res = {
                                result : result,
                                status: "finished",
                            }
                           // console.log("Cypress Run Result",res);
                            status.agent_running = "stopped";
                            socket.emit("agent_result", res);
                        })
                        .catch(err => {
                            console.error(err.message)
                            var res = {
                                result : err,
                                status: "err",
                            }
                          //  console.log("Cypress Run Result",res);
                            status.agent_running = "stopped";
                            socket.emit("agent_result", res);
                        })
                    }else{
                        console.log("Agent Already Running");
                    }
                }
  
            });
            socket.on("agent_info_send", async function () {
                console.log("Agent Info Sent");
                var res = await agent_info.getinfo();
                var d = {
                    agent_id: socket.id,
                    project_id: package_json.agent_cypress.project_id,
                    system_info: res,
                    status: status,
                    agent_name: package_json.agent_cypress.agent_name
                };
                socket.emit("agent_info_recv", d);
            });

            socket.on("agent_status_send", function (data) {
                socket.emit("agent_status_recv", status);
            });

            socket.on("agent_specs_send", function (data) {
                socket.emit("agent_specs_recv", status);
            });

            socket.on("ui_after_spec_media_agent", async function (data) {
                var worker_data = {
                    ...data,
                    ...pkg
                }
                var worker_payload = Buffer.from(JSON.stringify(worker_data)).toString('base64');
                if(worker_data.video){
                    var child = spawn('node', [path.join(__dirname,'./media_upload.js'),worker_payload]);
                    child.stdout.setEncoding('utf8');
                    child.stdout.on('data', function (data) {
                        console.log('video upload worker OUT :: ' + data);
                    });
                    child.stderr.setEncoding('utf8');
                    child.stderr.on('data', function (data) {
                        console.log('video upload worker OUT :: ' + data);
                    });
                    child.on('close', function (code) {
                        console.log('video upload worker closed :: ' + code);
                    });
                }
                if(worker_data.screenshots){
                    
                }
            });

            socket.on("ui_after_spec_video", async function (data) {
                
            });




        } else {
            console.log("Tiny Cypress config not found");
            console.log("Please configure Tiny Cypress in package.json");
            process.exit(1);
        }





    } catch (error) {
        console.log(error)
        console.log("cypress not installed");
        console.log("Install cypress with: npm install cypress");
        console.log("Then run: npm run cypress:run");
        console.log("Existing ..");
        process.exit(1);


    }
}

module.exports.start = start;


// const axios = require("axios")

// var project_path = process.cwd();

// var package_json = require(project_path + "/package.json");

// var cypress_json = null;

// if(fs.existsSync(project_path + "/cypress.json")){
//     cypress_json = fs.readFileSync(project_path + "/cypress.json");
// }else{

// }



//const cypress = require('cypress')





