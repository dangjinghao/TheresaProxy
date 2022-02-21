const {append_head} = require("../config_init")

function insert_head_tag(body){
    return body.replace("<head>",`<head>${append_head}`)
}

module.exports={
    insert_head_tag
}