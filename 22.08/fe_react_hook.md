# react hooks
前排提示：相关代码放到了[./react-hooks](./react-hooks)下。

react早期有function写法和class写法，function写法一般用于简单的组件声明，因为function中没法使用`state`和`hook`函数，这使得组件只能是静态的。而class虽然功能完整但是写法较为复杂。

react hooks的出现就是对function组件写法的增强，简化了代码，利用了闭包使function也能支持state和声明周期函数。
# 先创建个react项目
```shell
$ mkdir react-hooks && cd react-hooks
$ npm init -y
$ npm i react react-dom redux react-redux redux-thunk @reduxjs/toolkit
$ npm i -D vite
```
创建`index.html`，引入src下的`main.jsx`，vite自动识别jsx为react，所以不需要额外配置。
```html
<div id="root"></div>
<script type="module" src="./src/main.jsx"></script>
```
main.jsx
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div>App</div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <App />
);
```
启动
```shell
$ npx vite
```
# useState
hook写法中，最常用的莫过于设置state的`useState`和生命周期相关的`useEffect`

`useState`用法如下，实现了一个简单的`counter`，useState的返回值是个数组，第一个元素就是state变量，第二个元素是设置这个state的函数，该函数在调用的时候效果和`setState({count:xx})`效果一致，都可以触发组件的渲染。
```jsx
import React,{useState} from 'react'

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1 onClick={()=>setCount(count+1)}>{count}</h1>      
    </div>
  )
}
```
# useEffect副作用
useEffect函数形式变种较多，该函数第一个参数是一个函数，副作用函数，当组件渲染完成后会产生副作用，即运行这个函数。包括第一次加载完成，和后续每一次重新渲染。

例如在上面Counter中添加一行代码，如下。可以看到每次渲染完都会产生'副作用'，适合用于每次渲染组件都要执行的场景。是`componentDidUpdate`和`componentDidMount`的替代品。
```jsx
import React,{useEffect, useState} from 'react'

export default function Effecter() {
  
  const [count, setCount] = useState(0);
  
  useEffect(()=>{console.log("effect")});

  console.log('rendering');

  return (
    <div>
      <h1 onClick={()=>setCount(count+1)}>{count}</h1>      
    </div>
  )
}
```
![image](https://i.imgur.com/Kf43Q0e.gif)

useEffect的第二个参数是个数组，规定了触发的条件，当数组中`任意`元素发生变化的时候才会触发，注意这里的`变化`，是js中`!=`就算变化，一般需要是值类型，引用类型的对象不适用。如果第二参数是空数组，或者`[1]`这种恒等的值，那么就会导致副作用函数只在第一次加载的时候运行，起到了生命周期函数`componentDidMount`相同的作用
```jsx
useEffect(()=>{console.log("effect")}, []);
```
![image](https://i.imgur.com/N9JXpn7.gif)

因为每次渲染，function内部的变量会重新复制，所以产生变化的一般是state中的值，所以第二参数常用来判断state中某些值是否发生变化来决定是否触发副作用。例如判断state中count，如果`count%5==0`的值发生变化才触发副作用函数。这种用法使用场景也较多，例如当某个state发生变化的时候需要请求服务端数据，请求完成后又可以使用`setXX`来修改state来触发重新渲染，注意副作用函数是渲染后的执行函数。
```jsx
  useEffect(()=>{console.log("count is " + count)}, [ count%5 == 0]);
```
![image](https://i.imgur.com/7Nf9zHo.gif)

而如果是对象类型，则无法判断是否相同，即一直认为是不同的对象
```jsx
  useEffect(()=>{console.log("count is " + count)}, [{a:1}]);
