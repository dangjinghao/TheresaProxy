const {
    proxy_changeOrigin,
    proxy_ws,
    proxy_pathRewrite,
    proxy_selfHandleResponse,
    proxy_target

} = require("../middleware/sys_core")
const proxy_options = {
    target: proxy_target, 
    changeOrigin: proxy_changeOrigin, 
    ws: proxy_ws, 
    pathRewrite: proxy_pathRewrite,
    selfHandleResponse:proxy_selfHandleResponse,
}

module.exports={proxy_options}
