# 关于类加载的思考
类加载的原理其实很简单，就是加载字节码。加载规则双亲委派也没什么难的。

但是在写自定义类加载器的时候，其实写的比较丑陋，比如之前视频中自己写的加载器就很丑。主要体现在两个方面：
- 需要指定要加载的类的文件地址，不管是jar还是class
- 需要自己写字节码的读取。
# 优雅的写自定义类加载器
针对需要指定文件位置的这个点，我尝试使用`System.getProperties("System.getProperty("java.class.path")")`它的结果如下图。然而这其实并不能解决问题。

![image](https://i.imgur.com/bIA4cYN.pngg)

如果我将loader1加载路径设置为所有classpath，loader2也做相同的事情。那么仍然会导致依赖冲突。例如A-C2.0，B-C1.0。即AB分别依赖不同版本的C，这个时候loader1加载A，loader2加载B，这种情况下，loader1会加载A中new的C，然而加载的这个C不一定是2.0版本，因为1.0版本的C.class也是loader1加载路径范围的。

所以结论就是路径是必须指定的，且没法去获取jar包或者class文件的准确名称。

最好的实践方式还是把需要隔离加载的jar放到固定的目录下，在启动的时候分别设置不同的loader加载不同jar下的类。Pandora是这么做的。

对于第二点字节码读文件加载这个过程是可以优化的，因为所有的加载都是在读文件，所以可以利用jdk已有的`URLClassLoader`来加载。

因而之前复杂的自定义加载器可以改成[这样](https://github.com/sunwu51/ClassloaderDemo/blob/master/src/main/java/em/%E4%B8%89%E7%AE%80%E5%8D%95%E7%B2%97%E6%9A%B4%E7%9A%84%E6%AD%A3%E7%A1%AE%E5%81%9A%E6%B3%952.java)，而之前的自制pandora也可以写成[这样](https://github.com/sunwu51/ClassloaderDemo/blob/master/src/main/java/em/%E5%9B%9B%E6%AF%94%E8%BE%83%E7%89%9B%E9%80%BC%E7%9A%84%E6%96%B9%E6%B3%952.java)