```

副作用函数的返回值，是一个函数，我们叫他清理函数。当下一次副作用函数运行的时候，会运行上一次的返回值。这么说有点抽象，我们看个例子。
```jsx
useEffect(()=>{
    console.log("effect"); 
    return () => console.log("count is " + count)}
);
```
注意看，第一次点击的时候，数字变成1了，但是打印的count is 0，这是因为组件第一次加载完，就已经将闭包注册了，注册时count是0，点击后count变成了1，先清理上一个副作用函数的影响，也就是运行上一次useEffect的返回值，也就打印了count is 0，并重新注册返回值了。如此往复。

![image](https://i.imgur.com/9Pdff0c.gif)


```
组件首次渲染 -> 副作用函数(并注册清理函数) -> 组件更新渲染 -> {上次注册的清理函数 -> 副作用函数} -> 组件更新渲染 -> ...循环
```
如果组件更新后，useEffect第二参数没有变化导致没有触发副作用函数，那么上次注册的清理函数就也不会运行，即上面`{}`中是捆绑运行的。

可以看到清理函数类似`componentWillUnmount`，但是前者是每次更新也会渲染，与后者稍有区别，不过往往我们更需要前者。例如当我们点击一个id请求他的数据时，网络很慢，此时我们点击了另一个id，然后第一个id的数据返回了，组件内容变成了第一个id的数据，这在网络较慢的时候很容易发生。我们可以在清理函数中停止当前的请求，这一点非常有用。
```jsx
  useEffect(()=>{
    let n = setTimeout(()=>console.log(`模拟服务端请求到${count}的数据`), 1000);
  })
```
![image](https://i.imgur.com/DYqfCJ5.gif)
```jsx
  useEffect(()=>{
    let n = setTimeout(()=>console.log(`模拟服务端请求到${count}的数据`), 1000);
    return clearTimeout(n)
  })
```
![image](https://i.imgur.com/paKneMR.gif)

【上面用timeout模拟了ajax请求，在fetch和axios中有各自定义的中断请求的函数，可以自行了解。】

小心的在useEffect中使用setXXX，因为很有可能导致无限循环渲染。

# RTK(redux toolkit)中的hook
redux有着action dispatch reducer connect store provider等概念，使用起来也是非常麻烦，也提供了hook写法来简化代码。Redux Toolkit是最新的官方推荐的写法，https://redux.js.org/introduction/why-rtk-is-redux-today。我们就直接看最新的写法吧。

redux原来创建action和reducer比较麻烦，action需要使用枚举的方式来定义以防止难以规范和拼写错误等问题，而reducer有要单独再定义。rtk中引入了slice的写法，同时创建action和reducer，如下就是创建了addOne和add这两种action，和一个处理两种action的reducer，并export出去了。
```jsx
// slice.jsx
import {createSlice} from '@reduxjs/toolkit';

const slice = createSlice({
    name : "count_slice",
    initialState: {count: 0},
    reducers: {
        addOne(state) {
            state.count = state.count + 1;
        },
        add(state, action) {
            state.count = state.count + action.payload;
        }
    }
});

export const {actions, reducer} = slice;
```
创建组件，在组件中使用dispatch(action)触发store的改动，并使用useSelector来订阅改动，但是这里订阅的state是全局的state。我们需要给我们这个reducer单独起个名字，这要在store创建的时候配置，我们这里先叫r1。
```jsx
// Counter.jsx
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from './slice';

export default function Counter() {
  const dispatch = useDispatch();
  const count = 0;
  const count = useSelector(state=>state.r1.count);

  return (
    <div>
      <h1 onClick={()=>dispatch(actions.addOne())}>
        hi {count}
      </h1>      
    </div>
  )
}
```
当然我们还是需要最外面包着store和provider才能生效，所以在main.jsx中需要这样写。
```jsx
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from './slice';
import Counter from './Counter';

// 将多个reducer组合成一个，并分别给一个key，后续action的名字会是 r1/addOne这种形式
const store = configureStore({
    reducer: {
      r1: reducer,
    }
});


export default function App() {
  return (
    <>
        <Counter />
    </>
  )
}


