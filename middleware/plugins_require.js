const fs = require("fs")
const path = require("path")
const log4js = require("log4js")

var {on_proxy_response_list}= require("./plugin_load")
const logger = log4js.getLogger("plugins")
const plugins_path = path.normalize(__dirname+"/../plugins/")

try {
    fs.accessSync(plugins_path);
} catch (err) {
    logger.debug("不存在插件目录，正在创建")
    fs.mkdirSync(plugins_path);
}
const files = fs.readdirSync(plugins_path)

for(let file of files){
    var single_plugin = path.normalize(plugins_path+file)
    require(single_plugin)
    logger.info(`加载插件--${file}`)
}

function proxy_interceptor(responseBuffer,proxyRes,req,res){
    for(let plugin of on_proxy_response_list){
        var plugin_return_list = plugin(responseBuffer,proxyRes,req,res)
        var responseBuffer = plugin_return_list[0]
        var proxyRes = plugin_return_list[1]
        var req = plugin_return_list[2]
        var res = plugin_return_list[3]
        
    }
    return [responseBuffer,proxyRes,req,res]
}
module.exports={
    proxy_interceptor
}