const axios = require("axios")
const log4js = require("log4js")
const logger = log4js.getLogger("schedule_handler")
const {getUsersNum}= require("./cache")
const os = require("os")
function send_status(url,the_check_key,mirror_url){
    axios({
        method:'post',
        url:url,
        data:{
            online:getUsersNum(),
            ram_rate:`${(os.totalmem()/1024**3).toFixed(2)}/${((os.totalmem()-os.freemem())/1024**3).toFixed(2)}`,
            mirror_url:mirror_url,
            T_key:the_check_key
        }
    })
    .then((res)=>{
        if(res.status!==200) logger.error("请求错误!")
    })
}

module.exports={
    send_status
}