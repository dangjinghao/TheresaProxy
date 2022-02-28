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
    var locate_mirror = sort_mirror(stat_mirror)
    res.setHeader("location",locate_mirror).status(301)
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");
    res.send("OK")
    return 0;
})


router.post("/mirror_api/proxy_status",jsonParser,(req,res)=>{
    if(accepted_keys.includes(req.body['T_key'])){
        status_handler(req.body["online"],req.body['ram_rate'],req.body["mirror_url"])

        res.send("ok")  
    }else{
        res.status(400).send("error")
    }
    return 0;
})
module.exports = router