# dp & dfs
dp是动态规划，dfs则是深度优先遍历。这两类问题经常遇到。我们集中看一下这些问题的特征、解决与分析技巧。
# 动态规划
动态规划的问题，一般是f(n)和f(n-1)或者f(n)与f(x)|x<n有一定的联系。

例如最明显的斐波那契数列`f(n)=f(n-1)+f(n-2)`就是典型的动态规划。但是直接利用这个公式进行求解会有重复计算，例如求f(5)的过程中需要计算f(4) f(3),而f(4)需要计算f(3)f(2)这里f(3)就计算了两次。对于这种情况，DP一般会创建一个DP数组，数组大小可以是n，当然如果f(n)只和f(n-1)f(n-2)有关，则数组也可以设置大小为2。通过不断推进窗口来获得最后的结果，这里我们只说下更泛用性的dp数组大小为n的时候。

数组dp[n+1]，dp[i]存储f(i)的结果，当f=0,1的时候很容易计算出结果。i>1时利用dp[i]=dp[i-1]+dp[i-2]即可求出。

我们来看几道题。

**1 mxn矩阵，起点在左上角，只能向右或向下移动，求移动到右下角的路径有多少种。**  
> 这个题我们知道mxn的路径数，其实等于mx(n-1)的路径数+(m-1)xn的路径数。所以我们建立一个二维数组大小是mxn，分别用于存储f(m,n)的值，很容易就能得到结果了。利用dp[m][n]=dp[m-1][n]+dp[m][n-1]。（ps：和前面的类似，可以只申请一个一维数组，重复利用来降低空间复杂度）
```js
function f(m,n){
    // 创建mxn的数组
    var a=[]
    for(var i=0;i<m;i++)
        a.push([])  
    // 初值赋值好     
    a[0][0]=1
    a[0][1]=1
    a[1][0]=1
    for(var i=0;i<m;i++){
        for(var j=0;j<n;j++){
            if(i==0||j==0){//边栏都是1
                a[i][j]=1;
            }else{
                a[i][j]=a[i-1][j]+a[i][j-1]
            }
        }
    }
    return a[m-1][n-1]
}
```

**2 有1....n这n个数字构成一个二叉搜索树，一共有多少种可能**
> 这个问题我们也很容易想到，如果是1作为根节点则就变成了左边0个元素，右边n-1个元素构成bst。如果是2作为根节点则是左1个，右边n-2... 如此以来便得到了递推公式f(n)=f(0)xf(n-1)+f(1)xf(n-2)...f(n-1)xf(0)这样我们可以建立一个n大小的数组分别存储结果f(1)..f(n)
```js
function f(n){
    var a=[]
    a[0]=1
    a[1]=1
    for(var i=2;i<n+1;i++){
        a[i]=0 //js中要自己先赋值不然就nan了
        for(var j=0;j<n;j++){
            a[i]+=a[j]*a[n-1-j]
        }
    }
    return a[n]
}
```

**3 求一个数组中所有子数组中和最大的，将和返回**
> 从第头开始，上来和s,t=a[0]。然后i=1,t取a[1],s+a[1]中较大的，s取t，s中较大的，依次类推。这个题目不是上面那种的典型dp但是是有动态的思想的，即数组a中最大和s是a前n个组成的数组的最大和s1与a[n]有一定的关系，需要区分s1是不是包含a[n-1]的。解法code十分简单
```js
function f(a){
    var s=a[0],t=a[0]
    for(var i=1;i<a.length();i++){
        t = Math.max(a[i],s+a[i])
        s = Math.max(s,t)
    }
    return s
}
```
**4 字母码表A-1 B-2... Z-26，给定数字字符串s，返回可能构成的字符种类，如12可能是AB也可能是L，则返回2**
> 这个问题有点类似，跳一步或两步的台阶问题。从尾部开始看，f(n)=f(n-1)+f(n-2)。但是这个题有个比台阶要麻烦点的就是有条件，例如第n个字符是0，则f(n-1)项就不能要了，然后是n-1和n组成的二位数大于26那f(n-2)项就不能要了。
```js
function f(s){
    var a=[]
    var len = s.length
    if(len==0)return 0;
    // 先安顿好最后两个元素
    a[len-1]=s[len-1]=='0'?0:1;
    if(s[len-2]=='0'){
        a[len-2]=0;
    }else if(s[len-1]=='0'){
        a[len-2]=1;   
    }else if(s.substring(len-2,len)>'26'){
        a[len-2]=1;
    }else{
        a[len-2]=2;
    }
    // 然后向前遍历
    for(var i=len-3;i>=0;i--){
        if(s[i]=='0'){
            a[i]=0;
        }else if(s.substring(i,i+2)>'26'){
            a[i]=a[i+1]
        }else{
            a[i]=a[i+1]+a[i+2]
        }
    }
    return a[0]
}
```
**5 给定字符串s1，s2，s3判断s3能否用s1，s2拼接而成，拼接时字符相对位置不能变，如abc和bcc可以拼接成abccbc。**
> 这个问题本身是较难看出所谓的递归关系的，也可以有其他的解法但是dp的解法是最快的，思路是构建一个m+1 x n+1的数组
```
    b c c
  T F F F
a T T T T
b T F F T
c T F F T
```
> 然后对s3和s1，s2比较，比较方式为左为T则和上方比较看是否一致，上为T这左侧比较是否一致。最终是为了找到一个横竖坐标只能加(向右向下)的路径能从左上到右下。
```js
function f(s1,s2,s3){
    //构造数组a
    var a= []
    for(var i=0;i<s1.length+1;i++)
        a.push([])

    for(int i=0;i<s1.length+1;i++){
        for(int j=0;j<s2.length+1;j++){
            if(i==0&&j==0)a[i][j]=true;
            else if(i==0){
                a[i][j]=a[i][j-1]&&s2[j-1]==s3[i+j-1]
            }else if(j==0){
                a[i][j]=a[i-1][j]&&s1[i-1]==s3[i+j-1]
            }else{
                a[i][j]=(a[i][j-1]&&s2[j-1]==s3[i+j-1] )||( a[i][j]=a[i-1][j]&&s1[i-1]==s3[i+j-1])
            }
        }
    }
    return a[s1.length(),s2.length()]
}
```
# 深度优先遍历
dsp本身是指二叉树的遍历方式的一种，即按照当前节点的前后中位置的三种遍历方式。但是dsp也常用于解决一些列出各种可能性的情况，尤其是需要选择和回退选的情况。

