const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const {proxy_target,proxy_changeOrigin,proxy_ws,proxy_pathRewrite} = require("./config_init")
const{insert_head_tag}=require("./middleware/element_insert")
const  {StaticCacheSave} = require("./middleware/cache")
const {DIY_interceptor} =require("./DIY")
const options = {
    target: proxy_target, 
    changeOrigin: proxy_changeOrigin, 
    ws: proxy_ws, 
    pathRewrite: proxy_pathRewrite,
    selfHandleResponse:true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      StaticCacheSave(responseBuffer,req,proxyRes,res)
      
      DIY_interceptor_list=DIY_interceptor(responseBuffer,proxyRes,req,res)
      responseBuffer = DIY_interceptor_list[0]
      proxyRes = DIY_interceptor_list[1]
      req = DIY_interceptor_list[2]
      res = DIY_interceptor_list[3]

      if(typeof proxyRes.headers['content-type']==="undefined"){
        return responseBuffer
      }
      if(proxyRes.headers['content-type'].includes("image")){
        return responseBuffer
      }else if(proxyRes.headers['content-type'].includes("text")||proxyRes.headers['content-type'].includes("javascript")||proxyRes.headers['content-type'].includes("css")||proxyRes.headers['content-type'].includes("html")){
        
        var res_body = responseBuffer.toString('utf8')

        return insert_head_tag(res_body)
      }
      else{
        return responseBuffer
      }

    })
};
  
const ProxyMw = createProxyMiddleware(options);
module.exports={ProxyMw}
  