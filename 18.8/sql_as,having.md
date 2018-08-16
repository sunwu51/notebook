# sql
# 1 as
as的作用是设置别名，可以用于字段也可以用于表：
```sql
select id as i,age as a from student as t1;
```
用于字段时，**where中不能用别名，但order和group中可以**.
```sql
-- 错误
select id as i from student where i>1;

-- 正确
select id as i from student group by i order by i;
```
用于表时，一般单个表没必要，所以常用于关联查询
```sql
select * from student as t1 join claz as t2
  on t1.clazid=t2.id
```