例如排列组合问题，给n个值，求出所有排列可能性，求出所有组合的可能性。这就是非常经典的dsp。一般的思路是，先用一个数组记录每个元素的个数。然后为第一个位置选择元素，有n种选择，然后每种里面需要为第二个位置选择元素，此时有n-1种选择，因为记录元素个数的那个里面第一个元素对应的个数少了1。依次类推就有n!个排列方式。
```js
function f(arr){
    var count={}
    for(var i=0;i<arr.length;i++){
        count[arr[i]]=count[arr[i]]?count[arr[i]]+1:1
    }
    var len =arr.length;
    // 记录数组中所有元素 用两个数组 一个记录元素，一个记录个数
    var ele = Object.keys(count)
    var cos = Object.values(count)
    var res=[]
    console.log(ele,cos,res)
    dfs([],res,ele,cos,0,len)
    return res
}
function dfs(list,res,ele,cos,index,len){
    if(index==len){
        res.push(Object.assign([],list))//注意深拷贝
    }else{
        for(var i=0;i<ele.length;i++){
            if(cos[i]>0){
                list.push(ele[i])
                cos[i]--;
                dfs(list,res,ele,cos,index+1,len)
                list.pop();
                cos[i]++;
            }   
        }
    }
}
```
上面的代码是非常经典的dfs式子，我们注意dfs函数的形式三点，1 截止条件，当满足最后一级的时候就可以收网了。2 循环，每个元素都可以作为候选，如果重复利用就是n的n次方循环。 3 条件筛选，并不是所有元素都可以使用，用过的元素就不能再用了，所以有cos[i]>0条件框定。（ps:重复元素，一个被用了之后，当前位置可以用另一个，不算重用）我们还应关注下参数，其实dfs函数的参数大多数都是不变的，可以用全局变量代替，而必要的参数只有两个，一个是list一个是level或叫index。

我们再来看组合的dfs，组合和排列不同的在于

1 组合不需要选出所有元素，可能是k个(k小于总个数)所以代码的截止条件换为`index==len`中参数len换成k。

2 不同顺序的排列是同一种组合如1,2和2,1是同一种，所以可以按照从小到大的顺序筛选，即index是i的数字，一定大于i-1。所以代码的筛选条件添加一条`if(list.length>0&&ele[i]<list[list.length-1])continue;`

除了二叉树的遍历、排列和组合这两类，还有很多问题也需要用到dfs进行求解。我们继续来看几道题

**1 IP地址的点号去掉后的字符串，有多少种IP的可能，如25525511135有两种255.255.11.135以及255.255.111.35**
> 这个题非常有意思，他和DP中的码表题很像，但是却有不同。而这个不同就是区分用dfs还是dp的核心：是否要回退。啥意思呢，就是dp中如果把5,35或者135作为最后一位都是可以的不需要回退，而dfs的题目中5这个值在后续验证中是不能使用的因而需要回退，去掉这个假设(可能)。

> dfs很多时候是抽象成多叉树的模型，这里也是IP有4个表示，决定了数有4层，第一层有2,25,255三种依次类推。

```js

function f(s){
    var res =[];
    dfs(res,[],s,0,0)
    return res;
}
function dfs(res,list,s,i,level){
    // 如果凑够了4个数，并且刚好在最后一位
    if(level==4 && i==s.length){
        res.push(Object.assign([],list))
    }else if(level==4||s==s.length){
        return;  
    }else{
        for(var j=1;j<=3;j++){
            // 255以内 两位数则第一位不能为0 就可以作为候选
            if(j>1 && s[i]=='0'){
                continue;
            }
            if(parseInt(s.substring(i,i+j))<=parseInt('255')){
                list.push(s.substring(i,i+j));
                dfs(res,list,s,i+j,level+1);
                list.pop();
            }
        }
    }
}
```
**2 一个字符构成的矩阵(二维数组)中，寻找是否含有单词，只有相邻(上下左右)才能连接**
```
board =
[
  ['A','B','C','E'],
  ['S','F','C','S'],
  ['A','D','E','E']
]

Given word = "ABCCED", return true.
Given word = "SEE", return true.
Given word = "ABCB", return false.
```
> 这个题跟前面dp中的融合字符串有点像，也用到了矩阵，但是实际上不一样，dp中的矩阵一般只朝着右下方向走。这里实际上也是有选择和进退的。例如ABCCED字符串，第0个字符A可以在矩阵所有16个元素中进行选择，只不过筛选条件是==A过滤剩下只有俩了，然后B只能在A的上下左右四个位置，所以有2x4=8个选项，每个分别验证是否是B，就只剩一组了，然后需要继续验证。（slot & choice是dfs一个特征。）哦对我们似乎还需要注意一点：用过的字符不能重复使用，所以还需要一个mxn的boolean数组，记录元素是否已经使用。










