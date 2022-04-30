/// <reference types="cypress" />

context('youdao', async ()=>{
  let jq = Cypress.$;
  let getText = async (node) => {
    return await new Promise((t,c) => {
      node.invoke('text').then(t)
    })
  }
  
  it('v', async ()=>{

    let wordList = ['like', 'love', 'obvious']//await new Promise((t,_) => cy.readFile('cypress/COCA_20000.txt').then(t))

    // wordList = wordList.split('\n')

    wordList.forEach(async word => {
      let data = {}
      
      cy.visit(`https://youdao.com/w/${word}/`)
      
      let keyword = await getText(cy.get('.keyword'))
      
      if (word != keyword) {
        return
      } 

      let phonetic = ''
      
      var phs = jq('.baav .phonetic');
      if (phs.length == 1) {
        phonetic = phs[0].innerText
      } else if (phs.length == 2){
        phonetic = phs[1].innerText
      }
      

      // cy.writeFile('cypress/1.json', t)
      let explains = []

      jq('#phrsListTab .trans-container li').each((i,n) =>{
        explains.push(n.innerText)
      })

      let wordGroup = []
      jq("#wordGroup2 p").each((_,n) => {
        wordGroup.push(n.innerText.trim().replaceAll(/[\n]/gm,'').replaceAll(/ +/gm,' '))
      })

      let sentences = []
      
      jq('#bilingual li').each((_,n) => {
        var s = {};
        var ps = jq(n).find('p[class!=example-via]')
        var len = ps.length;
        if(len%2!=0) len--;

        for(var x=0; x<len; x+=2){
          sentences.push({en: ps[x].innerText, cn: ps[x+1].innerText})
        }
      })
      data = {word, phonetic, wordGroup, sentences}
      cy.writeFile(`cypress/words/${word}.json`, data)  

    })
  })
})