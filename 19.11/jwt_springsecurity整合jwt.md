# spring security + jwt
代码地址:[https://github.com/sunwu51/jwt-springsecurity](https://github.com/sunwu51/jwt-springsecurity)
# 先不加jwt
直接security的使用方式，主要的步骤是注入`WebSecurityConfigurerAdapter`对象，并重写configure方法，configure中又需要`userDetailsService`接口类，所以需要在写个类实现这个接口。

只需要上述两个类，就配置完成security。参见代码第一次commit的结果。  
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/jwt1.gif)
# 添加jwt
需要做两件事，1 添加一个不需要验证身份的登录接口，用于认证和返回jwt；2 添加一个jwtFilter，用于做用户身份认证和上下文的身份追加。

这里我们将`subject`用来保存用户名，auth接口的流程为提取出请求中的用户名、密码，做认证认证就是用`myUserDetailsService`,这里用map模拟了三个用户。
```java
public class MyUserDetailsService implements UserDetailsService {

    // 用map模拟数据库的用户信息
    Map<String,String> userPassList = new HashMap<>();
    {
        userPassList.put("user1","pass1");
        userPassList.put("user2","pass2");
        userPassList.put("user3","pass3");

    }

    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
        // 正式使用的时候 应该将下面换成数据库访问
        if(userPassList.containsKey(userName)){
            return new User(userName,userPassList.get(userName),new ArrayList<>());
        }
        return null;
    }
}
```
最终效果：  
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/jwt2.gif)

