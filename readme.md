# TheresaProxy

多反代节点重定向实现 响应体修改 反向代理资源缓存 开箱即用

## TheresaProxy是什么

### 功能

- 基于node的express框架和其中间件`http-proxy-middleware`实现的反向代理程序。

- 允许设置主站和镜像站，主站会接收镜像站的状态信息并根据信息选择最佳镜像站以跳转。

- 响应体修改

- 将代理资源文件缓存到本地，减少镜像站流量损耗，加快访问速度。

  

### 开发目标

为了快速构建反代站点并增添部分自己需要的自定义功能而开发。

### 开发状态

已对外发布初版。

### 建议版本

官网安装的最新版nodejs套件

## 快速开始

这是最快速的成功构建`TheresaProxy`(以下简称TP)的方式

1. 使用`git clone`克隆本库

2. 安装`nodejs`

3. 进入本库根目录

4. 运行`npm install`补全项目依赖

5. 修改`config/production.json`文件，将其中的target配置项填写需要代理的站点地址，例如`https://archiveofourown.org/`

6. 使用`npm run serve`运行程序（如果是windows系统请使用`npm run win_serve`）

7. 查看端口，开始正常使用反向代理网站。

## 配置项说明

```json
{
  "site_mode": "mirror",//运行模式，分为mix/mirror/main_site
  "express_listen_port": 3011,//express的监听端口，也即服务器运行端口
  "logs": {
    "app": "./logs/app.log",//项目运行日志
    "access": "./logs/access.log" //express的access日志
  },
  "proxy": {
    "middleware_config":{
        "target": "",//需要反向代理的网站，例如http(s)://example.com/
        "changeOrigin": true,
        "ws": true,
        "pathRewrite": {}    
    },
    "cache": {
      "static_buffer_time": 600000,//静态资源在本地的缓存时间,单位ms
      "user_ip_check_time": 600000 //用户记录与检测时间，用于在节点向主站发送信息时主站对节点负载的推算
    },
    "rewrite_body": {
      "head": ""//向响应体的head标签中插入的文本
    },
    "local_mirror_url":"/",//反向服务器在本地的挂载路径
    "to_main_site_url":"",//镜像的主站路径，用于镜像站和主站通信时
    "schedule":{//定时任务
      "time_config":"1 * * * * *",//Cron风格定时器
      "the_key":"",//镜像站与主站通信时传输的key，用于身份验证时与accepted_keys中的元素进行匹配
      "mirror_url":"" //镜像站传输自己的url用于主站重定向url
    }
  },
  
  "main_site":{
    "redirect_mirror_url":"/into_mirror",//main_site和mix模式下访问后用于重定向的路径
    "accepted_keys":[""] //main_site和mix模式下接收mirror传输的状态信息时需要包含的the_key
  }
}

```

