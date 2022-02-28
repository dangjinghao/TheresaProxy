const express = require("express")
const {on_user_request_list}= require("./plugin_load")
var router =express.Router()
router.all("*",(req,res,next)=>{
    for(let plugin of on_user_request_list){
        var plugin_return_list = plugin(req,res)
        var req = plugin_return_list[0]
        var res = plugin_return_list[1]
    
}
next()
})
module.exports = router