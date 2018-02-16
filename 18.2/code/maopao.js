function swap(arr,i,j){
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

/**
 *  1  冒泡排序 
 */
var arr = [9,1,5,8,3,7,6,4,2]
var flag = true 
for(let i=0;i<arr.length && flag;i++){
    //从后往前，相邻比较，最小的浮到最前面
    flag= false //优化，如果已经是结果了，则提前停止冒泡
    for(let j=arr.length-1;j>=i;j--){
        if(arr[j-1]>arr[j]){
            swap(arr,j,j-1);
            flag = true
        }
    }
}
console.log(arr)
/**
 * 2 选择排序
 */
var arr = [9,1,5,8,3,7,6,4,2]
for(let i=0;i<arr.length;i++){
    for(let j=i+1;j<arr.length;j++){
        if(arr[j]<arr[i]){
            let t = arr[i]
            arr[i]=arr[j]
            arr[j]=t
        }
    }
}
console.log(arr)
/**
 * 3 插入排序
 */
var arr = [9,1,5,8,3,7,6,4,2]
var tmp,j
for(let i=1; i<arr.length; i++){
    if(arr[i]<arr[i-1]){
        tmp = arr[i]
        for(j=i-1; arr[j]>tmp;j--){
            arr[j+1]=arr[j]
        }
        arr[j+1]=tmp
    }
}
/**
 * 4 希尔排序
 */
var arr = [0,9,1,5,8,3,7,6,4,2]
var i,j,tmp
let increment=arr.length
do{
    increment=parseInt(increment/3)+1
    for(i=increment+1;i<arr.length;i++){
        if(arr[i]<arr[i-increment])
            arr[0]=arr[i]
            for(j=i-increment;j>0 && arr[0]<arr[j];j-=increment){
                arr[j+increment]=arr[j]
            }
            arr[j+increment]=arr[0]
    }
}
while(increment>1);
console.log(arr)