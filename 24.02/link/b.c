int shared = 1;
void swap(int* a, int* b) {
     // 不用额外空间进行swap的代码
     *a ^= *b ^= *a ^= *b;
}