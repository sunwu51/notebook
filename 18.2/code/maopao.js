function swap(arr, i, j) {
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

/**
 *  1  冒泡排序 
 */
var arr = [9, 1, 5, 8, 3, 7, 6, 4, 2]
var flag = true
for (let i = 0; i < arr.length && flag; i++) {
    //从后往前，相邻比较，最小的浮到最前面
    flag = false //优化，如果已经是结果了，则提前停止冒泡
    for (let j = arr.length - 1; j >= i; j--) {
        if (arr[j - 1] > arr[j]) {
            swap(arr, j, j - 1);
            flag = true
        }
    }
}
console.log(arr)
/**
 * 2 选择排序
 */
var arr = [9, 1, 5, 8, 3, 7, 6, 4, 2]
for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] < arr[i]) {
            let t = arr[i]
            arr[i] = arr[j]
            arr[j] = t
        }
    }
}
console.log(arr)
/**
 * 3 插入排序
 */
var arr = [9, 1, 5, 8, 3, 7, 6, 4, 2]
var tmp, j
for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
        tmp = arr[i]
        for (j = i - 1; arr[j] > tmp; j--) {
            arr[j + 1] = arr[j]
        }
        arr[j + 1] = tmp
    }
}
console.log(arr)
/**
 * 4 希尔排序
 */
var arr = [ 9, 1, 5, 8, 3, 7, 6, 4, 2]
var gap, i, j;
var temp;
for (gap = arr.length >> 1; gap > 0; gap >>= 1){
    for (i = gap; i < arr.length; i++) {
        temp = arr[i];
        for (j = i - gap; j >= 0 && arr[j] > temp; j -= gap)
            arr[j + gap] = arr[j];
        arr[j + gap] = temp;
    }
}
console.log(arr)
/**
 * 5 堆排序
 */
/**
 * 6 归并排序
 */
var arr = [ 9, 1, 5, 8, 3, 7, 6, 4, 2]
Array.prototype.merge_sort = function() {
	var merge = function(left, right) {
		var final = [];
		while (left.length && right.length)
			final.push(left[0] <= right[0] ? left.shift() : right.shift());
		return final.concat(left.concat(right));//当left或right中一个长度为0的时候，直接连接起来
	};
	var len = this.length;
	if (len < 2) return this;
	var mid = len / 2;
	return merge(this.slice(0, parseInt(mid)).merge_sort(), this.slice(parseInt(mid)).merge_sort());
};
console.log(arr.merge_sort())
/**
 * 7 快速排序
 */
Array.prototype.quick_sort = function() {
	var len = this.length;
	if (len <= 1)
		return this.slice(0);
	var left = [];
	var right = [];
	var mid = [this[0]];
	for (var i = 1; i < len; i++)
		if (this[i] < mid[0])
			left.push(this[i]);
		else
			right.push(this[i]);
	return left.quick_sort().concat(mid.concat(right.quick_sort()));
};

var arr = [5, 3, 7, 4, 1, 9, 8, 6, 2];
arr = arr.quick_sort();