- 如有需要，在`proxy.middleware_config`中的后三项配置可查看[chimurai/http-proxy-middleware: The one-liner node.js http-proxy middleware for connect, express and browser-sync (github.com)](https://github.com/chimurai/http-proxy-middleware)进行配置
- `rewrite_body.head`中插入的文本为html文本，例如"head": "`<script>alert("test")</script>`"会在页面加载完成后弹出alert
- `schedule.mirror_url`建议使用随机数，或者滚键盘弄出来一串
- `proxy.local_mirror_url`可用于当你的服务器除了负责反向代理还需要负责别的业务的时候
- `to_main_site_url`配置项在结尾不能加`/`，例如只能是`http://127.0.0.1:3000`此问题为bug

## bug清单

~~还没开始找~~

希望有开发者协助

## TODOLIST

- 完善配置文件的编写
- 负载均衡完善到可较好使用的程度
- 修改logger，为每个功能划分logger便于追查bug
- 添加新功能
  - 定期检查缓存
  - 定期存储人数数据用于统计镜像站访问次数
  - 实现cpu占用率计算
  - 自动生成T_key不用滚键盘

##  `所谓`高阶应用

### 负载均衡

假设有三台主机，其中两台模式为mirror,一台为mix，三台主机配置文件如下

```json
{//mix模式，作为主站和一个镜像站 http://m3.example.com:3011/m1访问镜像站
  "site_mode": "mix",
  "express_listen_port": 3011,
  "logs": {
    "app": "./logs/app.log",
    "access": "./logs/access.log"
  },
  "proxy": {
    "middleware_config":{
        "target": "https://example.com",
        "changeOrigin": true,
        "ws": true,
        "pathRewrite": {}    
    },
    "cache": {
      "static_buffer_time": 600000,
      "user_ip_check_time": 600000
    },
    "rewrite_body": {
      "head": ""
    },
    "local_mirror_url":"/m1",
    "to_main_site_url":"http://m1.example.com:3011",
    "schedule":{
      "time_config":"1 * * * * *",
      "the_key":"asdfkj;lfiojsdfkl",
      "mirror_url":"http://m1.example.com:3011/m1"
    }
  },
  
  "main_site":{
    "redirect_mirror_url":"/into_mirror",
    "accepted_keys":["asdfkj;lfiojsdfkl","asdssssawrefk","ahfghrsdf2423r"]
  }
}

```

```json
{//作为一个镜像站节点 http://m3.example.com:3011/m2访问镜像站
  "site_mode": "mirror",
  "express_listen_port": 3011,
  "logs": {
    "app": "./logs/app.log",
    "access": "./logs/access.log"
  },
  "proxy": {
    "middleware_config":{
        "target": "https://example.com",
        "changeOrigin": true,
        "ws": true,
        "pathRewrite": {}    
    },
    "cache": {
      "static_buffer_time": 600000,
      "user_ip_check_time": 600000
    },
    "rewrite_body": {
      "head": ""
    },
    "local_mirror_url":"/m2",
    "to_main_site_url":"http://m1.example.com:3011",
    "schedule":{
      "time_config":"1 * * * * *",
      "the_key":"asdssssawrefk",
      "mirror_url":"http://m2.example.com:3011/m2"
    }
  },
  
  "main_site":{
    "redirect_mirror_url":"/into_mirror",
    "accepted_keys":[""]
  }
}

```

```json
{//作为另一个镜像站节点 http://m3.example.com:3011/m3访问镜像站
  "site_mode": "mirror",
  "express_listen_port": 3011,
  "logs": {
    "app": "./logs/app.log",
    "access": "./logs/access.log"
  },
  "proxy": {
    "middleware_config":{
        "target": "https://example.com",
        "changeOrigin": true,
        "ws": true,
        "pathRewrite": {}    
    },
    "cache": {
      "static_buffer_time": 600000,
      "user_ip_check_time": 600000
    },
    "rewrite_body": {
      "head": ""
    },
    "local_mirror_url":"/m3",
    "to_main_site_url":"http://m1.example.com:3011",
    "schedule":{
      "time_config":"1 * * * * *",
      "the_key":"ahfghrsdf2423r",
      "mirror_url":"http://m3.example.com:3011/m3"
    }
  },
  
  "main_site":{
    "redirect_mirror_url":"/into_mirror",
    "accepted_keys":[""]
  }
}

```

此时配置完成了三台镜像和一台主站，镜像会定期发送自身状态给主站，此时访问主站的重定向url`http://m1.example.com:3011/into_mirror`主站会计算之前通信过的镜像站的访问ip数来选择最佳镜像站，进而将访问者重定向到对应站点

~~由于条件限制，目前此功能仅有理论测试~~



### 向响应体插入数据与DIY.js

#### rewrite_body.head

通过此配置可向head标签中插入数据。

#### DIY.js

此模块中的DIY_interceptor函数会被使用，传入的四个参数可以查看[chimurai/http-proxy-middleware: The one-liner node.js http-proxy middleware for connect, express and browser-sync (github.com)](https://github.com/chimurai/http-proxy-middleware#intercept-and-manipulate-responses)

**注意，此函数的加载位于插入head标签之前，且所有响应体都会经过此函数的一次处理**

如果开发者并不熟悉此处的开发，请尽量使用配置文件的head标签插入数据来实现，防止二进制数据出错等问题

~~毕竟我也不太会，所以此功能依旧没有经过严格测试~~

