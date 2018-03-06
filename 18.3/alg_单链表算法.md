# 单向链表算法小结
# 1 反转
记录当前节点和前一个节点，将当前节点的next指向前一个节点。前一个节点指向当前节点，当前节点指向下一个节点。
```
public static Node reverseList(Node head) {
    if (head == null || head.next == null) {
      return head;
    }
    Node reHead = null;// 定义新链表头结点
    while (head != null) {
      Node tmp = head.next;// 记录下一个节点
      head.next = reHead;// 将rehead节点连接到head节点上
      reHead = head;// 让rehead指向head
      head = tmp;// 将head指向下一个节点
    }
    return reHead;
}
```
# 2 双指针追及
## 2.1 找倒数第k个元素
p先走k步，q再走，p走到头，则q离最后还有k步，q就是倒数第k个。
## 2.2 找最中间的元素
p、q同时走，p步幅1 q步幅2，q到头，p到中间。(注意步幅为2的到头可能是走一步到了null)
## 2.3 判断是否有环
和2.2的走法一样，如果有环则两者一定会相遇，否则遇到null退出
## 2.4 环入口查找
p、q分别从头，和从碰撞点(刚才1倍2倍相遇点)开始走，再次相遇的点是连接点
# 3 删除节点
若已知前一节点，则将前一节点.next=前一节点.next.next;  
若只知道要删除节点，则该节点.val=该节点.next.val,该节点.next=该节点.next.next
若是要求删除数据重复的邻接点，则遍历判断 node.val==node.next.val，如果true则将node.next指向next的next
若是要求删除数据重复的所有节点的副本，则利用一个HashSet存储，并遍历，看是否已经存在，存在则删除。
# 4 合并两个有序链表
p、q两个指针分别指向两链表第一个元素，将较小的取出，然后指向next。这个较小的追加到新链表中。直到有一个链表遍历到头了，就把另一个直接追加过来
# 5 两个链表是否相交
方法1：将一个链表所有元素全部存入Set，遍历第二个看是否Set中已经含有。
方法2：将两个链表接起来，看是否有环

