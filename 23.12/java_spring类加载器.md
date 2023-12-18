# spring类加载器
这里其实主要是说spring boot的类加载，因为spring boot中内置了一个tomcat，使得整体的应用运行比较简单，不再像以前，需要开发war包然后放到tomcat的目录下面来运行。

这个事情虽然简化了，但是springboot到底是怎么做的呢。我们在使用springboot打好的jar包的时候，也会有一些疑问。

# 为什么指定主类