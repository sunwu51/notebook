---
title: git hook
date: 2024-10-03 21:41:00+8
tags:
    - git
    - hook
---
我想要在`github`准确的说是`git`提交的时候，判断以`ADD` `FIX` `FEAT` `UPDATE`等关键字开头的提交消息，分别在前面增加一个`emoji`，下面是ai提示出来的
- ✨ ADD
- 🐛 FIX
- 🚀 FEAT
- ⬆️ UPDATE

`claude`给我的回答是这样：
```bash
# 我发现.git/hooks/commit-msg.sample有个示例
$ touch .git/hooks/commit-msg
$ chmod +x .git/hooks/commit-msg
```
编辑文件`vim .git/hooks/commit-msg`，添加以下内容：
```sh
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import re

def main():
    commit_msg_file = sys.argv[1]
    with open(commit_msg_file, 'r', encoding='utf-8') as f:
        commit_msg = f.read()

    if re.match(r'^[Aa][Dd][Dd]', commit_msg):
        with open(commit_msg_file, 'w', encoding='utf-8') as f:
            f.write(f"✨ {commit_msg}")
    
    if re.match(r'^[Ff][Ii][Xx]', commit_msg):
        with open(commit_msg_file, 'w', encoding='utf-8') as f:
            f.write(f"🐛 {commit_msg}")
    
    if re.match(r'^[Ff][Ee][Aa][Tt]', commit_msg):
        with open(commit_msg_file, 'w', encoding='utf-8') as f:
            f.write(f"🚀 {commit_msg}")

    if re.match(r'^[Uu][Pp][Dd][Aa][Tt][Ee]', commit_msg):
        with open(commit_msg_file, 'w', encoding='utf-8') as f:
            f.write(f"⬆️ {commit_msg}")

if __name__ == "__main__":
    main()
```