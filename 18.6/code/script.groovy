def res= new HashMap<String,Integer>()
new File('a.js').text.eachLine {
    line-> line.split(' ').each {
        if(res.get(it))
            res.put(it,res.get(it)+1)
        else
            res.put(it,1)
    }
}
res.each { println(it) }