import React,{ useState } from 'react'
import { useQuery, useQueryClient,useMutation  } from "react-query";

export default function ReactQuery() {

  const [pull, setPull] = useState(0)

  //react query的状态就是loading success error等状态。
  const  {data, status, refetch, isFetching} = useQuery('fetchTodos', async ()=>{
    console.log("run query")
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();
    return json;
  },{
    enabled: true});
  console.log('rendering', status, isFetching)

  const queryClient = useQueryClient();
  const mutation = useMutation(async ()=>{
    // 这里是修改数据的ajax的mock
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const json = await res.json();
  }, {
    onSuccess:() => {
      // queryClient.invalidateQueries('fetchTodos')
      refetch()
    }
  }
  )
  return (
    <>
      <button onClick={()=>{queryClient.invalidateQueries('fetchTodos')}}>fetch data</button>
      <button onClick={()=>{mutation.mutate()}}>write data</button>
      {
        (status != 'success' || isFetching)  ? <h1>{status} {isFetching? 'fetching' : ''}</h1> : (
          <table>
            <tr><th>id</th><th>title</th><th>completed</th></tr>
            {
              data.map(it=>(
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
      
    </>)
}
