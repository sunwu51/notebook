# 前端的存储
# cookie
以键值对字符串的形式存储，`作为请求头每次都需要携带`。可以设置过期时间，如果未过期即使浏览器关闭，再次开启也能读取值。存储容量受限，经常用来存储sessionid，这种情况下一旦被窃取，等于被盗号。域名共享：只要域名相同，即使不同标签也能读取到值。
# session
服务端的键值对，每个sessionId会对应一个Map，与cookie配合使用，真正存储用户信息的地方。
# localstorage
cookie每次都携带，太占用带宽，且很多数据只是为了本地存储，不需要给服务端。此时就可以存到localstorage，顾名思义，就是存到本地文件中的键值对存储。`localstorage默认没有过期时间的api，需要自己实现。`存于文件，永不过期。域名共享。
# sessionstorage
也是存到浏览器的，与localstorage不同的是，只要关闭标签数据就会消失。且不支持域名共享，只是当前页共享，可以刷新，但是跨标签则无效。

上面4个用法非常简单。
```js
document.cookie = "a=1";
getCookie('a');

localStorage.setItem('a',1);
localStorage.getItem('a');

sessionStorage.setItem('a',1);
sessionStorage.getItem('a');

function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
    else
    return null;
}
```
# websql
websql是在浏览器端实现一个sql数据库，底层使用的是sqlite，但是注意，该标准已经废弃了，目前已知的支持websql的浏览器并不多，好在chrome是支持的。

websql与localstorage特性基本保持一致：大小都是5M，支持同域共享，浏览器关闭后再开启数据仍存在。

```js
// 打开数据库(没有就创建)，参数为 库名，版本，描述，size。其中chrome中size参数无效，一直都是5M上限。
// 最后还有个可选的回调参数
var db = openDatabase('mydb', '1.0', 'Test DB', 0);

// sql都是通过事务，写sql创建表和插入数据，executeSql第三个参数是可选的回调
db.transaction(function (tx) {  
   tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)');
    tx.executeSql('INSERT INTO LOGS (id, log) VALUES (?,?)',[1,"xixi"]);
   tx.executeSql('INSERT INTO LOGS (id, log) VALUES (?,?)',[2,"haha"]);
});

// 读取，注意res.row是个类，不是数组，里面封装了length,item(x)
db.transaction(function (tx) {  
    tx.executeSql('select * from logs',[],(tx1,res)=>{
        var len = res.rows.length;
        for(var i=0;i<len;i++){
            console.log(res.rows.item(i))
        }
    })
});
```

关于版本，参数中的版本如果打开同一个数据库的另一个版本如'1.1',则会报错。
```
unable to open database, version mismatch, '1.1' does not match the currentVersion of '1.0'
```
版本的变更必须通过`db.changeVersion(oldversion,newversion)`,版本变更后，数据都还在。

数据库没有提供删除api，只能通过sql drop表，或者chrome的开发者->Application里清空websql。
# indexdb
如果存储的数据超过5M，则localstorage也无法胜任。只能使用IDB(indexdb)。indexdb的api较为复杂。
```js
// 打开数据库名db，版本号是1（必须为整数）
// 如果没有则创建
var request = window.indexedDB.open('db', 1);

// onsuccess 数据库打开事件
var db;
request.onsuccess = function (event) {
  db = request.result;
  console.log('数据库打开成功');
};

// onupgradeneeded 数据库创建事件，这个非常重要createObjectStore只能在这个回调中调用，createObjectStore是声明表明和key的。（schema）
request.onupgradeneeded = function (event) {
  db = event.target.result;
  var objectStore;
  if (!db.objectStoreNames.contains('person')) {
    objectStore = db.createObjectStore('person', { keyPath: 'id' });
  }
  console.log('person created')
}
```
增删改查
```js
function add() {
  var request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });

  request.onsuccess = function (event) {
    console.log('数据写入成功');
  };

  request.onerror = function (event) {
    console.log('数据写入失败');
  }
}

function remove() {
  var request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .delete(1);

  request.onsuccess = function (event) {
    console.log('数据删除成功');
  };
}

function update() {
  var request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .put({ id: 1, name: '李四', age: 35, email: 'lisi@example.com' });

  request.onsuccess = function (event) {
    console.log('数据更新成功');
  };

  request.onerror = function (event) {
    console.log('数据更新失败');
  }
}

function read() {
   var transaction = db.transaction(['person']);
   var objectStore = transaction.objectStore('person');
   var request = objectStore.get(1);

   request.onerror = function(event) {
     console.log('事务失败');
   };

   request.onsuccess = function( event) {
      if (request.result) {
        console.log('Name: ' + request.result.name);
        console.log('Age: ' + request.result.age);
        console.log('Email: ' + request.result.email);
      } else {
        console.log('未获得数据记录');
      }
   };
}
```
版本有什么用？

一个页面只会触发一次onupgradeneeded事件，就是第一次打开数据库的时候。而不同的页面可能使用的数据库版本不一样，他们的表结构可能有区别。需要在onupgradeneeded中根据当前页面的版本去生成自己的schema。注意：应保持版本号增加，schema是增量变化。
```js
var request = window.indexedDB.open('a',66);
var db;

request.onupgradeneeded = function(e) {
  console.log(e.oldVersion)
  var db = open.result;
  if (e.oldVersion < 1) {
     // create v1 schema
  }
  if (e.oldVersion < 2) {
    // upgrade v1 to v2 schema
  }
  if (e.oldVersion < 3) {
    // upgrade v2 to v3 schema
  }
  // ...
};
```
# dexie
indexdb的api较为复杂，于是就有一批封装了indexdb的库涌现了出来，dexie就是其中之一。
```html
<!doctype html>
<html>
  <head>
      <!-- Include Dexie -->
      <script src="https://unpkg.com/dexie@latest/dist/dexie.js"></script>

      <script>
          //
          // Define your database
          //这里的name和shoeSize只是索引列，并不是schema
          var db = new Dexie("friend_database");
          db.version(1).stores({
              friends: 'name,shoeSize'
          });

          //
          // Put some data into it
          //
          db.friends.put({name: "Nicolas", shoeSize: 8}).then (function(){
              return db.friends.get('Nicolas');
          }).then(function (friend) {
              alert ("Nicolas has shoe size " + friend.shoeSize);
          }).catch(function(error) {
             alert ("Ooops: " + error);
          });
      </script>
  </head>
</html>
```
```js
// 高级查找
await db.frends.where('age').above(16).toArray()
```