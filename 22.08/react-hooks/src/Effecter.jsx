import React,{useEffect, useState} from 'react'

export default function Effecter() {
  
  const [count, setCount] = useState(0);
  
  // useEffect(()=>{console.log("effect once")}, [1]);
  // useEffect(()=>{
  //   console.log("effect"); 
  //   return ()=>console.log("count is " + count)}
  // ,[1]);
  // console.log(count)

  useEffect(()=>{
    // let n = setTimeout(()=>console.log(`模拟服务端请求到${count}的数据`), 1000);
    // return ()=>clearTimeout(n)
  })

  return (
    <div>
      <h1 onClick={()=>setCount(count+1)}>{count}</h1>      
    </div>
  )
}
