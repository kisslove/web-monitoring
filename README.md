# web-monitoring

###  [功能列表]

- [x] 允许用户创建多个监测站点
- [x] 从不同维度统计用户访问情况
- [x] 自定义查询时间
- [x] 多种图表展示
- [x] 支持自定义上报（js错误，api请求）
- [ ] 自定义阈值
- [ ] 自动报警功能

------
###  [技术支持]

- [x] 前端：Angular5+,ant-design
- [x] 后端：Nodejs+Express
- [x] 数据库：MondoDB


------
前端监控平台专注于 Web 端体验数据监控。监测 Web 页面的健康度的三个方面：
> * 页面打开速度（测速）
> * 页面稳定性（JS Error）
> * 外部服务调用成功率（API）

然后从不同纬度去分析用户体验。

 >  - 访问页面
 >  - 访问速度
 >  - API请求
 >  - 地理
 >  - 终端
 


参考：
>  http://fex.baidu.com/blog/2014/05/build-performance-monitor-in-7-days

>  阿里云前端监控


### 页面打开速度

网络耗时数据可以借助前面提到 Navigation Timing 接口获取，与之类似的还有Resource Timing,可以获取页面所有静态资源的加载耗时。通过此接口可以轻松获取 DNS、TCP、首字节、html 传输等耗时，Navigation Timing 的接口示意图如下所示：

![file-list](https://github.com/kisslove/web-front-end-monitoring/blob/master/Demo/timing.png)


### API请求

默认情况下，使用XMLHTTP拦截用户请求，在请求成功/失败后，统计时间，上报请求。用户可使用__ml.api()手动上报。

### JS错误

默认情况下，使用window.onError去监听用户错误脚本。有些场景下，用户使用的前端框架会捕获js错误，并不会触发onError.这种情况需用户手动调用__ml.error()上报。

### 功能介绍

