var fs=require('fs')

var m={};
var htstr="";

process.argv.forEach(function (val, index, array) {
    // val : ./18.1/xx.html
    // arr: [".","18.1","xx.html"]
    var arr=val.split('/')
    if(arr.length==3){
        if(!m[arr[1]])m[arr[1]]=[];
        m[arr[1]].push({txt:arr[2],href:val});   
    }
});
/*
 m:{
     '18.1':[{txt:xxx.html,href:'./18.1/xx.html'},{...}],
     '18.2':...
 }
*/

// sort keys to '18.1','18.2','18.3'..'18.10','18.11'..'19.01'
var keys = Object.keys(m).sort((a,b)=>{return parseInt(a.replace('.',''))-parseInt(b.replace('.',''))})
var yearSet = {};

for(var i=0;i<keys.length;i++){
    // get year and month [18,1]
    var date = keys[i].split('.')
    if(!yearSet[date[0]])yearSet[date[0]]=[];
    yearSet[date[0]].push(keys[i])
}
// finally, yearSet = {'18':['18.1','18.2'...],'19':['19.01','19.02'...],...}

var labelstr ="";
var sectionstr = "";
for(var year in yearSet){
    var index = parseInt(year)-17;
    labelstr += 
    `
        <input id="tab${index}" type="radio" name="tabs" checked>
        <label for="tab${index}">20${year}</label>
    
    `;
    // ks: [18.1,18.2...]
    var ks = yearSet[year];
    var content = ""
    for(var it in ks){
        // <h3><b>18.1</b></h3>
        var str="   <h3><b>"+ks[it]+"</b></h3><hr/>"
        var tmp=m[ks[it]]
        for(var i in tmp){
            str+=
            `
            <p><a href='${tmp[i]["href"]}'>${tmp[i]["txt"]}</a></p>
            `
        }
        content +=str;
    }
    content = 
    `
    <section id="content${index}">
        <h3>目录</h3>
        `+
        content+
    `
    </section>

    `;
    sectionstr+=content;
}



htstr="<div id=\"content\" class=\"container\">\n"+labelstr+sectionstr+"\n</div>"
fs.writeFileSync('./index.html',fs.readFileSync('./index.html').toString().replace(/<div id="content"([\s\S])*\/div>/gm,htstr));
