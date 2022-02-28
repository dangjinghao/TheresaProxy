const config = require("config");
const log4js = require("log4js");
const fs = require("fs");

const site_mode = config.get("site_mode");
const express_listen_port = config.get("express_listen_port");

const app_logs = config.get("logs.app");
const express_access_logs = config.get("logs.access");

const proxy_target = config.get("proxy.middleware_config.target");
const proxy_changeOrigin = config.get("proxy.middleware_config.changeOrigin");
const proxy_ws = config.get("proxy.middleware_config.ws");
const proxy_pathRewrite = config.get("proxy.middleware_config.pathRewrite");
const proxy_selfHandleResponse = config.get("proxy.middleware_config.selfHandleResponse")

const static_buffer_time = config.get("proxy.cache.static_buffer_time");
const user_ip_check_time = config.get("proxy.cache.user_ip_check_time");

const local_mirror_url = config.get("proxy.local_mirror_url");
const proxy_2_main_site_url = config.get("proxy.to_main_site_url");

const schedule_time_config = config.get("proxy.schedule.time_config");
const the_check_key = config.get("proxy.schedule.the_key");
const mirror_url = config.get("proxy.schedule.mirror_url");

const redirect_mirror_url = config.get("main_site.redirect_mirror_url");
const accepted_keys = config.get("main_site.accepted_keys");

log4js.configure({
  appenders: {
    file: { type: "file", filename: app_logs },
    console: { type: "console" },
    access: { type: "file", filename: express_access_logs },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },

    express_access: { appenders: ["access"], level: "info" },
    cache: { appenders: ["file", "console"], level: "info" },
    config_init: { appenders: ["file", "console"], level: "info" },
    schedule_logger:{ appenders: ["file", "console"], level: "info" },
  },
});

if (process.env.NODE_ENV === "development") {
  var logger = log4js.getLogger("config_init_debug");
} else {
  var logger = log4js.getLogger("config_init");
}

logger.info(`网站模式为${site_mode}`);
logger.info(`express监听端口为${express_listen_port}`);

switch (site_mode) {
  case "mix":
    logger.info(`重定向链接为${redirect_mirror_url}`);
    logger.info(`反代站点为:${proxy_target}`);
    logger.info(`静态资源缓存时间为${static_buffer_time / 60000}min`);
    logger.info(`服务器用户访问检测时间为${user_ip_check_time / 60000}min`);
    logger.info(`访问${local_mirror_url}以进入镜像站点`);
    
    if (proxy_2_main_site_url !== "") {
      logger.info(`镜像站的主站的url为${proxy_2_main_site_url}`);
      logger.info(`镜像站的定期计划配置为${schedule_time_config}`);
      logger.info(`镜像站点key为${the_check_key}`);
      logger.info(`镜像站的url为${mirror_url}`);
    }

    logger.debug(`proxy_changeOrigin:${proxy_changeOrigin}`);
    logger.debug(`proxy_ws:${proxy_ws}`);
    logger.debug(`pathRewrite:${proxy_pathRewrite}`);
    logger.debug(`selfHandleResponse:${proxy_selfHandleResponse}`)

    break;
  case "mirror":
    logger.info(`反代站点为:${proxy_target}`);
    logger.info(`静态资源缓存时间为${static_buffer_time / 60000}min`);
    logger.info(`服务器用户访问检测时间为${user_ip_check_time / 60000}min`);
    logger.info(`访问${local_mirror_url}以进入镜像站点`);
    
    if (proxy_2_main_site_url !== "") {
      logger.info(`镜像站的主站的url为${proxy_2_main_site_url}`);
      logger.info(`镜像站的定期计划配置为${schedule_time_config}`);
      logger.info(`镜像站点key为${the_check_key}`);
      logger.info(`镜像站的url为${mirror_url}`);
    }

    logger.debug(`proxy_changeOrigin:${proxy_changeOrigin}`);
    logger.debug(`proxy_ws:${proxy_ws}`);
    logger.debug(`pathRewrite:${proxy_pathRewrite}`);
    logger.debug(`selfHandleResponse:${proxy_selfHandleResponse}`)

    break;
  case "main_site":
    logger.info(`重定向链接为${redirect_mirror_url}`);
    logger.info(`主站接受的key为${accepted_keys}`);

    break;
  default:
    logger.error("无法识别的网站模式,请重新填写");
    throw `site_mode配置出错:${site_mode}`;
}

logger.info("配置读取完毕");
logger.info("清理缓存文件中");
try {
  fs.accessSync("./cache_tmp");
} catch (err) {
  logger.debug("缓存文件夹不存在，准备创建")
  fs.mkdirSync("./cache_tmp");
}

fs.readdirSync("./cache_tmp").forEach((file_name) => {
  logger.debug(`清理缓存文件${file_name}`)
  fs.unlink("./cache_tmp/" + file_name, (err) => {
    if (err) logger.error(`经理缓存失败${err}`);
  });
});
logger.info("缓存清理完毕");
module.exports = {
  proxy_target,
  static_buffer_time,
  user_ip_check_time,
  express_listen_port,
  proxy_changeOrigin,
  proxy_ws,
  proxy_pathRewrite,
  site_mode,
  local_mirror_url,
  redirect_mirror_url,
  proxy_selfHandleResponse,
  proxy_2_main_site_url,
  the_check_key,
  accepted_keys,
  schedule_time_config,
  mirror_url,
};
