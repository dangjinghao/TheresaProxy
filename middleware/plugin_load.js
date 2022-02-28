const fs = require("fs")
const path = require("path")
//var {on_user_request_list,on_proxy_response_list}=require("./plugins_require")
var on_user_request_list = []
var on_proxy_response_list = []


class PluginConfig{
    constructor(PluginName){
        this.PluginName = PluginName
        let JsonFilePath = path.normalize(`${__dirname}/../plugins_config/${PluginName.replace(".js","")}.json`)
        this.JsonConfig = this.GetJsonFile(JsonFilePath)
    }
    get ConfigJson(){
        return this.JsonConfig
    }
     GetJsonFile(JsonFilePath){
        try {
            fs.accessSync(JsonFilePath);
          } catch (err) {
            fs.writeFileSync(JsonFilePath,"{}");
          }
          
       let JsonData= require(JsonFilePath)
       
       return JsonData
    }
}
class register{
    constructor(){}
    on_user_request(func){
        on_user_request_list.push(func)
    }
    
    on_proxy_response(func){
        on_proxy_response_list.push(func)
    }

}
module.exports={PluginConfig,register,on_proxy_response_list,on_user_request_list,}