const root = ReactDOM.createRoot(document.getElementById('redux'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```
thunk的使用，直接用createAsyncThunk函数即可创建thunk。并在slice中使用extraReducer处理thunk类型的action，注意thunk是一种特殊的action。
```jsx
import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';

export const fetchTodos = createAsyncThunk("my_thunk", async ()=>{
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();
    return json;
})

const slice = createSlice({
    name : "count_slice",
    initialState: {count: 0, loadState: "", todos: []},
    reducers: {
        addOne(state) {
            state.count = state.count + 1;
        },
        add(state, action) {
            state.count = state.count + action.payload;
        }
    },
    // thunk形式的reducer用extraReducer字段处理，thunk三种状态分别是加载中，完成和失败了。
    extraReducers: builder => {
        builder.addCase(fetchTodos.pending, (state, action) => {
            state.loadState = "loading"
        }).addCase(fetchTodos.fulfilled, (state, action)=>{
            state.loadState = "finish"
            state.todos = action.payload;
        }).addCase(fetchTodos.rejected, (state, action)=>{
            state.loadState = "failed"
        })
    }
});
```
触发thunk类型的action，直接dispatch这个thunk。
```jsx
dispatch(fetchTodos())
```
详细代码
```jsx
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTodos } from './slice';

export default function Thunker() {
  const dispatch = useDispatch();
  const todos = useSelector(state=>state.r1.todos);
  const loadState = useSelector(state=>state.r1.loadState);
  console.log(loadState)
  return (
    <>
      <button onClick={()=>dispatch(fetchTodos())}>fetch data</button>
      {
        loadState=='loading' ? <h1>loading</h1> : (
          <table>
            <tr><th>id</th><th>title</th><th>completed</th></tr>
            {
              todos.map(it=>(
                <tr>
                  <td>{it.id}</td>
                  <td>{it.title}</td>
                  <td>{it.completed?'yes':'no'}</td>
                </tr>
              ))
            }
          </table>
        )
      }
    </>
  )
}
```
可以看出这个state可以很好的处理加载中这个状态的页面展示。

![image](https://i.imgur.com/8Bg0HXx.gif)

# useQuery
redux的thunk提供了较好的几个状态的封装，但是对于中小项目引入redux往往提高了开发难度，且降低了代码可读性，React Query是对异步数据变动的很好的封装，可以和原生react hook结合，来高效开发项目。
```shell
$ npm i react-query
```
只需要两步，即可使用react-query
```jsx
// 1 在根组件上配置Provider，这样里面才能用useQuery等增强函数
import { QueryClient, QueryClientProvider } from 'react-query' 
....
root.render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>
);
// 2 在组件中使用useQuery，hook在组件加载完成后触发
import { useQuery } from "react-query";
...
  const {data, status, isFetching} = useQuery('fetchTodos', async ()=>{
    console.log("run query")
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();
    return json;
  });
...
// status有idle loading success error等状态，判断状态是success，然后渲染data。
// isFetching是bool，与status不同的是status在第一次成功后就一直是success后续如果refetch的话，要靠isfetching判断是否正加载
```
注意query每次渲染完都会触发，与useEffect一样。从日志可以看出，组件第一次渲染，status是loading，此时没有运行异步函数，组件加载完成之后，才开始运行异步函数中的查询。查询得到结果后改变了status和data于是重新渲染组件。
![image](https://i.imgur.com/eSMlxQW.png)

默认的useQuery只在组件初次渲染的时候运行一次，第三参数中可以用enable来制定某些值存在时才触发，第一个参数可以是个数组，第2个及以后参数是异步函数依赖的变量
```jsx
const {data, status} = useQuery(
  ['fetchTodo', id], // 闭包将id注册进去
  fetchById(id),
  {enable: !!id} // 当id存在的时候才会第一次触发  
)
```
默认不加载数据点击按钮才加载，就需要将enable设置为false。
通过`refetch`函数可以强制重新加载，使用`queryClient.invalidateQueries('fetchTodos')`也有同样的效果。
```jsx
const  {data, status, refetch, isFetching} = useQuery('fetchTodos', fetchTodos);
...
<button onClick={()=>{refetch()}}>fetch data</button>
<button onClick={()=>{queryClient.invalidateQueries('fetchTodos')}}>fetch data</button>
```
我们经常遇到修改了某一行数据，就需要重新加载整个table的场景。那就可以使用mutation
```jsx
import { useQuery, useQueryClient,useMutation  } from "react-query";
...
const queryClient = useQueryClient();
  const mutation = useMutation(async ()=>{
    // 这里是修改数据的ajax，可以使用await关键字
  }, {
    onSuccess:() => {
      // invalidateQueries可以refetch
      queryClient.invalidateQueries('fetchTodos')
    }
  }
)
```
# 自定义hook
我们可以使用use开头的函数定义自己的hook，例如使用useEffect和useState，我们可以将isOnline这么一个会变化的状态封装成hook，当online状态变动的时候，会触发组件重新渲染，钩子的作用就体现出来了。

下面是官网的一个例子。
```jsx
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}

// 直接使用该函数的返回值即可，这样hook可以自动触发online变动-》组件渲染
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```
