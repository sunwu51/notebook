import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTodos } from './slice';

export default function Thunker() {
  const dispatch = useDispatch();
  const todos = useSelector(state=>state.r1.todos);
  const loadState = useSelector(state=>state.r1.loadState);
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
