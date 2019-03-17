function partition(a,lo,hi){
	var pivot = a[hi];
	var j = hi-1;
	for(var i=lo;i<=j;i++){
		if(a[i]>=pivot){
        	swap(a,i,j);
			i--;
			j--;
		}
    }
    if(a[i]>=a[hi]){
        swap(a,hi,i);
    }
    return i;
    //返回分界，pivot的位置
}
function swap(a,i,j){
    var t= a[i];
    a[i]=a[j];
    a[j]=t;
}
function sort(a,lo,hi){
    if(lo>=hi)return;
    var p = partition(a,lo,hi);
    sort(a,lo,p-1);
    sort(a,p+1,hi);   
}

var a= [5, 6, 3, 2, 6, 7, 8, 1, 9, 4]
sort(a,0,a.length-1)

