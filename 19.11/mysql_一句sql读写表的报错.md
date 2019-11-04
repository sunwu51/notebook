# 一句sql读写同一个表报错
```sql
update `region` set is_del =1 where area_id in ( SELECT area_id from xxx where area_id=1)
```
```
You can't specify target table 'xxx' for update in FROM clause
```
这个报错的原因是，尝试先查表，根据查的信息作为条件去写表。这样的语句mysql直接不允许，这是因为有可能会出现，更新了一条后，后面的条件选出的结果集就变化了。通俗讲就是读提供了写的条件，写又影响了读的结果。
# 解决方法
读完放到一个缓存表中，此时缓存表是单独的一份副本不会被写影响
```sql
update `region` set is_del =1 where area_id in (select t.area_id from ( SELECT area_id from xxx where area_id=1) as t)
```