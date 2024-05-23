import * as React from 'react'
import ReactDOM from 'react-dom/client'
import { faker } from '@faker-js/faker'

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
  
} from '@tanstack/react-table'

type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = randomData()

const columnHelper = createColumnHelper<Person>()
const columns: ColumnDef<Person, any>[] = [
  {
    id: "index",
    header: "index",
    cell: info => <p style={{color: 'blue'}}>{info.row.index}</p>,
  },
  {
    accessorKey: "firstName",
    header: "firstName",
    cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
  },
  {
    accessorKey: "lastName",
    header: "lastName",
    cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>,
    filterFn: (row, colId, filterValue) => {
      console.log({row,filterValue})
      return row.original.lastName.length < parseInt(filterValue)
    }
  },
]
// const columns: ColumnDef<Person, any>[] = [
//   {
//     accessorKey: "firstName",
//     header: info => <h1>{info.column.id}</h1>,
//     cell: info => <p style={{color: 'blue'}}>{info.getValue()}</p>, 
//   }
// ]
function App() {
  const [data, setData] = React.useState(() => [...defaultData])
  const [pageIndex, setPageIndex] = React.useState(0)
  const [filterTxt, setFilterTxt] = React.useState("")
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  console.log(table.getState().pagination)
  console.log(table.getPageCount())
  return (
    <div>
      <table style={{width: table.getTotalSize()}}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan} style={{width: header.getSize()}}>
                  <span>
                    {flexRender(header.column.columnDef.header,header.getContext())}
                  </span>
                  <span 
                    style={{width:'1px', height: '1rem',borderRight: '3px solid', float: 'right'}}
                    onMouseDown={header.getResizeHandler()}
                  ></span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {
                  typeof(cell.column.columnDef.cell) === 'string' ? cell.column.columnDef.cell :
                  cell.column.columnDef.cell!(cell.getContext())
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot> 
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div>Page{table.getState().pagination.pageIndex+1} of {table.getPageCount()}</div>
      <button disabled={!table.getCanPreviousPage()} onClick={()=>{setData(randomData()); setPageIndex(pageIndex - 1)}}>&lt;</button>
      <button disabled={!table.getCanNextPage()} onClick={()=>{setData(randomData()); setPageIndex(pageIndex + 1)}}>&gt;</button>
    </div>
  )
}
function randomData() {
  var data: Person[] = []
  for (var i=0; i<10; i++) {
    data.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int(80),
      visits: faker.number.int(100),
      status: faker.helpers.shuffle(['Single', 'Complicated', 'In Relationship'])[0],
      progress: faker.number.int(100),
    })
  }
  
  return data
}
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
    <App />
)
