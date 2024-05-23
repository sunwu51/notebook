import { useState,ReactNode } from "react";
import { ColumnDef, DisplayColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

// ts中声明table中每行数据的形状 Person在框架中对应泛型TData
type Person = {
  firstName: string
  lastName: string
}

// 声明列的定义即表头的元数据信息，定义中需要声明两个泛型TData和TValue，TValue对应每个cell元素中的值，此处声明为ReactNode即可，可兼容string|jsx
const columns: DisplayColumnDef<Person, ReactNode>[] = [
  {header: "firstName"}
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
              {header.column.columnDef.header?.toString()}
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

function App() {
  return (
    <div>
      <Table data={[{firstName: "John", lastName: "Doe"}, {firstName: "Frank", lastName: "Doe"}]}/>
    </div>
  );
}
export default App