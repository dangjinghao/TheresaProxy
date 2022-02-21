const express = require("express");
const schedule = require("node-schedule")
const log4js = require("log4js")
const {StaticCacheMiddle, UserCacheMiddle,} = require("./middleware/cache");
const {send_status}=require("./middleware/schedule")
const {express_listen_port,site_mode,local_mirror_url,schedule_time_config,proxy_2_main_site_url,the_check_key,mirror_url} = require("./config_init")
const { ProxyMw } = require("./proxy_init");
const main_site_router = require("./main_site_router");

const app = express();

if(process.env.NODE_ENV==="development"){
    var logger = log4js.getLogger("express_debug")
    
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
        schedule.scheduleJob(schedule_time_config,()=>{
            send_status(proxy_2_main_site_url+"/mirror_api/proxy_status",the_check_key,mirror_url)
        })
        
        app.use(main_site_router)
        app.use(local_mirror_url, StaticCacheMiddle);
        app.use(local_mirror_url, UserCacheMiddle);
        app.use(local_mirror_url, ProxyMw);

        break;
    case "mirror":
        schedule.scheduleJob(schedule_time_config,()=>{
            send_status(proxy_2_main_site_url+"/mirror_api/proxy_status",the_check_key,mirror_url)
        })

        app.use(local_mirror_url, StaticCacheMiddle);
        app.use(local_mirror_url, UserCacheMiddle);
        app.use(local_mirror_url, ProxyMw);
        break;
    case "main_site":
        //加载路由文件
        break;
    default:
        break;
    }




app.listen(express_listen_port,()=>{
    logger.info("express start successfully")
});
