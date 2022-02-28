const mcache = require("memory-cache");
const log4js = require("log4js")
const fs = require("fs")
const path = require("path")
const md5 =require("js-md5")

const {static_buffer_time,user_ip_check_time} = require("../config_init");
var StaticMCache = new mcache.Cache();
var OnlineUserMCache = new mcache.Cache();

if(process.env.NODE_ENV==="development"){
    var logger = log4js.getLogger("cache_debug")
}else{
    var logger = log4js.getLogger("cache")
}

function StaticCacheMiddle(req, res, next) {
  //from https://github.com/chimurai/http-proxy-middleware/discussions/561#discussioncomment-632227
  if (req.method !== "GET") return next();
  let key = req.originalUrl || req.url;
  let cachedBody = StaticMCache.get(key);
  if (cachedBody) {
    logger.debug("读取本地文件 ===> ", key)
    const md5_name =StaticMCache.get(key)
    const cache_tmp_path = path.resolve(__dirname,"..")
    const file_url = path.normalize(`${cache_tmp_path}/cache_tmp/${md5_name}`)
    res.sendFile(file_url);
    return 0;
    
  }else{
    next();
  }
}

function StaticCacheSave(responseBuffer, req,proxyRes,res) {
    let key = req.originalUrl || req.url;
    if(typeof proxyRes.headers["content-type"]==="undefined"||proxyRes.headers["content-type"].includes("json")){
      return 0;
    }
    //var buffer = Buffer.from(,'utf8');
    var md5_name = md5(key)
    var file_ext = path.parse(key).ext
    if(file_ext===""){
      file_ext = ".html"
    }
    md5_name = md5_name+file_ext

    StaticMCache.put(key, md5_name, static_buffer_time,(key,value)=>{
      fs.unlink(path.normalize(`${__dirname}/../cache_tmp/${value}`),(err)=>{if(err) logger.err(`删除缓存错误${err}`)});
      logger.debug(`${key}缓存已过期并删除`);
    });
    logger.debug(`保存文件索引${key}:${md5_name},过期时间:${static_buffer_time/60000}m`);
    //save file in there
    const cache_tmp_path = path.resolve(__dirname,"..")
    const file_url = path.normalize(`${cache_tmp_path}/cache_tmp/${md5_name}`)
    file_auto_save(file_url,responseBuffer)
    logger.debug("保存本地文件 <=== ", file_url);

    
    
}
function UserMCache(ip, time) {
  var UserIp = OnlineUserMCache.get(ip);

  if (!UserIp) OnlineUserMCache.put(ip, time,user_ip_check_time,(key,value)=>{
  logger.debug(`${key}用户ip已过期并删除`);
  });
  else return UserIp;
}

function getUserTime(ip) {
  var UserIp = OnlineUserMCache.get(ip);
  return UserIp;
}

function getUsersNum() {
  return OnlineUserMCache.size();
}

function UserCacheMiddle(req, res, next) {
  const now = new Date();
  if (!getUserTime(req.ip)) {
    
    logger.debug(`Put ${req.ip}:${now} in cache`)
    UserMCache(req.ip,now );
  }else{
    logger.debug(`${req.ip}:${now} has in cache`)
  }
  next();
}

function file_auto_save(file_url,content_buffer){
  var parse_url = path.parse(file_url);
  fs.mkdir(parse_url.dir,{recursive:true},(err)=>{
    if(err)  logger.error("创建文件夹错误"+err)
  })

  fs.writeFile(file_url,content_buffer,(err)=>{
    if(err) logger.error("文件写入错误"+err)
  })

}

module.exports = {
  StaticCacheSave,
  UserCacheMiddle,
  getUsersNum,
  StaticCacheMiddle,
};
