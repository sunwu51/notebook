export function merge(promises) {
    var cnt = 0;
    var res = []
    return new Promise((t, c) => {
        for(var i=0; i<promises.length; i++){
            var pro = promises[i];
            let j = i;
            pro.then(x=>{
                res[j] = x;
            }).catch(e=>{})
            .finally(()=>{
                cnt++;
                if(cnt == promises.length){
                    t(res);
                }
            });
        }
    })
}