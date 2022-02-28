const {PluginConfig,register} = require("../middleware/plugin_load")
function plugin_main(req,res){
    req.headers["user-agent"] =req.headers["user-agent"]+" TheresaProxyUA"
    return [req,res]
}
const plugin_register=new register()
plugin_register.on_user_request(plugin_main)
