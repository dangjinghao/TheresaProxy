# TheresaProxy

多反代节点重定向实现 响应体修改 可拓展插件系统 反向代理资源缓存 开箱即用

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

6. 使用`npm run serve`运行程序（如果是windows系统请使用`npm run win_serve`）（依旧推荐在linux发行版中部署）

7. 查看端口，开始正常使用反向代理网站。

## 配置项说明

```json
{//位于config/production.json
    "mode": "mix",//程序运行模式
    "listen_port": 3011,//express监听端口
    "logs": {
      "app": "logs/app.log",
      "access": "logs/access.log"
    },
    "disable_plugins": [],//禁止加载的插件
    "enable_plugins": [""],//允许运行的插件
    "proxy": {
      "target": "",//代理网站
      "changeOrigin": true,//中间件配置项
      "ws": true,
      "pathRewrite": {},
      "selfHandleResponse": true
    }
  }
```

- 如有需要，在`proxy`中的后三项配置可查看[chimurai/http-proxy-middleware: The one-liner node.js http-proxy middleware for connect, express and browser-sync (github.com)](https://github.com/chimurai/http-proxy-middleware)进行配置
- 其他配置已分离至插件系统中，在`plugins_config`文件夹中进行对应插件配置。

## bug清单

~~还没开始找~~

希望有开发者协助

## TODOLIST

- [x] 完善配置文件的编写

- [x] 将`DIY.js`修改成较为规范的插件导入方式

- [x] 负载均衡完善到可较好使用的程度

- [x] 修改logger，为每个功能划分logger便于追查bug

- [x] 实现插件在获取响应前的处理

- [ ] 添加新功能
  - 定期检查缓存
  - 定期存储人数数据用于统计镜像站访问次数
  - 实现cpu占用率计算
  - 自动生成T_key不用滚键盘

  

##  `所谓`高阶应用

### 静态资源缓存

在`mix`与`mirror`的配置中，`static_cache`插件会被加载，存在一个插件配置，位于`/plugins_config/static_cache.json`文件

```json
{
    "static_buffer_time": 6000000//单位为ms
}
```

### 修改响应体

在`mix`和`mirror`的配置中，`insert_head_element`插件被加载，存在一个插件配置，位于`/plugins/insert_head_element.json`文件

```json
{
    "text":""//在响应体的头标签中插入文本
}
```

### 负载均衡

在`mix`和`mirror`的配置中，`mirror_status`插件被加载，存在一个插件配置，位于`/plugins/mirror_status.json`文件

```json
{
    "user_ip_save_time":600000,//访问ip访问缓存时间
    "carried_mirror_url":"http://127.0.0.1:3011",//
    "carried_check_key": "",//携带key，用于验证身份
    "main_site_url":"http://127.0.0.1:3011/mirror_api/proxy_status"
}
```

在`mix`和`mirror`的配置中，`mainsite_mode_router`插件被加载，存在一个插件配置，位于`/plugins/MSMR.json`文件

```json
{
    "redirect_mirror_url":"/into_mirror",//用户跳转链接
    "accepted_keys":[]//接受的keys
}
```

例如：

存在三台设备，模式分别为mirror*2和mix

mix模式的主机(v1.example.com)配置文件为

```json
{//config/production.json
  "mode": "mix",
  "listen_port": 3011,
  "logs": {
    "app": "logs/app.log",
    "access": "logs/access.log"
  },
  "disable_plugins": [],
  "enable_plugins": [""],
  "proxy": {
    "target": "https://example.com",
    "changeOrigin": true,
    "ws": true,
    "pathRewrite": {},
    "selfHandleResponse": true
  }
}

```

```json
{//plugins_config/MSMR.json
    "redirect_mirror_url":"/into_mirror",
    "accepted_keys":["1*s&^","123ewq","ffffdtrt"]
}
```

```json
{//plugins/mirror_status.json
    "user_ip_save_time":600000,
    "carried_mirror_url":"http://v1.example.com",
    "carried_check_key": "1*s&^",
    "main_site_url":"http://v1.example.com/mirror_api/proxy_status"
}
```



mirror模式的主机(v2,v3.example.com)配置文件为

```json
{//config/production.json
  "mode": "mirror",
  "listen_port": 3011,
  "logs": {
    "app": "logs/app.log",
    "access": "logs/access.log"
  },
  "disable_plugins": [],
  "enable_plugins": [""],
  "proxy": {
    "target": "https://example.com",
    "changeOrigin": true,
    "ws": true,
    "pathRewrite": {},
    "selfHandleResponse": true
  }
}

```

```json
{//v2//plugins/mirror_status.json
    "user_ip_save_time":600000,
    "carried_mirror_url":"http://v1.example.com",
    "carried_check_key": "ffffdtrt",
    "main_site_url":"http://v1.example.com/mirror_api/proxy_status"
}
```

```json
{//v3//plugins/mirror_status.json
    "user_ip_save_time":600000,
    "carried_mirror_url":"http://v1.example.com",
    "carried_check_key": "123ewq",
    "main_site_url":"http://v1.example.com/mirror_api/proxy_status"
}
```

此时包括v1站点在内，三个站点都会向v1站点发送系统状态（单位时间内ip访问个数，内存占用）

随后访问`http://v1.example.com/into_mirror`，站点会利用301重定向来为访问者重定向到最佳站点（最少ip连接数）。

## 插件编写

从0.1.7版本开始，我设计了一个插件管理系统，暴露了数个钩子，并允许用户在这几个固定的运行阶段挂载函数运行。

同时导出了route对象，可以允许插件自行在对应路径使用路由功能。

### Hooks

- on_system_init(func)

​		在整个程序初始化时运行func()

- on_schedule(list)

​		系统会利用`node-schedule`模块的`scheduleJob`方法进行初始化

​		例:on_schedule(["* * * * * *",func])

- on_express_init(func

​		在express初始化时候运行func()

- on_user_require

​		在请求发起时处理请求(req,res,next)

- on_proxy_response

​		在反代站点响应请求后对响应进行处理(responseBuffer, proxyRes,req,res)

*在plugins文件夹中的几个插件可作为示例查看*

### 注册插件

```jS
//plugins/EGplugin.js

const {PluginConfig,register} = require("../middleware/plugin_devpkg")
//在插件中引入register类与插件配置类
const log4js = require("log4js")
const logger = log4js.getLogger("EGplugin")

var plugin_register = new register()
//产生plugin_register对象
plugin_register.on_system_init(()=>{logger.info("插件插入服务初始化")})
plugin_register.on_express_init(()=>{logger.info("插件插入web框架初始化")})
router.get("/test",(req,res,next)=>{res.send("hello")})
```

其他功能实现可以翻看插件文件夹来查看
