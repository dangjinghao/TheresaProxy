
const fs = require("fs");
const path = require("path");

const {
  on_system_init_list,
  on_user_require_list,
  on_express_init_list,
  on_proxy_response_list,
  router,
  express,
  on_schedule_list,
  on_express_middleware,
} = require("./sys_core")


class PluginConfig {
  constructor(PluginName) {
    this.PluginName = PluginName;
    let JsonFilePath = path.normalize(
      `${__dirname}/../plugins_config/${PluginName.replace(".js", "")}.json`
    );
    this.JsonConfig = this.GetJsonFile(JsonFilePath);
  }
  get ConfigJson() {
    return this.JsonConfig;
  }
  GetJsonFile(JsonFilePath) {
    try {
      fs.accessSync(JsonFilePath);
    } catch (err) {
      fs.writeFileSync(JsonFilePath, "{}");
    }

    let JsonData = require(JsonFilePath);

    return JsonData;
  }
}


class register {
  on_system_init(func) {
    //func()

    on_system_init_list.push(func)
  }
  on_express_init(func) {
    //func()
    on_express_init_list.push(func)
  }
  on_user_require(func) {
    //func(req,res,next)
    on_user_require_list.push(func)
  }

  on_proxy_response(func) {
    //func(responseBuffer, proxyRes, req, res)
    on_proxy_response_list.push(func)
  }

  on_schedule(list) {
    //["* * * * *",func]
    on_schedule_list.push(list)
  }
  on_middleware(list) {
    on_express_middleware.push(list)
  }

}



module.exports = {
  express,
  router,
  PluginConfig,
  register
};
