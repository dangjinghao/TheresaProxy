const fs = require("fs");
var { app_mode,disable_plugins, enable_plugins } = require("./middleware/sys_core");
const path = require("path");
const log4js = require("log4js");
const { exit } = require("process");

const plugins_path = path.normalize(__dirname + "/plugins/");

if (process.env.NODE_ENV === "development") {
  var logger = log4js.getLogger("plugins_manager_debug")
} else {
  var logger = log4js.getLogger("plugins_manager")
}

disable_plugins=Object.values(disable_plugins)
enable_plugins = Object.values(enable_plugins)
try {
  fs.accessSync(plugins_path);
} catch (err) {
  logger.debug("不存在插件目录，正在创建");
  fs.mkdirSync(plugins_path);
}
var files = fs.readdirSync(plugins_path);

switch(app_mode){
  case "mirror":
    disable_plugins.push("mainsite_mode_router")
    break
  case "mix":
    break
  case "main_site":
    disable_plugins.push("static_cache")
    disable_plugins.push("mirror_status")
    break
  default:
    logger.fatal("应用模式配置错误")
    exit()
}
if(files.length>0&&(enable_plugins.length>0||disable_plugins.length>0)){
  
  for(let disable_plugin of disable_plugins){
    for(let files_check_num in files){
      if(files[files_check_num].includes(disable_plugin+".js")) delete files[files_check_num]
  }
}

  for(let files_check_num in files){

    let enable_switch = false
    for(let enable_plugin of enable_plugins){
      if (files[files_check_num].includes(enable_plugin+".js")) enable_switch=true
    }
      if(!enable_switch&&enable_plugins.length>0) delete files[files_check_num]
    
  }
  files = files.filter(Boolean)
}


if (files.length === 0) {
  logger.info("无插件加载");
} else {
  for (let file of files) {
    var single_plugin = path.normalize(plugins_path + file);
    logger.debug(`开始加载插件--${file}`);
    require(single_plugin);
    logger.info(`插件加载成功--${file}`);
  }
}
