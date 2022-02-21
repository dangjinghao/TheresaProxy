const express = require("express")
const {redirect_mirror_url,accepted_keys} = require("./config_init")
const log4js = require("log4js")
const bodyParser=require("body-parser");
const {status_handler,all_status,sort_mirror}=require("./middleware/mirror_status")
var router =express.Router()
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const logger = log4js.getLogger("express_router")


router.get(redirect_mirror_url,(req,res,next)=>{
    var stat_mirror = JSON.parse(all_status())
    //res.setHeader("Location",Object.keys(stat_mirror)[0]).status(301)
    var te = sort_mirror(stat_mirror)
    res.send(te)
    return 0;
})


router.post("/mirror_api/proxy_status",jsonParser,(req,res)=>{
    logger.debug(req.body)
    if(accepted_keys.includes(req.body['T_key'])){
        status_handler(req.body["online"],req.body['ram_rate'],req.body["mirror_url"])

        res.send("ok")  
    }else{
        res.status(400).send("error")
    }
    return 0;
})
module.exports = router