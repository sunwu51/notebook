# git分支相关指令
```bash
# 新建分支b1（在当前分支基础上创建的）
git branch b1

# 在b1分支的基础上新建b2分支
git branch b2 b1

# 转到分支b1
git checkout b1

# 当前分支上新建分支b1，并直接转到b1分支上
git checkout -b b1  

# 在b1分支上新建b2分支，并直接转到b2（和branch指令的顺序反）
git checkout b1 -b b2

# 删除b1分支
git branch -d b1

# 合并b1分支到当前分支
git merge b1
```
## 合并冲突的解决
```bash
git merge b1
Auto-merging 1.txt
CONFLICT (content): Merge conflict in 1.txt
Automatic merge failed; fix conflicts and then commit the result.
```
merge后提示冲突，此时会将冲突的文件部分进行重写，格式为
```
<<<<<<< HEAD
Creating a new branch is quick & simple.
=======
Creating a new branch is quick AND simple.
>>>>>>> b1
```
只需要改为想要的结果，可以是任意其中一个，也可以是一个新的写法。然后commit即可解决冲突。
## git log
用树状图的方式简洁的查看提交瀑布图
```
git log --graph --pretty=oneline --abbrev-commit
```