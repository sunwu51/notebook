res={}
for sentence in open('a.js').read().split():
    for word in sentence.split():
        if  word in res.keys():
            res[word]=res[word]+1
        else:
            res[word]=0
print res