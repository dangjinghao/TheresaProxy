const express = require("express");
const schedule = require("node-schedule")
const log4js = require("log4js")
const {StaticCacheMiddle, UserCacheMiddle,} = require("./middleware/cache");
const {send_status}=require("./middleware/schedule")
const {express_listen_port,site_mode,local_mirror_url,schedule_time_config,proxy_2_main_site_url,the_check_key,mirror_url} = require("./config_init")
const { ProxyMw } = require("./proxy_init");
const router_plugin_load = require("./middleware/router_plugins_require")
const main_site_router = require("./middleware/main_site_router");

const app = express();

if(process.env.NODE_ENV==="development"){
    var logger = log4js.getLogger("express_debug")
    var schedule_logger = log4js.getLogger("schedule_logger")
}else{
    var logger = log4js.getLogger("express_access")
}

app.use(log4js.connectLogger(logger, {
    level: "auto",
    format:
        `:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`
}))

switch(site_mode){
    case "mix":
        if(proxy_2_main_site_url===""){
            schedule_logger.info(`定时计划为向http://127.0.0.1:${express_listen_port}/mirror_api/proxy_status 发送状态信息`)
            
            schedule.scheduleJob(schedule_time_config,()=>{
                send_status(`http://127.0.0.1:${express_listen_port}/mirror_api/proxy_status`,the_check_key,mirror_url)
            })
    
        }
        else{
            schedule_logger.info(`定时计划为向${proxy_2_main_site_url}/mirror_api/proxy_status 发送状态信息`)

            schedule.scheduleJob(schedule_time_config,()=>{
                send_status(`${proxy_2_main_site_url}/mirror_api/proxy_status`,the_check_key,mirror_url)
            })
        }
        
        app.use(main_site_router)
        app.use(router_plugin_load)
        app.use(local_mirror_url, StaticCacheMiddle);
        app.use(local_mirror_url, UserCacheMiddle);
        app.use(local_mirror_url, ProxyMw);

        break;
    case "mirror":
        if(proxy_2_main_site_url!=="") {
            schedule_logger.info(`定时计划为向${proxy_2_main_site_url}/mirror_api/proxy_status 发送状态信息`)
            schedule.scheduleJob(schedule_time_config,()=>{
                send_status(proxy_2_main_site_url+"/mirror_api/proxy_status",the_check_key,mirror_url)
            })
        }

        app.use(router_plugin_load)
        app.use(local_mirror_url, StaticCacheMiddle);
        app.use(local_mirror_url, UserCacheMiddle);
        app.use(local_mirror_url, ProxyMw);
        break;
    case "main_site":
        app.use(main_site_router)
        break;
    default:
        break;
    }




app.listen(express_listen_port,()=>{
    logger.info("express 启动成功")
});
