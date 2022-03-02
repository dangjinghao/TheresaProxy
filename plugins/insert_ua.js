const {PluginConfig,register} = require("../middleware/plugin_devpkg")
function plugin_main(req,res,next){
    req.headers["user-agent"] =req.headers["user-agent"]+" TheresaProxyUA"
    return [req,res,next]
}
const plugin_register=new register()
plugin_register.on_user_require(plugin_main)
