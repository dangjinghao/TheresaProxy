console.info("服务初始化中")

const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware")
const { proxy_options } = require("./splugins/proxy_server")
var {
  on_system_init_list,
  on_user_require_list,
  on_express_init_list,
  on_proxy_response_list,
  on_schedule_list,
  app,
  express,
  router,
  listen_port,
} = require("./middleware/sys_core")
const schedule = require("node-schedule")

require("./plugins_manager")
for (let plugin of on_system_init_list) {
  plugin();
}


const log4js = require("log4js");
if (process.env.NODE_ENV === "development") {
  var logger = log4js.getLogger("express_debug")
  var app_logger = log4js.getLogger("app_framework_debug")
} else {
  var logger = log4js.getLogger("express_access")
  var app_logger = log4js.getLogger("app_framework")

}

app.use(
  log4js.connectLogger(logger, {
    level: "auto",
    format: `:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`,
  })
)

app_logger.info("express初始化中")
for (let plugin of on_express_init_list) {
  plugin();
}

app_logger.info("定时计划初始化中")
for(let plugin of on_schedule_list){
  schedule.scheduleJob(plugin[0],plugin[1])
}

router.all("*", (req, res, next) => {
  for (let router_handler of on_user_require_list) {
    var plugin_return_list = router_handler(req, res, next);
    if(!plugin_return_list) return 0;
    var req = plugin_return_list[0]
    var res = plugin_return_list[1]
    var next = plugin_return_list[2]
  }
  next();
});

proxy_options["onProxyRes"] = responseInterceptor(
  async (responseBuffer, proxyRes, req, res) => {
    for (let proxy_interceptor of on_proxy_response_list) {
      var DIY_interceptor_list = proxy_interceptor(
        responseBuffer,
        proxyRes,
        req,
        res
      );
      var responseBuffer = DIY_interceptor_list[0]
      var proxyRes = DIY_interceptor_list[1]
      var req = DIY_interceptor_list[2]
      var res = DIY_interceptor_list[3]
    }
    return responseBuffer
  }
);

app.use(router)
app.use(createProxyMiddleware(proxy_options))
app.listen(listen_port, () => {
  app_logger.info(`服务器已启动在http://127.0.0.1:${listen_port}`)
});
