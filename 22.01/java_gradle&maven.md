# gradle&maven
gradle和maven一样也是项目构建工具，他比maven的功能更多一些，也更灵活和复杂，但是并不见得大家就需要把maven的项目迁移到gradle上去，因为两者还是有一些区别。

我个人还是更喜欢maven一些，并且maven的依赖管理更容易理解，简单且高效。

# 概述
gradle的配置是根目录下的`build.gradle`，gradle配置的语法与maven有非常大的不同，maven是基于xml，所以能配置的东西比较固定，也比较容易掌握。

下面就是一个maven方式创建springboot项目的pom.xml的简单配置方式，主要的3件事就是声明自己的坐标，自己依赖的坐标以及plugin了，总体来讲配置比较简单。其他的几个便于组织项目的标签后面介绍。
```xml

```

而gradle的配置相对来说比较灵活且复杂，gradle的语法是一套自定义的基于groovy的dsl，一般我们的项目中需要指定的有apply哪些插件，这个要写在最前面，因为gradle不仅是给java项目用的，也可以用于c++等其他语言，所以上来apply的插件中需要指定语言插件的。


