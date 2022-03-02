const log4js = require("log4js")
const config = require("config")
const express = require("express")
const router = express.Router()

const app_log = config.get("logs.app")
const access_log = config.get("logs.access")
const listen_port = config.get("listen_port")
const proxy_target = config.get("proxy.target");
const proxy_changeOrigin = config.get("proxy.changeOrigin");
const proxy_ws = config.get("proxy.ws");
const proxy_pathRewrite = config.get("proxy.pathRewrite");
const proxy_selfHandleResponse = config.get("proxy.selfHandleResponse")
const disable_plugins = config.get("disable_plugins")
const enable_plugins = config.get("enable_plugins")
const app_mode = config.get("mode")
app = express()

log4js.configure({
    appenders: {
      file: { type: "file", filename: app_log },
      console: { type: "console" },
      access: { type: "file", filename: access_log },
    },
    categories: {
      default: { appenders: ["console"], level: "debug" },
      plugins_manager: { appenders: ["file", "console"], level: "info" },
      MSMR: { appenders: ["console"], level: "info" },
      mirror_status: { appenders: ["console"], level: "info" },
      express_access: { appenders: ["access"], level: "info" },
      cache: { appenders: ["file", "console"], level: "info" },
      app_framework: { appenders: ["file", "console"], level: "info" },
      
    },
  });

//在系统初始化时候进行
var on_system_init_list = []

//在express初始化之前进行
var on_express_init_list = []

//添加定时任务
var on_schedule_list = []
//在用户请求时处理
var on_user_require_list = []

//在反代网站响应后处理
var on_proxy_response_list = []


module.exports={
    on_system_init_list,
    on_user_require_list,
    on_express_init_list,
    on_proxy_response_list,
    on_schedule_list,
    app,router,express,
    listen_port,
    proxy_changeOrigin,
    proxy_ws,
    proxy_pathRewrite,
    proxy_selfHandleResponse,
    proxy_target,
    disable_plugins,
    enable_plugins,
    app_mode
  
}