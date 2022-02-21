function DIY_interceptor(res_body,proxyRes,req,res){
    //res_body即responseBuffer经utf-8解码的string 只能是text或html





    return [res_body,proxyRes,req,res]
}
module.exports={
    DIY_interceptor 
}