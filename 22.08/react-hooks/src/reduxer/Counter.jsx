import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from './slice';

export default function Counter() {
  const dispatch = useDispatch();
  const count = useSelector(state=>state.r1.count);

  return (
    <div>
      <h1 onClick={()=>dispatch(actions.addOne())}>
        hi {count}
      </h1>      
    </div>
  )
}
