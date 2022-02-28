const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const {proxy_target,proxy_changeOrigin,proxy_ws,proxy_pathRewrite,proxy_selfHandleResponse} = require("./config_init")
const  {StaticCacheSave} = require("./middleware/cache")
const {DIY_interceptor} =require("./middleware/plugins_require")
const log4js = require("log4js")
const logger = log4js.getLogger("proxy_init")

logger.info("初始化proxy中")

const options = {
    target: proxy_target, 
    changeOrigin: proxy_changeOrigin, 
    ws: proxy_ws, 
    pathRewrite: proxy_pathRewrite,
    selfHandleResponse:proxy_selfHandleResponse,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      StaticCacheSave(responseBuffer,req,proxyRes,res)
      
      var DIY_interceptor_list=DIY_interceptor(responseBuffer,proxyRes,req,res)
      responseBuffer = DIY_interceptor_list[0]
      proxyRes = DIY_interceptor_list[1]
      req = DIY_interceptor_list[2]
      res = DIY_interceptor_list[3]

      return responseBuffer
    })
};
  
const ProxyMw = createProxyMiddleware(options);
module.exports={ProxyMw}
  