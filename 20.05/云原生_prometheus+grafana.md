# 1 prometheus
prometheus普罗米修斯，收集监控数据并进行保存和简单的展示与查询的平台。采集是直接通过http接口和特定形式的返回值，而存储使用的是内置的TSDB（时序数据库），展示与查询提供了一个简单的页面，也可以通过grafana配合。
# 1.1 安装与配置介绍
[官网](https://prometheus.io/docs/prometheus/latest/installation/)提供了两种安装方式，通过docker或者直接下载[二进制包](https://prometheus.io/download/)。
```
docker run \
    -p 9090:9090 \
    -v /tmp/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```
这里我们使用二进制包进行demo，下载后目录中有个prometheus.exe是启动文件，双击就可以启动，而prometheus.yaml是配置文件。

![image](https://i.imgur.com/7RerGvH.png)

打开这个yaml文件，内容如下：
```yml
global:
  scrape_interval:     15s 
  evaluation_interval: 15s
alerting:
  alertmanagers:
  - static_configs:
    - targets:

rule_files:

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
    - targets: ['localhost:9090']
```
配置主要有4部分：
- global指定全局配置，例如采集周期，计算周期
- alerting指定告警配置，默认无
- rule_files指定规则文件，默认无
- scrape_configs采集配置，指定要采集那些节点，一般是http url，默认有一个采集点，就是prometheus自己。metrics_path默认是/metrics

可以通过[http://localhost:9090/metrics](http://localhost:9090/metrics)可以看到符合prom规则的采集样例。
![image](https://i.imgur.com/78N7Cay.png)  
一般一行参数包含，`指标名称 {指标标签} 指标值`，中间的指标标签可没有。

# 1.2 SpringBoot2.x整合
创建SpringBoot项目，把web和actuator勾选上。添加prometheus依赖。
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
    <version>1.1.3</version>
</dependency>
```
注入bean：
```java
@Bean
MeterRegistryCustomizer<MeterRegistry> configurer(@Value("${spring.application.name}") StringapplicationName) {
    return (registry) -> registry.config().commonTags("application", applicationName);
}
```
添加配置：
```properties
spring.application.name=springboot_prometheus
management.endpoints.web.exposure.include=*
management.metrics.tags.application=${spring.application.name}
```
第三行配置也可以不要。完成后启动应用，访问/actuator/prometheus
![image](https://i.imgur.com/1LhH3O5.png)

此时我们只需要在prometheus.ymal中添加对这个项目的采集就可以了，在scrape_configs中追加一项job，添加后重新运行prom:
```yml
scrape_configs:
  #之前的保持不变追加下面这项job
  - job_name: 'springboot'
    metrics_path: /actuator/prometheus
    static_configs:
    - targets: ['localhost:8080']
```

此时我们可以在prom查询页面localhost:9090搜索当前spring应用的监控参数，可以通过参数名+标签，也可以单独用参数名或标签进行过滤查询：
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/2005/prom.gif)
# 1.3 自定义监控
上面的监控是默认监控的一些系统基础参数，像gc、heap内存等，下面展示自定义参数。

例如添加filter来监控每个url入口的总请求次数：
```java
@Component
public class PromFilter extends OncePerRequestFilter {
    @Autowired
    MeterRegistry registry;

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        Counter totalRequest = registry.counter("total_request","method", httpServletRequest.getMethod(),"path",httpServletRequest.getRequestURI());
        totalRequest.increment();

        doFilter(httpServletRequest,httpServletResponse,filterChain);
    }
}
```
demo工程放到了当前目录下/prom-test下了，可以自己参考。prom除了counter计数还有更灵活的gauge、timer。
# 2 grafana
```
 docker run -d --name=grafana -p 3000:3000 grafana/grafana
```
配置数据源为prometheus，然后配置为当前电脑ip:9090.就可以了。后面打dashboard随便加。