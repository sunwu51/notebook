# tanstack
初始化一个react项目，然后安装`tanstack/react-table`，为了更好的理解工作原理，选择使用typescript。
```bash
$ npm create vite # 然后选择react
$ npm i @tanstack/react-table
```
# 1 基础的用法
```tsx
import { useState,ReactNode } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

// ts中声明table中每行数据的形状 Person在框架中对应泛型TData
type Person = {
  firstName: string
  lastName: string
}

// 声明列的定义即表头的元数据信息，定义中需要声明两个泛型TData和TValue，TValue对应每个cell元素中的值，此处声明为ReactNode即可，可兼容string|jsx
const columns: ColumnDef<Person, ReactNode>[] = [
  {id: 'firstName', accessorKey: "firstName", header: "first name" , cell: info => <Card>{info.getValue()}</Card>},
  {id: 'lastName',  accessorKey: "lastName", header: "last name" ,cell: info => <Card>{info.getValue()}</Card>},
]

function Table(props: {data: Person[]}) {
  const [data] = useState(props.data);
  // useReactTable hook必须的元素， data即TData[]是表格的数据，columns是ColumnDef[]是表格表头元数据信息，getCoreRowMode必传参数
  // getCoreRowModel是一个必须的参数，并且必须传入getCoreRowModel()函数，有点多此一举是因为tanstack的模块化开发导致的这个模块是required
  // 其他模块还有过滤器/排序/分页等等。。
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // table的重要属性：1 getHeaderGroups() 返回多组表头，最常见的单行表头则长度为1
  // header中重要的属性header.column.columnDef就是我们传入的列的定义
  // 2 getRowModel()使用定义好的模块处理后得到的行数据，如果只定义了 getCoreRowModel 那就是全量数据，如果有排序则会排序模块也生效，以此类推
  // RowModel<TData>中最重要的属性就是rows，是一个Row<TData>[]，每一行Row又有多个Cell<TData,TValue>，每个cell与header是同级别都是最小的单元td级别
  // cell可以获取到当前对应的列columnDef信息，固定的可以通过flexRender(cell.column.columnDef.cell, cell.getContext())完成使用coldef中定义的cell渲染方式，来渲染当前cell的value
  return <table>
    <thead>
      {
        table.getHeaderGroups().map(headerGroup=> <tr key={headerGroup.id}>
          {
            headerGroup.headers.map(header => <th key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>)
          }
        </tr>)
      }
    </thead>
    <tbody>
      {
        table.getRowModel().rows.map(row => <tr key={row.id}>
          {row.getAllCells().map(cell => <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>)}
        </tr>)
      }
    </tbody>
  </table>
}

export default Table
```

