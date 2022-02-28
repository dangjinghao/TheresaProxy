const fs = require("fs")
const path = require("path")
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
module.exports={PluginConfig}