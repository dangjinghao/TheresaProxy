const { PluginConfig, register } = require("../middleware/plugin_devpkg")
var IHE_Config = new PluginConfig("insert_head_element")

function plugin_main(responseBuffer, proxyRes, req, res) {
  if (typeof proxyRes.headers["content-type"] !== "undefined") {
    if (!proxyRes.headers["content-type"].includes("image")) {
      if (
        proxyRes.headers["content-type"].includes("text") ||
        proxyRes.headers["content-type"].includes("javascript") ||
        proxyRes.headers["content-type"].includes("css") ||
        proxyRes.headers["content-type"].includes("html")
      ) {
        const res_body = responseBuffer.toString("utf8");

        responseBuffer = res_body.replace("<head>", "<head>" + IHE_Config.ConfigJson["text"])

      }
    }
  }
  return [responseBuffer, proxyRes, req, res]
}
const plugin_register = new register()
plugin_register.on_proxy_response(plugin_main)

