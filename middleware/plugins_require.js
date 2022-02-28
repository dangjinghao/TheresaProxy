const fs = require("fs")
const path = require("path")
const log4js = require("log4js")


const logger = log4js.getLogger("plugins")
const plugins_path = path.normalize(__dirname+"/../plugins/")
try {
    fs.accessSync(plugins_path);
} catch (err) {
    logger.debug("不存在插件目录，正在创建")
    fs.mkdirSync(plugins_path);
}
const files = fs.readdirSync(plugins_path)
var PluginsArray = []
for(let file of files){
    var single_plugin = path.normalize(plugins_path+file)
    var {plugin_main} = require(single_plugin)
    PluginsArray.push(plugin_main)
    logger.info(`加载插件--${file}`)
}

if(files.length!==0){
    function DIY_interceptor(responseBuffer,proxyRes,req,res){

        for(let plugin_main of PluginsArray){
            var plugin_returen_list = plugin_main(responseBuffer,proxyRes,req,res)
            responseBuffer = plugin_returen_list[0]
            proxyRes = plugin_returen_list[1]
            req = plugin_returen_list[2]
            res = plugin_returen_list[3]
            
        }
        return [responseBuffer,proxyRes,req,res] 
    }  
       
}
else{
    logger.info("无插件加载")
    function DIY_interceptor(responseBuffer,proxyRes,req,res){
        return [responseBuffer,proxyRes,req,res] 
    }
}
module.exports={
    DIY_interceptor 
}