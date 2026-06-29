---
title: jq用法详解
date: 2026-06-29T20:37:00+08:00
tags:
  - jq
  - json
  - cli
  - command-line
  - data-processing
---

# jq 用法详解

`jq` 是一个轻量级、功能强大的命令行 JSON 处理工具，类似于 `sed`/`awk`/`grep` 之于文本，但专门针对 JSON 数据。它用一种声明式的过滤表达式来提取、转换、计算 JSON，是后端调试 API、处理日志、编排脚本的利器。

> 一句话理解：`cat data.json | jq '.'` 相当于 JSON 版的 `cat`，而 `jq '.user.name'` 则是 JSON 版的 `grep`/`awk`。

---

## 1. 安装

### 1.1 macOS

```bash
# Homebrew
brew install jq

# MacPorts
sudo port install jq
```

### 1.2 Windows

```powershell
# scoop
scoop install jq

# winget
winget install jqlang.jq

# Chocolatey
choco install jq
```

下载二进制：从 [jqlang/jq releases](https://github.com/jqlang/jq/releases) 下载 `jq-windows-amd64.exe`，重命名为 `jq.exe` 并放入 `PATH`。

### 1.3 Linux

```bash
# Debian / Ubuntu
sudo apt-get install jq

# CentOS / RHEL / Fedora
sudo dnf install jq
# 或
sudo yum install jq

# Arch
sudo pacman -S jq
```

### 1.4 Docker

无需本地安装，直接用容器跑：

```bash
echo '{"a":1}' | docker run --rm -i ghcr.io/jqlang/jq:latest '.a'
```

### 1.5 从源码编译

```bash
git clone https://github.com/jqlang/jq.git
cd jq
autoreconf -fi
./configure --with-oniguruma=builtin
make -j8
sudo make install
```

### 1.6 验证安装

```bash
jq --version
# jq-1.7.1
```

---

## 2. 基本用法

### 2.1 命令格式

```bash
jq [options] '<filter>' [file...]
```

如果不指定 file，则从 stdin 读取。

### 2.2 常用选项

| 选项 | 含义 |
|---|---|
| `-c` | 紧凑输出（一行一个结果），适合管道处理 |
| `-r` | 原始输出（字符串不带引号），适合取值给 shell |
| `-R` | 把输入当作原始字符串读取（而不是 JSON） |
| `-s` | 把多个 JSON 对象收集成数组 `slurp` |
| `-n` | 不读取输入，配合 `--arg`/`--rawfile` 构造 JSON |
| `-e` | 根据过滤结果是否为真/非空返回退出码 |
| `-a` | 输出 ASCII（转义非 ASCII 字符） |
| `--tab` | 用 tab 缩进 |
| `--indent N` | 指定缩进空格数（0-7） |
| `--arg name val` | 注入字符串变量 |
| `--argjson name val` | 注入 JSON 变量 |
| `--slurpfile name file` | 把文件内容作为数组注入变量 |
| `--rawfile name file` | 把文件原始内容作为字符串注入变量 |

### 2.3 最简单的例子

```bash
# 美化输出
echo '{"name":"Tom","age":20}' | jq '.'

# 输出：
# {
#   "name": "Tom",
#   "age": 20
# }
```

---

## 3. 过滤器基础（Filter）

### 3.1 身份 `.`

`.` 表示输入本身，常用于格式化 JSON。

```bash
echo '{"a":1}' | jq '.'
```

### 3.2 字段访问 `.field`

```bash
echo '{"user":{"name":"Tom","age":20}}' | jq '.user.name'
# "Tom"

# 深层字段链式访问
jq '.user.address.city'

# 字段名含特殊字符，用 ."xxx"
echo '{"a-b":1}' | jq '."a-b"'
```

### 3.3 可选字段 `.field?`

当字段可能不存在时，用 `?` 避免报错：

```bash
echo '{"a":1}' | jq '.b?'
# null（不报错）
```

### 3.4 数组索引 `.[i]`

```bash
echo '[10,20,30]' | jq '.[1]'
# 20

# 负索引从尾部取
jq '.[-1]'   # 最后一个元素
```

### 3.5 数组切片 `.[a:b]`

```bash
echo '[10,20,30,40,50]' | jq '.[1:4]'
# [20,30,40]

# 省略首尾
jq '.[2:]'   # 第3个到最后
jq '.[:2]'   # 前2个
```

### 3.6 迭代 `.[]`

把数组/对象的每个元素逐一输出：

```bash
echo '[1,2,3]' | jq '.[]'
# 1
# 2
# 3

# 对象迭代
echo '{"a":1,"b":2}' | jq '.[]'
# 1
# 2
```

### 3.7 管道 `|`

类似 shell 管道，把上一步的结果作为下一步的输入：

```bash
echo '{"users":[{"name":"Tom"},{"name":"Jerry"}]}' | jq '.users | .[] | .name'
# "Tom"
# "Jerry"
```

### 3.8 逗号 `,` 与方括号 `[]`

- `,`：依次应用多个 filter，结果按顺序输出
- `[]`：把多个结果收集成数组

```bash
echo '{"a":1,"b":2}' | jq '.a, .b'
# 1
# 2

echo '{"a":1,"b":2}' | jq '[.a, .b]'
# [1, 2]
```

### 3.9 括号分组 `(...)`

```bash
echo '{"a":1,"b":2}' | jq '(.a + .b)'
# 3
```

---

## 4. 常用内建函数

### 4.1 类型与结构

| 函数 | 作用 |
|---|---|
| `type` | 返回类型字符串（"object"/"array"/"number"/"string"/"boolean"/"null"） |
| `length` | 数组长度 / 字符串长度 / 对象字段数 / null 为 0 |
| `keys` | 对象的 key 列表（排序） |
| `keys_unsorted` | 对象的 key 列表（保留原始顺序） |
| `values` | 对象的 value 列表 |
| `has("k")` | 对象是否含有某 key |
| `contains(x)` | 输入是否包含 x（字符串子串、数组子集、对象子键值） |
| `in({"a":1})` | 判断 key 是否存在于某对象 |
| `paths` | 列出所有值路径 |
| `leaf_paths` | 列出所有叶子路径（旧版） |
| `getpath(["a","b"])` | 按路径取值 |
| `setpath(["a","b"]; v)` | 按路径赋值 |
| `delpaths([["a"]])` | 按路径删除 |
| `to_entries` | 把对象转成 `[{"key":..,"value":..}]` |
| `from_entries` | 把 `[{"key":..,"value":..}]` 转回对象 |
| `ascii_downcase` / `ascii_upcase` | 大小写转换 |
| `tonumber` / `tostring` | 类型转换 |
| `explode` / `implode` | 字符串 ↔ 码点数组 |

示例：

```bash
echo '{"a":1,"b":2}' | jq 'keys'
# ["a","b"]

echo '{"a":1,"b":2}' | jq 'to_entries'
# [{"key":"a","value":1},{"key":"b","value":2}]

echo '{"name":"Tom","age":20}' | jq 'to_entries | map(.value)'
# [20,"Tom"]
```

### 4.2 数组操作

| 函数 | 作用 |
|---|---|
| `map(f)` | 对每个元素应用 f，等价于 `[.[] \| f]` |
| `select(cond)` | 保留满足条件的元素 |
| `add` | 数组求和 / 字符串拼接 / 对象合并 |
| `min` / `max` | 最小最大值 |
| `min_by(f)` / `max_by(f)` | 按函数比较 |
| `unique` / `unique_by(f)` | 去重 |
| `group_by(f)` | 按函数分组 |
| `sort` / `sort_by(f)` | 排序 |
| `reverse` | 反转 |
| `flatten` | 拍平嵌套数组 |
| `first` / `last` / `first(f)` / `last(f)` | 取首/尾 |
| `limit(n; f)` | 取前 n 个 |
| `any` / `any(cond)` / `all` / `all(cond)` | 存在/全称判断 |
| `range(n)` / `range(from;to)` / `range(from;to;step)` | 生成整数序列 |
| `floor` / `ceil` / `round` / `fabs` | 数学函数 |

示例：

```bash
# 取偶数
echo '[1,2,3,4,5]' | jq 'map(select(. % 2 == 0))'
# [2,4]

# 按字段排序并取最大
echo '[{"n":3},{"n":1},{"n":2}]' | jq 'max_by(.n)'
# {"n":3}

# 分组统计
echo '[{"t":"a","v":1},{"t":"a","v":2},{"t":"b","v":3}]' \
  | jq 'group_by(.t) | map({t:.[0].t, sum:(map(.v)|add)})'
# [{"t":"a","sum":3},{"t":"b","sum":3}]

# range 生成
jq -n 'range(5)'
# 0 1 2 3 4

jq -n '[range(0;10;2)]'
# [0,2,4,6,8]
```

### 4.3 字符串函数

| 函数 | 作用 |
|---|---|
| `length` | 字符串长度 |
| `split(sep)` | 分割成数组 |
| `join(sep)` | 数组拼接为字符串 |
| `ltrimstr(s)` / `rtrimstr(s)` | 去除指定前/后缀 |
| `startswith(s)` / `endswith(s)` | 前后缀判断 |
| `test(re)` / `test(re;flags)` | 正则匹配 |
| `match(re)` / `scan(re)` / `capture(re)` / `splits(re)` | 正则相关 |
| `sub(re;s)` / `gsub(re;s)` | 替换（一次/全部） |
| `ascii_downcase` / `ascii_upcase` | 大小写转换 |
| `@base64` / `@base64d` | base64 编解码 |
| `@json` | 序列化为 JSON 字符串 |
| `@text` / `@csv` / `@tsv` / `@sh` | 格式化输出 |
| `tojson` / `fromjson` | JSON 字符串互转 |

示例：

```bash
# CSV 输出
echo '[{"name":"Tom","age":20},{"name":"Jerry","age":18}]' | jq -r '.[] | [.name,.age] | @csv'
# "Tom",20
# "Jerry",18

# 正则替换
echo '"hello 2026"' | jq -r 'gsub("[0-9]+"; "YEAR")'
# hello YEAR

# base64
echo '"hello"' | jq -r '@base64'
# aGVsbG8=
```

---

## 5. 高级特性

### 5.1 变量 `as`

用 `... as $name | ...` 绑定变量：

```bash
echo '{"a":3,"b":4}' | jq '.a as $a | .b as $b | $a * $a + $b * $b'
# 25

# 解构对象
echo '{"user":{"name":"Tom","age":20}}' \
  | jq '.user as {$name, $age} | {$name, $age, adult: ($age >= 18)}'
# {"name":"Tom","age":20,"adult":true}

# 解构数组
echo '[1,2,3]' | jq '. as [$a, $b, $c] | $a + $b + $c'
# 6
```

### 5.2 函数定义 `def`

```bash
# 定义一个求平方的函数
echo '[1,2,3]' | jq 'def sq: . * .; map(sq)'
# [1,4,9]

# 带参数的函数
jq -n 'def add3($a;$b;$c): $a+$b+$c; add3(1;2;3)'
# 6

# 递归：求阶乘
jq -n 'def fact: if . <= 1 then 1 else . * (.-1 | fact) end; 5 | fact'
# 120
```

### 5.3 条件表达式

`if-then-elif-else-end`：

```bash
echo '5' | jq 'if . > 10 then "big" elif . > 3 then "mid" else "small" end'
# "mid"

# 简化的三元替代（注意 jq 没有三元运算符，但可以用 // 提供默认值）
echo 'null' | jq '. // "default"'
# "default"
```

### 5.4 reduce

`reduce` 用于把流归约为单个值：

```bash
# 求和
echo '[1,2,3,4,5]' | jq 'reduce .[] as $x (0; . + $x)'
# 15

# 拼接字符串
echo '["a","b","c"]' | jq 'reduce .[] as $x (""; . + $x)'
# "abc"

# 统计频次
echo '["a","b","a","c","a","b"]' \
  | jq 'reduce .[] as $k ({}; .[$k] = ((.[$k] // 0) + 1))'
# {"a":3,"b":2,"c":1}
```

### 5.5 foreach

`foreach` 类似 reduce，但每一步都输出当前状态：

```bash
echo '[1,2,3,4]' | jq 'foreach .[] as $x (0; . + $x; {sum: ., item: $x})'
# {"sum":1,"item":1}
# {"sum":3,"item":2}
# {"sum":6,"item":3}
# {"sum":10,"item":4}
```

### 5.6 路径与修改

```bash
# 路径
echo '{"a":{"b":1}}' | jq 'paths'
# []
# ["a"]
# ["a","b"]

# 修改字段（产生新对象）
echo '{"a":1,"b":2}' | jq '.a = 10'
# {"a":10,"b":2}

# 批量更新
echo '{"a":1,"b":2}' | jq '.a += 10 | .b += 100'
# {"a":11,"b":102}

# 用路径更新
echo '{"a":{"b":1}}' | jq '.a.b = 99'
# {"a":{"b":99}}

# 递归更新所有 number 加 1
echo '{"a":1,"b":{"c":2}}' | jq 'walk(if type == "number" then . + 1 else . end)'
# {"a":2,"b":{"c":3}}
```

### 5.7 递归 `..`

`..` 递归遍历所有节点：

```bash
# 找出 JSON 中所有的字符串
echo '{"a":"x","b":{"c":"y","d":1}}' | jq '.. | strings'
# "x"
# "y"

# 找出所有名为 id 的字段值
echo '{"id":1,"items":[{"id":2}]}' | jq '.. | .id? // empty'
# 1
# 2
```

### 5.8 输入控制

```bash
# 多个文件
jq -s '.' file1.json file2.json   # 合并成数组
jq -s 'add' file1.json file2.json # 合并成对象

# -R 读取原始文本，按行处理
echo -e "a\nb\nc" | jq -R '.'
# "a"
# "b"
# "c"

# -R -s 读取全部文本
echo '{"x":1}' | jq -Rs '.'
# "{\"x\":1}\n"

# 从 stdin 读多行 JSONL
cat events.jsonl | jq -c '.'
```

---

## 6. 变量注入（与 shell 协作）

### 6.1 `--arg`（字符串）

```bash
NAME="Tom"
echo '{"name":"Tom","age":20}' | jq --arg n "$NAME" 'select(.name == $n)'
# {"name":"Tom","age":20}
```

### 6.2 `--argjson`（JSON 值）

```bash
AGE=20
echo '[{"name":"Tom","age":20},{"name":"Jerry","age":18}]' \
  | jq --argjson a "$AGE" 'map(select(.age >= $a))'
# [{"name":"Tom","age":20}]
```

### 6.3 `--slurpfile`（从文件读数组）

```bash
echo '[{"id":1}]' > a.json
echo '[{"id":2}]' > b.json
jq -n --slurpfile a a.json --slurpfile b b.json '{a:$a, b:$b}'
```

### 6.4 `--rawfile`（读原始文本）

```bash
echo "hello" > text.txt
jq -n --rawfile t text.txt '{content:$t}'
```

### 6.5 `-n` 构造 JSON

```bash
jq -n '{name:"Tom", time: now | todate}'
# {"name":"Tom","time":"2026-06-29T01:22:00Z"}
```

---

## 7. 实战场景

### 7.1 美化 / 压缩 API 响应

```bash
# 美化
curl -s https://api.github.com/repos/jqlang/jq | jq '.'

# 取字段
curl -s https://api.github.com/repos/jqlang/jq | jq '.stargazers_count'

# 压缩成一行
curl -s https://api.github.com/repos/jqlang/jq | jq -c '{name, stars: .stargazers_count}'
```

### 7.2 处理 JSONL 日志

```bash
# 取出所有 error 级别日志的 message
cat app.log | jq -r 'select(.level == "error") | .message'

# 按时间排序后输出前 5 条
cat app.log | jq -s 'sort_by(.ts) | .[:5]'

# 统计每种 level 的数量
cat app.log | jq -s 'group_by(.level) | map({level:.[0].level, count:length})'
```

### 7.3 批量提取字段为 CSV

```bash
echo '[{"name":"Tom","age":20,"city":"NY"},{"name":"Jerry","age":18,"city":"LA"}]' \
  | jq -r '.[] | [.name, .age, .city] | @csv'
# "Tom",20,"NY"
# "Jerry",18,"LA"
```

### 7.4 对象数组转表格（TSV）

```bash
echo '[{"id":1,"name":"a"},{"id":2,"name":"b"}]' \
  | jq -r '.[] | [.id, .name] | @tsv'
# 1	a
# 2	b
```

### 7.5 合并多个 JSON 文件

```bash
# 把目录下所有 json 合并成数组
jq -s '.' *.json > all.json

# 按 id 合并（去重）
jq -s 'map(.) | unique_by(.id)' *.json
```

### 7.6 修改并保存

```bash
# 把 age 加 1 后写回文件
jq '.age += 1' data.json > tmp && mv tmp data.json

# 批量修改嵌套字段
jq '.users[].active = true' data.json
```

### 7.7 配合 curl 调试接口

```bash
# 查看响应头里的分页信息
curl -sI https://api.github.com/repos/jqlang/jq | grep -i link

# 把接口返回的列表里每条记录的 url 提取出来
curl -s https://api.github.com/users/torvalds/repos \
  | jq -r '.[].html_url'
```

### 7.8 配合进程替换与管道

```bash
# 从一个接口取数据，处理后写入文件
curl -s https://api.github.com/repos/jqlang/jq/contributors \
  | jq -r '.[] | "\(.login)\t\(.contributions)"' \
  > contributors.tsv
```

---

## 8. 常见坑与技巧

### 8.1 `-r` 才能拿到裸字符串

```bash
echo '{"name":"Tom"}' | jq '.name'
# "Tom"   ← 带引号，shell 里赋值会出问题

echo '{"name":"Tom"}' | jq -r '.name'
# Tom     ← 裸字符串
```

### 8.2 数组与流的转换

```bash
# .[] 把数组拆成流（多个输出）
echo '[1,2,3]' | jq '.[]'

# [] 把流收集成数组
echo '[1,2,3]' | jq '[.[]]'

# -s 把多个输入对象合并成数组
echo -e '{"a":1}\n{"a":2}' | jq -s '.'
# [{"a":1},{"a":2}]
```

### 8.3 `select` 的位置

```bash
# 错误：先 map 再 select，会得到数组而不是元素
echo '[{"n":1},{"n":2}]' | jq 'map(select(.n > 1))'
# [{"n":2}]

# 想要元素流：
echo '[{"n":1},{"n":2}]' | jq '.[] | select(.n > 1)'
# {"n":2}
```

### 8.4 空值处理

```bash
# 缺字段默认值
echo '{"a":1}' | jq '.b // 0'
# 0

# 可选访问避免报错
echo '{"a":1}' | jq '.b.c?'
# null
```

### 8.5 数字精度

`jq` 内部用 double，处理大整数时注意精度。若需保留原始数字字符串，可用 `-R` 读取再处理。

### 8.6 性能

- `jq` 是流式处理，处理大文件不会一次性载入内存（除非用 `-s`）。
- `keys`/`sort` 等需要全量收集，大数据集要谨慎。
- 复杂的 `reduce` 可能很慢，能用内置函数就别手写循环。

---

## 9. 速查表

| 需求 | 表达式 |
|---|---|
| 美化 | `jq '.'` |
| 取字段 | `jq '.name'` |
| 取数组第 N 项 | `jq '.[N]'` |
| 数组所有元素 | `jq '.[]'` |
| 过滤 | `jq 'map(select(.ok))'` |
| 求和 | `jq 'add'` 或 `jq '[.[]]\|add'` |
| 计数 | `jq 'length'` |
| 排序 | `jq 'sort_by(.x)'` |
| 去重 | `jq 'unique_by(.id)'` |
| 分组 | `jq 'group_by(.t)'` |
| 取 keys | `jq 'keys'` |
| 转 entries | `jq 'to_entries'` |
| CSV | `jq -r '.[] \| [.a,.b] \| @csv'` |
| 原始字符串 | `jq -r '.name'` |
| 合并文件 | `jq -s '.' *.json` |
| 构造对象 | `jq -n '{a:1,b:2}'` |
| 注入变量 | `jq --arg x 1 '.x == $x'` |

---

## 10. 参考资源

- 官网：<https://jqlang.github.io/jq/>
- GitHub 仓库：<https://github.com/jqlang/jq>
- 在线试玩：<https://jqplay.org/>
- 手册：<https://jqlang.github.io/jq/manual/>
- 速查：<https://github.com/ioquatix/jq-cheatsheet>

---

## 11. 总结

- `jq` = JSON 版的 `sed`/`awk`，用过滤表达式声明式地处理 JSON。
- 核心三件套：**字段访问 `.field`**、**迭代 `.[]`**、**管道 `|`**。
- 常用三大函数：`map`、`select`、`reduce`。
- 与 shell 协作时记得 `-r` 取裸值、`--arg`/`--argjson` 注入变量。
- 大文件优先流式处理，避免 `-s` 与 `sort`/`keys` 等全量操作。

掌握 `jq`，可以让几乎所有 JSON 相关的脚本、调试、数据清洗工作变得简单而优雅。
