const mcache = require("memory-cache")
const log4js = require("log4js")
logger = log4js.getLogger("mirror_status")
mirror_status = new mcache.Cache()

function status_handler(online,ram_rate,mirror_url){
    if(!mirror_status.get(mirror_url)){
        mirror_status.put(mirror_url,online+','+ram_rate,6000000)
    }else{
        mirror_status.del(mirror_url)
        mirror_status.put(mirror_url,online+','+ram_rate,6000000)
    }

}
function all_status(){
    return mirror_status.exportJson()
}
function sort_mirror(all_status_obj){
    var min_online = 0
    var min_online_url = ""
    for(let key in all_status_obj){
        var online = all_status_obj[key]["value"].split(",")[0]
        var ram_rate = all_status_obj[key]["value"].split(",")[1]
        if(min_online>=online) {
            var min_online_url=key
            var min_online=online
        }
    }
    return min_online_url
}
module.exports={
    status_handler,
    all_status,
    sort_mirror
}