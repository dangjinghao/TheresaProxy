const {PluginConfig,register} = require("../middleware/plugin_devpkg")
const mcache = require("memory-cache")
const log4js = require("log4js")
const os = require("os")
var MS_config = new PluginConfig("mirror_status")
const logger = log4js.getLogger("mirror_status")
const axios = require("axios")
const url = MS_config.ConfigJson["main_site_url"]
const mirror_url = MS_config.ConfigJson["carried_mirror_url"]
const the_check_key = MS_config.ConfigJson["carried_check_key"]
const user_ip_check_time = MS_config.ConfigJson["user_ip_save_time"]
OnlineUserMCache = new mcache.Cache()
function send_status(){
    axios({
        method:'post',
        url:url,
        data:{
            online:getUsersNum(),
            ram_rate:`${((os.totalmem()-os.freemem())/1024**3).toFixed(2)}/${(os.totalmem()/1024**3).toFixed(2)}`,
            mirror_url:mirror_url,
            T_key:the_check_key
        }
    })
    .then((res)=>{
        if(res.status!==200) logger.error("请求错误!")
    })
}

function getUsersNum() {
    return OnlineUserMCache.size()
  }
  
function getUserTime(ip) {
    var UserIp = OnlineUserMCache.get(ip);
    return UserIp;
  }
  
function UserMCache(ip, time) {
    var UserIp = OnlineUserMCache.get(ip)
  
    if (!UserIp) OnlineUserMCache.put(ip, time,user_ip_check_time,(key,value)=>{
    logger.debug(`${key}用户ip已过期并删除`)
    })
    else return UserIp
}

function UserCacheMiddle(responseBuffer, proxyRes, req, res) {
    const now = new Date();
    if (!getUserTime(req.ip)) {
      
      logger.debug(`将 ${req.ip}:${now}放入缓存`)
      UserMCache(req.ip,now );
    }else{
      logger.debug(`${req.ip}:${now} 已在缓存中`)
    }
    return [responseBuffer, proxyRes, req, res]
  }

var plugin_register = new register()
if(the_check_key&&mirror_url) plugin_register.on_schedule(["* * * * * *",send_status])
else logger.debug("未配置请求项，跳过注册定时计划")
plugin_register.on_proxy_response(UserCacheMiddle)
