---
title: PromQL
date: 2026-01-25 13:00:00+8:00
tags:
  - promql
  - prometheus
  - grafana
---

# PromQL
`PromQL`是prometheus的查询语言，可以在prometheus为数据源的grafana中查询数据，或者也可以在自带的UI中查询数据。

语法可以在官方文档进行查阅：[PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)，这里把最常见的用法列出。

# 指标的数据类型
下面的都以每台机器每15s的默认统计周期为例：
- 1 `gauge`瞬时值类型，如内存使用，cpu使用率等，每个值都代表当前时间点的值，统计频率可能是1s一个，但是每台机器15s只会保存并上传最后一个值。
- 2 `counter`计数类型，是一个累加的计数值，例如请求数，每台机器都是从0开始计数，每15s把当前的总数上传，技术本身的值没有意义但是可以通过rate等函数求qps。
- 3 `summary`次数+总和类型，是由`xx_sum`所有请求总耗时和`xx_count`所有请求总次两个counter指标组合而成，用`sum/count`可以得到平均耗时，这是`timer`方法的实现方式之一。
- 4 `histogram`直方图，是由`xx_sum` + `xx_count` + `xx_bucket`三个指标组成，不仅可以得到平均耗时，还可以用`bucket`得到`P50 P95..`等重要监控指标，也是`timer`方法的实现之一。 这里`xx_bucket`类型会有个特殊的`label`是`le`小于等于，例如耗时分布可能是`le=0.01, 10个， le=0.02, 20个， le=0.03, 50个, le=Inf, 100个`，代表一共100个请求小于等于30ms的有50个，以此类推。
# 字面量
浮点数标量，字符串，时间表达式
```bash 
## 浮点数标量，返回值就是这个数组
1.123
100

## 双引号包住的是字符串字面量，指标的返回值就是字符串本身
"简单字符串"

## 整数+单位(ms/s/m/h/d/w/y)代表时间，可以拼接组合
## 时间直接查询的返回值是秒数，例如1m返回60,1ms返回0.001
60s
1m
1h30m
```
# 即时值
即时制是指当前或指定一个时间点的指标值，是单个点的值。
```bash
## basic，基本写法就是一个指标名称，返回的就是指标当前时间点的值
metric_name

## filter，按照label进行过滤
## 上传指标的时候有很多lable比如region，pod_name等等，如果只想查询某个条件的指标，可以用filter过滤
## 支持 = != =~ !~ 四种操作符，等于和不等于比较容易理解，=~和!~是正则表达式。
metric_name{filter1="value", filter2~="prefix_(.*)"}

## offset，指定基于当前时间向前的偏移量，如下是返回1m前这个指标的值
metric_name offset 1m

## @ timestamp，指定查询的时间点，绝对时间值
metric_name @ 1609746000
```
# 范围值
按照时间范围查询区间内的所有打点值
```bash
## 5m内的所有打点值，如果15s一个的话就是返回20个数值
metric_name[5m]

## [-15m, -10m)
metric_name[5m] offset 10m
```
注意：实际我们查询指标的时候，一般会有`grafana`等平台，这些平台的页面上可以选择时间范围，因而我们不需要用`promql`的范围值语法，只需要用即时值 + grafana的时间范围即可，grafana会用默认的区间间隔去查询时间范围内所有的数据。

# 操作符
`PromQL`中默认是支持四则运算取余等基本数学操作符的，除了这些数学操作符之外，还支持聚合操作符，注意这些是操作符，不是函数，虽然写法上和函数一样。
```bash
## 基本格式如下，aggr-op有avg/min/max/sum/count/quantile/stddev/stdvar/topk/bottomk等等
<aggr-op> [without|by (<label list>)] ([parameter,] <vector expression>)
## without和by也可以写到后面
<aggr-op>([parameter,] <vector expression>) [without|by (<label list>)]

## 查询每个region的内存使用总量的情况，例如有2个region，每个region10台机器，每台内存1G左右，则查询出来的结果是2个值，分别是10G和10G
sum by (region) (memory_usage)

## 查询每个region中内存的中位数，还是2regionx10台机器，每台内存1G左右，则查询出来的结果是2个值，分别是1G和1G，只保留region这个tag。
quantile by (region) (0.5, memory_usage)

## 获取每个region中内存用量最多的3台机器的值，返回6条数据，保留原始的tag
topk by (region) (3, memory_usage)
```

# 函数
常见函数除了几个数学函数，就只有下面三个用的比较多。
```bash
# rate求qps单位是次/s，如下对过去5m的数据求平均qps
rate(http_requests_total[5m])

# increase求增量单位是次，如下对过去5m的数据求增量，他等于上面指标x300
increase(http_requests_total[5m])

# 计算 HTTP 请求延时 P95（近 5 分钟）
histogram_quantile(
  0.95,  # 分位数参数，0.95 对应 P95
  # 第一步：对 bucket 数据计算 5 分钟内的增量（排除历史累计值，只取近期数据）
  sum by (le) (  # 如果分path统计这里可以添加其他label
    increase(http_server_requests_seconds_bucket[5m])  # increase 计算 Counter 指标的增量
  )
)
```
注意`histogram_quantile`函数中的`le`是小于等于，这里有个经典误区就是`histogram_quantile`函数vs`quantile`操作符，前者作用于`histogram`类型的指标，一般是`_bucket`结尾的指标，用于统计一段时间内的P95值，例如5m内所有http请求耗时的p95。而`quantile`操作符则是作用于普通`gauge`类型的指标，用于统计当前时间点，不同机器的指标中的P95值，例如当前时间机器内存占用的p95。