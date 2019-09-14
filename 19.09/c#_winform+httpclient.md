# winform+httpclient
C#是一门神奇的语言，他和java的用法很像，如果你是java，转到C#几乎没有太大的感觉。.net的库和JDK又有着细微的风格差异，一般呢，.net中你觉得这个函数，类中可能会有，他大概率就真的有。而JDK则不然，你觉得有的函数往往都没有，需要用其他几个函数，凑出这个功能。
# winform
`winform`其实已经很多年了，微软已经推出了性能更高的wpf。但是winform却比后者更简单，容易上手。

1 新建一个winform项目
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/winform1.jpg)

2 vs在项目创建好之后讲整个ui分为了5个部分：控件区，工作面板/代码区，项目文件，控件属性/事件。  
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/winform2.png)

3 通过拖拽左边的控件到工作面板上面，就完成控件的创建了，然后右下角可以修改这些控件的属性，如文字、大小、颜色等等。  

4 双击控件就可以跳转到默认事件函数，例如button的默认事件就是点击事件。

5 如果想要其他事件，则可以自己创建函数，并在右下角事件中进行绑定。

# http获取数据并展示在datagridview控件中
```C#
private void button1_Click(object sender, EventArgs e)
{
    // 请求数据，并转成list格式
    var url = "http://jsonplaceholder.typicode.com/users";
    HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
    Stream stream = req.GetResponse().GetResponseStream();
    StreamReader reader = new StreamReader(stream);
    String content = reader.ReadToEnd();
    JavaScriptSerializer jsonTool =  new JavaScriptSerializer();
    List<User> list = jsonTool.Deserialize<List<User>>(content);

    // 数据填充页面
    DataTable dt = new DataTable();
    dt.Columns.Add("id");
    dt.Columns.Add("name");
    dt.Columns.Add("email");
    list.ForEach(u =>
    {
        var row = dt.NewRow();
        row["id"] = u.id;
        row["name"] = u.name;
        row["email"] = u.email;
        dt.Rows.Add(row);
    });
    dataGridView1.DataSource = dt;

    //dataGridView1.DataSource=

}
```
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1909/winform3.gif)