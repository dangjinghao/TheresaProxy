const { PluginConfig, register, router } = require("../middleware/plugin_devpkg")
const log4js = require("log4js")
const logger = log4js.getLogger("MSMR")
const mcache = require("memory-cache")
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const plugin_config = new PluginConfig("MSMR")
const redirect_mirror_url = plugin_config.ConfigJson["redirect_mirror_url"]
const accepted_keys = plugin_config.ConfigJson["accepted_keys"]
mirror_status = new mcache.Cache()



router.get(redirect_mirror_url, (req, res, next) => {
    var stat_mirror = JSON.parse(all_status())
    var locate_mirror = sort_mirror(stat_mirror)
    res.setHeader("location", locate_mirror).status(301)
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");
    res.send("OK")
    return 0;
})


router.post("/mirror_api/proxy_status", jsonParser, (req, res) => {
    if (accepted_keys.includes(req.body['T_key'])) {
        status_handler(req.body["online"], req.body['ram_rate'], req.body["mirror_url"])
        logger.debug(req.body)
        res.send("ok")
    } else {
        res.status(400).send("error")
    }
    return 0;
})



function status_handler(online, ram_rate, mirror_url) {
    if (!mirror_status.get(mirror_url)) {
        mirror_status.put(mirror_url, online + ',' + ram_rate, 6000000)
    } else {
        mirror_status.del(mirror_url)
        mirror_status.put(mirror_url, online + ',' + ram_rate, 6000000)
    }

}
function all_status() {
    return mirror_status.exportJson()
}
function sort_mirror(all_status_obj) {

    switch (Object.keys(all_status_obj).length) {
        case 0:
            logger.debug("status_obj 为 0")
            return "/"
            break

        case 1:
            logger.debug("status_obj 为 1")
            return Object.keys(all_status_obj)[0]
            break
        default:
            logger.debug("status_obj 为 默认")
            var min_online = all_status_obj[Object.keys(all_status_obj)[0]]["value"].split(",")[0]
            var min_online_url = Object.keys(all_status_obj)[0]
            logger.debug(`取值为${min_online_url}:${min_online}`)
            break
    }
    for (let key in all_status_obj) {
        var online = all_status_obj[key]["value"].split(",")[0]
        var ram_rate = all_status_obj[key]["value"].split(",")[1]
        if (min_online >= online) {
            var min_online_url = key
            var min_online = online
            logger.debug(`取值为${min_online_url}:${min_online}`)
        }
    }
    return min_online_url
}