```tsx

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]
<Table data={defaultData}/>
```
![image](https://i.imgur.com/khGjdXX.png)

从基本的用法中，可以看出，需要准备的数据主要是表头列的元数据定义`ColumnDef[]`和数据`TData[]`，然后调用`useReactTable` hook，传入这两个参数，返回一个`table`对象，这个对象中包含了表格的各种操作方法，比如`getHeaderGroups()`、`getRowModel()`可以分别获取表头和数据来进行渲染。这里注意要使用`flexRender(cell.column.columnDef.cell, cell.getContext())`才能使用列定义中cell的渲染方式进行渲染。

这里用到了`columns`和`data`传入`useReactTable`，但是实际上我们自己封装table不用hook，也能够进行简单的封装，就是把上述代码中`headerGroup.headers`换成`columns`即可，`row.getAllCells()`换成`data`。所以tanStack的封装在基础的用法上其实看不出有什么作用，他主要还是在多种功能的封装上，例如 排序 过滤 分页等等。

# 2 基础概念与类型
一个表格的基本组成如下图，其中比较抽象的一个概念是`column`，在图上虽然是圈出了一列，但是他其实并不包含这一列的数据，它更像是一种元数据的定义，`columnDef`是column中最重要的一个属性，定义这一列如何取值，如何渲染等等，他只是定义了这一列的基本信息，但是并没有真正的包含数据，真正的数据是由`row`来包含的。下面我们简单了解下几个重要的数据类型。

![image](https://i.imgur.com/jX7omuQ.png)

## ColumnDef
有三种具体的类型： `DisplayColumnDef`基础的展示列，`AccessorColumnDef`更易用的列定义快捷访问对象，`GroupColumnDef`分组列。

`DisplayColumnDef`包括后面`AccessorColumnDef`有四个非常基础的属性如下，`id`意义不多说，`header`是表头的样子，`footer`是表尾的样子，`cell`是这一列中每一个数据单元的样子。
```jsx
const columns: ColumnDef<Person, any>[] = [
  {
    id: "id",
    header: "header", // 与id二者至少指定一个 
    cell: "cell",     // 非必须
    footer: "footer", // 非必须
  }
]
```
把之前的例子中的columns进入如上述改造，得到效果如下，有三行cell的原因是数据data是有三行的。

![img](https://i.imgur.com/mGwlsh0.png)

我们说def定义了渲染方式，但是上面我们只是使用了固定的字符串，那么我们如何使用变量渲染呢？其实`header/cell`除了指定为字符串类型，也可以是一个函数(footer与header完全一致不再赘述)。
```jsx
const columns: ColumnDef<Person, any>[] = [
  {
    id: "名字",
    header: info => <h1>{info.column.id}</h1>, // 这个info是HeaderContext类型
    cell: info => <p style={{color: 'blue'}}>{info.row.original.firstName}</p>, // 这个info是CellContext类型
  }
]
```
![img](https://i.imgur.com/EWKpKId.png)

改为函数后，渲染如上图，我们在函数中获取了一些信息，并组合为jsx元素最终渲染了，这里需要注意`header`与`cell`定义为函数类型的时候，两者的参数即上面info类型是不同的，将其打印得到如下信息：

![img](https://i.imgur.com/TTRV0bM.png)

header的参数info中有三个属性，分别是
- `column`当前列的信息，`column.id`就是当前定义的id，`column.columnDef`就是当前这个def本身，其他信息暂时不需要关注。
- `header`记录的表头的一些信息，例如这个header位于的`headerGroup`，序号下标`index`，对应的列信息`column`该引用直接指向上面的column属性。
- `table`是当前的表实例，这个后续会比较有用，这里暂时不展开，知道这个table实例就是当前整个table实例，其他地方的table实例都是同一个即可。

cell的是每一个cell触发的时候运行的函数，info中也有`column`和`table`属性与上面完全相同，此外还有以下属性：
- `getValue`暂时不管等介绍`AccessorColumnDef`的时候再介绍，这里先不管。
- `getRenderValue`暂时不管
- `row`当前这一行，`row.index`是当前这一行在data中的下标，`row.original`就是当前这一行的data，其他信息先不关注。
- `cell`当前这个格子，cell中有记录自己属于哪一行`row`和哪一列`column`，以及默认`getValue`。

这里初学会觉得很疑惑，明明在这个函数中使用的东西很少，但是框架却提供了非常复杂、且繁多的信息，这是因为`tanstack`提供了非常高的灵活度，来帮助开发者自己二次开发表格组件。

接下来看`AccessorColumnDef`他就是对上面的`DisplayColumnDef`的进一步封装，他提供了更易用的快捷访问对象，让开发者更加方便的使用数据，并且可以更加方便的进行排序和过滤，所以多数时候直接选择`AccessorColumnDef`是明智的。

与前面不同的主要就是`accessorKey`属性，这个属性是必须的，它是用来指定当前列的数据在data中的key，这个key会作为id的默认值，和cell中`getValue`的默认返回的列，如下写法，可以得到与之前类似的效果。
```jsx
const columns: ColumnDef<Person, any>[] = [
  {
    accessorKey: "firstName",
    header: info => <h1>{info.column.id}</h1>,
    cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>, 
  }
]
```
而`GroupColumnDef`则是为了实现多行表头的，他就是为了将上面的def进行聚合分组
```jsx
const columns: ColumnDef<Person, any>[] = [
  {
    id: "g1",
    header: ()=><h1>name</h1>,
    columns: [
      {
        accessorKey: "firstName",
        header: "firstName",
        cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
      },
      {
        accessorKey: "lastName",
        header: "lastName",
        cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
      },
    ]
  }
]
```
如上，可以达到下面效果。
![image](https://i.imgur.com/WXTdSHO.png)

到此我们了解了`ColumnDef`的基本概念，同时对`Table` `HeaderGroup` `Column` `Row` `Cell` `Header`这些类型和概念，也有了初步的了解，接下来我们看看`useReackTable`这个hook的返回值也就是`Table`类型。

## Table
`Table`是`useReactTable`返回的对象，也是上面`ColumnDef`的cell和header属性中函数的入参中的一员，这个对象可以说是包含了整个table的所有信息，包括前面图中看到的`HeaderGroup`、`Columns` `Rows` `Cell`等等。

在示例代码中我们可以看到使用了`table.getHeaderGroups()`获取当前所有的表头分组，进而遍历每一个`header`进行渲染，后续渲染数据的时候，又通过`table.getRowModel().rows`获取到了所有的`row`，然后遍历每一个`row`，每个`row`又通过`getAllCells()`获取到了其包含的`cell`。

`table`中的api非常多，我们需要结合场景来看。

## flexRender
这个函数是辅助渲染的，以cell中为例`flexRender(cell.column.columnDef.cell, cell.getContext())`这个函数其实就是帮我们做了类似这样的事情：
```jsx
typeof(cell.column.columnDef.cell) === 'string' ? 
  cell.column.columnDef.cell :
  cell.column.columnDef.cell!(cell.getContext())
```
也就是他会判断我们在columnDef中定义的cell的渲染方式，如果直接定义的字符串那就直接返回该字符串，如果是个函数那就把当前cell上下文传入运行函数返回jsx。
# 3 高阶用法
开始高阶用法之前，还是需要将上面基础用法的代码准备好，我们在此基础上进行改动。
## 3.1 排序
排序只需要通过在hook中传入`getSortedRowModel: getSortedRowModel()`，然后使用`header.column.getToggleSortingHandler()`即可切换当前这一列的排序状态了，这个函数每次触发会依次将当前列的排序方式从 `false->asc->desc`切换，这个状态可以从`table.getState().sorting`中查看全局的排序状态，也可以通过`header.column.getIsSorted()`查看当前列的排序状态。

如下我们只需要改动几行代码，就可以实现一个对列可以排序的按钮。

```tsx {7,14} :main.tsx
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
....
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
...

<th key={header.id} colSpan={header.colSpan}>
  <span onClick={header.column.getToggleSortingHandler()}>
    {flexRender(header.column.columnDef.header,header.getContext())}
    {header.column.getIsSorted() && (header.column.getIsSorted() === 'asc' ? '🔼' :'🔽')}
  </span>
</th>
```
![img](https://i.imgur.com/daFE2Kd.gif)

自定义排序方式可以在`ColumnDef`中指定`sortingFn`，如下，使用长度进行排序。
```jsx
  {
    accessorKey: "lastName",
    header: "lastName",
    sortingFn: (rowA, rowB) => rowA.original.lastName.length - rowB.original.lastName.length,
    cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
  }
```

在自己的业务中捕捉修改排序状态，在hook中指定`onSortingChange`即可，函数的入参就是`table.getState().sorting`，可以获取到change后的排序状态，如果在自己的业务中需要修改排序状态，可以直接修改这个状态
```tsx
  const [mysort, setMysort] = useState([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: sorting => setMysort(sorting),
    state: {sorting: mysort}
  });

  // 此时setMysort可以通过回调，让其他组件触发排序状态改变
```

默认是单列排序，如果需要多列排序，可以指定`enableMultiSort`为true，此时如果多列同时生效，需要按住`shift`去触发才可以。
```tsx
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    // maxMultiSortColCount: 3, 默认多列可以是所有列，这里可指定最多3列
    // isMultiSortEvent: function(e) { return e.shiftKey; }, 默认是shift按下，可以改成别的比如control或者不限制直接返回true
  });
```
## 3.2 过滤
单列过滤与排序类似，我们在hook中引入`getFilteredRowModel: getFilteredRowModel(),`即可使用`header.column.getCanFilter()`和`header.column.setFilterValue()`了
```tsx
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
....
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
...

<th key={header.id} colSpan={header.colSpan}>
  <span>
    {flexRender(header.column.columnDef.header,header.getContext())}
    {header.column.getCanFilter() && 
      <input type="text" onChange={e=>{header.column.setFilterValue(()=>e.target.value)}}/>
    }
  </span>
</th>
```
默认的过滤函数就是`includes`，如果需要自定义过滤函数，在`ColumnDef`可以指定自定义的过滤函数，`filterFn`属性，返回布尔值，如下，是把filterValue转成数字，然后过滤lastName长度小于这个值的。
```tsx
  {
    accessorKey: "lastName",
    header: "lastName",
    cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
    filterFn: (row, colId, filterValue) => {
      return row.original.lastName.length < parseInt(filterValue)
    }
  }
```

过滤状态的state是`columnFilters`与`sorting`格式类似都是个`{id: string, value: string}`的数组，id都是列的id。

同样如果想要自己管理这个`fitler`状态，可以指定`onColumnFiltersChange`钩子函数，与sorting的类似，这里不展开了。
## 3.3 全局过滤
全局过滤或者叫多列过滤，同样需要`getFilteredRowModel: getFilteredRowModel(),`，并且需要指定`state`，该值与自己的搜索框的value进行关联，代码如下
```tsx
....

  const [filterTxt, setFilterTxt] = useState('')
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state:{
      globalFilter: filterTxt,
    },
    // 全局过滤的函数，不指定就是任意一个cell包含filterValue就显示
    globalFilterFn: (row, _, filterValue) => {
      return  Object.values(row.original).filter(v=>v.toString().includes(filterValue)).length > 0
    },
  });

...

<input value={filterTxt} onChange={e=>{setFilterTxt(e.target.value)}}/>

....
```
![image](https://i.imgur.com/SZfkgtF.png)

修改`globalFilterFn`可以灵活的控制过滤的方式，比如排除某些列(也可以在def中enableGlobalFilter配置为false)。

## 3.4 调整列宽
hook中指定`columnResizeMode: 'onChange',`，然后再th中添加了一个span样式定义为一条竖线，这里主要是指定`onMouseDown={header.getResizeHandler()}`这样鼠标按下后的拖动过程都交给`header`来处理，框架就帮我们实现了拖动实时改变`table.totalSize`和`header.size`的过程了，我们只需要把这两个值设置到对应的dom样式中即可：
```tsx
....
const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
}
...
<table style={{width: table.getTotalSize()}}>
....
  <th key={header.id} colSpan={header.colSpan} style={{width: header.getSize()}}>
    <span>
      {flexRender(header.column.columnDef.header,header.getContext())}
    </span>
    <span style={{width:'1px', height: '1rem',borderRight: '3px solid', float: 'right'}}
      onMouseDown={header.getResizeHandler()}></span>
  </th>
```
![img](https://i.imgur.com/ApcjZ6I.gif)
## 3.4 分页
上面场景都针对小数据量，当数据较多的时候就不得不分页，并且引入了另一个复杂的话题，也就是服务端交互的问题，例如对于上面的`sort`排序，如果table没有获取到全量的数据，而是分页的数据，`sort`要做的是把`sortby=xx&pageSize=xx&pageNum=xx`这样的请求传给服务端，让服务端负责返回当前页的数据集，一共有多少页等信息。

开启分页直接在hook中引入` getPaginationRowModel: getPaginationRowModel(),`开启，此时可以查看`table.getState().pagination`是记录的状态默认应该是`{pageIndex: 0, pageSize: 10}`，而`table.getPageCount()`则是记录了当前数据一共分了多少页，我们将数据data长度扩展为12，如下引入分页后，数据就会变成只展示前十个，这是因为分页默认页size10

```tsx
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
....
//tanstack中pageIndex也就是页号是从0开始，这个比较重要，所以展示数据的时候需要+1比较readable一点。
<div>Page{table.getState().pagination.pageIndex+1} of {table.getPageCount()}</div>
<button disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}>&lt;</button>
<button disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>&gt;</button>
```
![img](https://i.imgur.com/CEsZXVi.png)

`server-side`以分页为例，服务端模式都会比客户端更麻烦一点，例如服务端分页的话，你需要去掉`getPaginationRowModel`，并且在hook中指定`pageCount`总页数的属性
```js
// server-side就需要自己维系data和pageIndex信息
  const [data, setData] = React.useState(() => [...defaultData])
  const [pageIndex, setPageIndex] = React.useState(0)
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    pageCount: 10,
    manualPagination: true, 
    state:{
      pagination:{
        pageIndex,
        pageSize: 10
      }
    },
    autoResetPageIndex: false,
  })


  ...
  <div>Page{table.getState().pagination.pageIndex+1} of {table.getPageCount()}</div>
  <button disabled={!table.getCanPreviousPage()} onClick={()=>{setData(fetchFromServer()); setPageIndex(pageIndex - 1)}}>&lt;</button>
  <button disabled={!table.getCanNextPage()} onClick={()=>{setData(fetchFromServer()); setPageIndex(pageIndex + 1)}}>&gt;</button>
```