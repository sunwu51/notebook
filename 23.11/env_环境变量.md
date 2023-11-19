# 环境变量
环境变量是程序运行时候可以从系统中获取到的变量的值。

例如java中通过`System.getEnv("xx")`来获取环境变量，而node中使用`process.env.xx`来获取。

对于不同的运行环境可能需要设置不同的环境变量，例如本地运行的时候连接的数据库信息和线上的数据库连接信息就是不一样的。对于不同环境的配置信息，使用不同的环境变量来隔离就是个非常通用的方法了。当然了也可以指定不同的profile或者说不同的配置文件，例如springboot中常用的就是通过指定不同的配置文件。

![image](https://i.imgur.com/ZmksQGn.png)
# .env与nodejs
每次通过如上图的export方式放到启动脚本中去给变量赋值，显然是不够灵活和记录性交叉。`.env`文件类似spring中`application.xx.yml`文件，指定不同的文件名来区分不同环境运行，最常见的就是在`node`中的大量使用了。

nodejs中早期的用法是通过引入`dotenv`这个包，通过config方法将环境变量引入，用法如下

![image](https://i.imgur.com/meeefGy.png)

注意config函数如果传空参数的话，默认是找当前路径下的`.env`这个文件，所以为了不改代码，可以通过在不同环境设置不同的`.env`这个文件也是可以的。

node在比较新的版本例如v20中，已经不再需要单独引入第三方的`dotenv`包了，自身已经支持通过运行时参数`--env-file=xxx`来指定环境变量了。

![image](https://i.imgur.com/BwxVG0K.png)

# .env与rust
rust中也有`dotenv`这个包`cargo add dotenv`，用法如下，在项目根目录防止`.env`文件。
```rust
extern crate dotenv;

use dotenv::dotenv;
use std::env;

fn main() {
    dotenv().ok();
    println!("k1={}", 
        env::var("k1").unwrap_or("".to_string()));
    println!("k2={}", 
        env::var("k2").unwrap_or("".to_string()));
}
```
![image](https://i.imgur.com/nrFEmeu.png)

# .env与springboot
java中一般配置并不是重度依赖环境变量，一般都通过专门的配置文件来指定，但是又可以用环境变量，整体就比较灵活。不建议直接用java的.env框架来读.env文件，还是建议通过spring自己的配置文件进行配置，如果是一些敏感信息，注入到了环境变量，也可以在yml配置中拿到。

java中有获取属性`System.getProperty`和获取环境变量的`System.getEnv`方法，但是一定注意spring的yml配置并不会直接设置属性，换句话说通过`System.getProperty`不能拿到spring的配置如下图，只能通过`@Value`注入。

![image](https://i.imgur.com/jR0x279.png)

与get相对应的也有set的方法，一般较少通过代码去set，更常见的是运行指令中去获取

java启动指令中`-` `--` 和 `-D`的区别
- -是指定java的参数的，例如jvm的参数`-Xmx`等
- --是spring.boot项目中，放到指令的最后，覆盖`yml`配置中的属性的。
- -D是jvm中用来覆盖`System.property`的，同时也会覆盖`yml`配置中的属性，-D参数需要放到jar包前面，放到最后就不生效了。

`--`和`-D`有点像，建议使用`-D`不要使用`--`。


## 在yml中注入环境变量的方式
通过`:`可以指定未设置该环境变量时候的默认值。
```js
my.property=${my.env:默认值}
```

这里要注意`my.env`其实可以从两个地方获取，就是属性和环境变量都会去看有没有设置。例如我们通过配置文件或者-D指定了`my.env`属性的话，也是会被`my.property`取到该值。
```js
my.env=jjj
my.property=${my.env:222333}
```

上面如果同时设置了`my.env`环境变量和属性值，会优先取环境变量的值。

