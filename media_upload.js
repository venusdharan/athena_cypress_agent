const axios = require("axios");
const fs = require("fs");
const fsp = require('fs/promises');
var S3 = require("aws-sdk").S3;
const { v4: uuidv4 } = require('uuid');


var data_base_full = process.argv.slice(2);
var AgentData = data_base_full[0];
var AgentJson = JSON.parse(Buffer.from(AgentData, 'base64').toString('ascii'));

console.log("---------------")
console.log(AgentJson)
console.log("---------------")


const accountid = AgentJson.agent_cypress.r2accountid 
const access_key_id = AgentJson.agent_cypress.r2accountkeyid 
const access_key_secret = AgentJson.agent_cypress.r2secret 



async function start() {
    const s3 = new S3(
        {
            endpoint: `https://${accountid}.r2.cloudflarestorage.com`,
            accessKeyId: `${access_key_id}`,
            secretAccessKey: `${access_key_secret}`,
            signatureVersion: 'v4',
        }
    );
    if (AgentJson.video) {
        var file = AgentJson.video;
        console.log("Uploading video file")
        console.log(file)
        console.log("Uploading video file")
        var stream = fs.createReadStream(file);
        var uuid = uuidv4();
        var up = await s3.upload({ Body: stream, Bucket: "athena", Key: uuid, ContentType: 'video/mp4' }).promise();
        var payload = {
            project_id: AgentJson.agent_cypress.project_id,
            spec_id: AgentJson.spec_id,
            video_key: up.key
        }
        var upload_details = await axios.post(`${AgentJson.agent_cypress.server_url}/cypress/after_video_upload`, payload);
    }
    if (AgentJson.screenshots) {
        var temp_screen_shots = AgentJson.screenshots;
        var image_ids = [];
        for(var i = 0; i < temp_screen_shots.length ; i++){
            var  screen_shot = temp_screen_shots[i];
            var file = screen_shot.path;
            console.log("Uploading image file")
            console.log(file)
            console.log("Uploading image file")
            var stream = fs.createReadStream(file);
            var uuid = uuidv4();
            var up = await s3.upload({ Body: stream, Bucket: "athena", Key: uuid, ContentType: 'image/png' }).promise();
            image_ids.push(up.key);
            
        }

        var payload = {
            project_id: AgentJson.agent_cypress.project_id,
            spec_id: AgentJson.spec_id,
            image_key: image_ids
        }
        var upload_details = await axios.post(`${AgentJson.agent_cypress.server_url}/cypress/after_screenshot_upload`, payload);
    }
}

try {
    start(); 
} catch (error) {
    
}


