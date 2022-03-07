console.info("服务初始化中")

const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware")
var {
  on_system_init_list,
  on_user_require_list,
  on_express_init_list,
  on_proxy_response_list,
  on_schedule_list,
  on_express_middleware,
  app,
  express,
  proxy_mount_url,
  proxy_options,
  router,
  listen_port,
  app_mode
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
for (let plugin of on_schedule_list) {
  schedule.scheduleJob(plugin[0], plugin[1])
}

router.all("*", (req, res, next) => {
  for (let router_handler of on_user_require_list) {
    var plugin_return_list = router_handler(req, res, next);
    if (!plugin_return_list) return 0;
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
app_logger.info("挂载路由")
app.use(router)

app_logger.info("加载中间件")
//将反代中间件加入on_express_middlerware钩子中
if (app_mode !== "main_site") on_express_middleware.push([proxy_mount_url, createProxyMiddleware(proxy_options)])

for (let plugin of on_express_middleware) {
  if (plugin[1] !== undefined) {
    app.use(plugin[0], plugin[1])
  }
  else {
    app.use(plugin[0])
  }
}
app.listen(listen_port, () => {
  app_logger.info(`服务器已启动在http://localhost:${listen_port}`)
});
