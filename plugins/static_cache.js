const {PluginConfig,register} = require("../middleware/plugin_devpkg")
const mcache = require("memory-cache")
const log4js = require("log4js")
const fs = require("fs")
const path = require("path")
const md5 =require("js-md5")
const SCache_config = new PluginConfig("static_cache")
const StaticMCache = new mcache.Cache()

const cache_tmp_url = "./cache_tmp"
const static_buffer_time = SCache_config.ConfigJson["static_buffer_time"]

if(process.env.NODE_ENV==="development"){
    var logger = log4js.getLogger("cache_debug")
}else{
    var logger = log4js.getLogger("cache")
}

logger.info("清理缓存文件中")
try {
  fs.accessSync(cache_tmp_url)
} catch (err) {
  logger.debug("缓存文件夹不存在，准备创建")
  fs.mkdirSync(cache_tmp_url)
}

fs.readdirSync(cache_tmp_url).forEach((file_name) => {
  logger.debug(`清理缓存文件${file_name}`)
  fs.unlink("./cache_tmp/" + file_name, (err) => {
    if (err) logger.error(`经理缓存失败${err}`)
  })
})
logger.info("缓存清理完毕")

function static_cache_check(req, res, next) {
  //from https://github.com/chimurai/http-proxy-middleware/discussions/561#discussioncomment-632227
  if (req.method !== "GET") return [req, res, next]
  let key = req.originalUrl || req.url
  let cachedBody = StaticMCache.get(key)
  if (cachedBody) {
    logger.debug("读取本地文件 ===> ", key)
    const md5_name =StaticMCache.get(key)
    const cache_tmp_path = path.resolve(__dirname,"..")
    const file_url = path.normalize(`${cache_tmp_path}/cache_tmp/${md5_name}`)
    res.sendFile(file_url)
    return false
    
  }else{
    return [req, res, next]
  }
}

function static_cache_save(responseBuffer, proxyRes,req,res) {
    let key = req.originalUrl || req.url
    if(typeof proxyRes.headers["content-type"]==="undefined"||proxyRes.headers["content-type"].includes("json")){
      return [responseBuffer, proxyRes,req,res]
    }
    //var buffer = Buffer.from(,'utf8')
    var md5_name = md5(key)
    var file_ext = path.parse(key).ext
    if(file_ext===""){
      file_ext = ".html"
    }
    md5_name = md5_name+file_ext

    StaticMCache.put(key, md5_name, static_buffer_time,(key,value)=>{
      fs.unlink(path.normalize(`${__dirname}/../cache_tmp/${value}`),(err)=>{if(err) logger.err(`删除缓存错误${err}`)})
      logger.debug(`${key}缓存已过期并删除`)
    })
    logger.debug(`成功保存文件索引${key}:${md5_name},过期时间:${static_buffer_time/60000}m`)
    //save file in there
    const cache_tmp_path = path.resolve(__dirname,"..")
    const file_url = path.normalize(`${cache_tmp_path}/cache_tmp/${md5_name}`)
    file_auto_save(file_url,responseBuffer)
    logger.debug("保存本地文件 <=== ", file_url)

    return [responseBuffer, proxyRes,req,res]
    
    
}

function file_auto_save(file_url,content_buffer){
  var parse_url = path.parse(file_url)
  fs.mkdir(parse_url.dir,{recursive:true},(err)=>{
    if(err)  logger.error("创建文件夹错误"+err)
  })

  fs.writeFile(file_url,content_buffer,(err)=>{
    if(err) logger.error("文件写入错误"+err)
  })

}

var plugin_register = new register()
plugin_register.on_user_require(static_cache_check)
plugin_register.on_proxy_response(static_cache_save)