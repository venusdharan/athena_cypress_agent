var axios = require("axios");

var token = "";

const os = require("os");

const tempDir = os.tmpdir();

const path = require("path");

const fs = require("fs");

module.exports.init = async function (baseUrl) {

//   this.token = token;
  this.baseUrl = baseUrl;
  this.axios = axios.create({
    baseURL: this.baseUrl,
    // headers: {
    //   Authorization: "Bearer " + this.token,
    // },
  });
  // this.axios.interceptors.response.use(
  //   function (response) {
  //     return response;
  //   },
  //   function (error) {
  //     if (error.response.status === 401) {
  //       console.log("Token expired");
  //       process.exit(1);
  //     }
  //     return Promise.reject(error);
  //   }
  // );

  if(fs.existsSync(path.join(tempDir,"athena_cypress_agent.state"))){
    fs.unlinkSync(path.join(tempDir,"athena_cypress_agent.state"));
  }

}

module.exports.SubmitALL = async function (data) {
    try {
        var res = await this.axios.post("/cypress/submit_all", data);
        return res; 
    } catch (error) {
        console.log(error)
        return false;
    }
    
}

module.exports.BeforeRun = async function (data) {
    try {
        var res = await this.axios.post("/cypress/before_run", data);
        console.log(res.data)
        fs.writeFileSync(path.join(tempDir,"athena_cypress_agent.state"),JSON.stringify(res.data));
        return res;
    } catch (error) {
        console.log(error)
        return false;
    }
   
}

module.exports.AfterRun = async function (data) {
    try {
        var obj = fs.readFileSync(path.join(tempDir,"athena_cypress_agent.state"));
        var json = JSON.parse(obj);
        data["project_id"] = json.project_id;
        data["project_start_time"] = json.time;
        data["insertedId"] = json.insertedId;
        var res = await this.axios.post("/cypress/after_run", data);
        return res;
    } catch (error) {
        console.log(error)
        return false;
    }
  
}

module.exports.BeforeSpec = async function (data) {
    try {
        var obj = fs.readFileSync(path.join(tempDir,"athena_cypress_agent.state"));
        var json = JSON.parse(obj);
        data["project_id"] = json.project_id;
        data["project_start_time"] = json.time;
        data["insertedId"] = json.insertedId;
        var res = await this.axios.post("/cypress/before_spec", data);
        return res;
    } catch (error) {
        console.log(error);
        return false;
    }
    
}

module.exports.AfterSpec = async function (data) {
    try {
        var obj = fs.readFileSync(path.join(tempDir,"athena_cypress_agent.state"));
        var json = JSON.parse(obj);
        data["project_id"] = json.project_id;
        data["project_start_time"] = json.time;
        data["insertedId"] = json.insertedId;
        console.log(json)
        var res = await this.axios.post("/cypress/after_spec", data);
        return res; 
    } catch (error) {
        console.log(error)
        return false;
    }
    
}

module.exports.BeforeBrowserLaunch = async function (data) {
    try {
        var res = await this.axios.post("/cypress/before_browser_launch", data);
        return res;
    } catch (error) {
        console.log(error)
        return false;
    }
  
}

module.exports.AfterScreenshot= async function (data) {
    try {
        var res = await this.axios.post("/cypress/before_browser_launch", data);
        return res;
    } catch (error) {
        console.log(error)
        return false;
    }
   
}

// module.exports.FilePreprocessor= async function (data) {
//     try {
//         var res = await this.axios.post("/cypress/filepreprocessor", data);
//         return res;
//     } catch (error) {
//         console.log(error)
//         return false;
//     }
    
// }

// module.exports.Task= async function (data) {
//     try {
//         var res = await this.axios.post("/cypress/task", data);
//         return res;  
//     } catch (error) {
//         console.log(error)
//         return false;
//     }
    
// }

