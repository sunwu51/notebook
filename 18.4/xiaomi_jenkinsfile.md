# jenkinsfile常用语法
# 先列出一个简单的例子
```groovy
node{
    stage('s1'){
        echo 'hello'
    }
    stage('s2'){
        echo 'world'
    }
}
```
jenkinsfile是pipeline插件安装后可以创建pipeline类型的项目，这种类型直接写pipeline语法即可，这些脚本又叫jenkinsfile。上面这个例子很简单的实现了将流程分为两个阶段，s1阶段输出hello，s2阶段输出world。
# 本质--groovy脚本
jenkinsfile本质是groovy的dsl，即上面的node，stage其实都是函数，groovy中函数最后一个参数如果是闭包，可以写在外边。echo是预先定义过的一个函数，可以直接将字符串输出。因为是groovy脚本，所以可以灵活的使用编程语言特性。
```
node{
    stage('s1'){
        def a="/opt/mvn/bin"
        sh '${a}/mvn test'
    }
}
```
# 执行shell、捕捉异常、超时终止
通过sh这个内置函数可以执行shell语句。
```groovy
node{
    stage('s1'){
        sh 'mvn compile'
    }
}
```
pipeline有个特点中间出错，则不再执行，如果想继续，一般要这样
```groovy
node{
    stage('s1'){
        try{
            sh 'mvn test'
        }
        catch(e){
            sh 'echo "test出错"'
        }
        finally{
            sh 'echo "执行完毕"'
        }
    }
}
```
对于一些阻塞性的操作，如果放任不管则会永久占用一个进程，所以给一个执行时间阈值是很有必要的
```groovy
node{
    stage('s1'){
        timeout(10){
            sh 'mvn test'
        }
    }
}
// timeout函数默认写法如上，单位是分钟。
```
# 对于node的解释
上面的node似乎是没什么用处，其实jenkins的节点是可以自己配置的，可以配置实体机器，步骤为
- 安装ssh插件
- 添加node选择ssh方式关联

也可以配置docker容器，这时候要配置k8s或者openshift集群。例如配置了一个maven的容器节点，指定好了镜像。在写jenkinsfile时应该这样写
```groovy
node('maven'){
    ...
}
```
# 隐藏密码等敏感信息
利用withCredentials插件和配置Credentialid的方式，可以将数据存到jenkins中，而使用的时候只需要用这个id即可
```groovy
withCredentials([usernameColonPassword(credentialsId: 'mylogin', variable: 'USERPASS')]) {
    sh '''
      set +x
      curl -u "$USERPASS" https://private.server/ > output
    '''
  }
```
# 小技巧
1 在cicd项目中，sonar代码质量检测需要运行test之后才能运行sonar，这样才有单元测试覆盖率。但是test的时候经常出现错误，导致没法接入sonar，就终止了pipeline。这种情况下，可以通过try catch的方法，保证sonar部分一定可以执行。更好的方式是通过`maven.test.failure.ignore=true`这个参数来进行指定允许测试失败。
```groovy
stage('sonarqube'){
    sh 'mvn clean compile'
    sh 'mvn org.jacoco:jacoco-maven-plugin:prepare-agent test -Dmaven.test.failure.ignore=true'
    sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.4.0.905:sonar  -Dsonar.host.url=http://sonarqube.cc.d.xiaomi.net'
}             
```
2 全局的sonar配置，安装sonarqube scanner插件，然后在系统配置中添加一个sonarserver，记住代号。然后
```groovy
withSonarQubeEnv('SonarQube Server') {
      sh 'mvn clean org.jacoco:jacoco-maven-plugin:prepare-agent test -Dmaven.test.failure.ignore=true'
      sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.2:sonar'
}
```
通过这种写法，可以不用配置服务器和用户token。
# CICD项目jenkinsfile
[jenkinsfile](conf/jenkinsfile)