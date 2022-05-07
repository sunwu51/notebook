export class TrieNode {
  constructor() {
      this.value = undefined;
      this.isEnd = false;
      this.arr = {};
  }
}
export class TrieTree {

  constructor() {
      this.root = new TrieNode();
  }

  insert(word, value) {
      let node = this.root;
      for (let i = 0; i < word.length; i++) {
          const index = word[i];

          if (!node.arr[index]) {
              const temp = new TrieNode();
              node.arr[index] = temp;
              node = temp;
          } else {
              node = node.arr[index];
          }
      }
      node.isEnd = true;
      node.value = value;
  }

  getRoot() {
      return this.root;
  }

  startsWith(prefix) {
      const node = this.searchNode(prefix);
      if (node == null) {
          return [];
      } else {
          var res = [] 
          this.printStrings(node, prefix, res);
          return res;
      }
  }

  printStrings(node, prefix, result) {
      if (node.isEnd) result.push(prefix);
      for (var i in node.arr) {
          if (node.arr[i] !== null) {
              const character = i;
              this.printStrings(node.arr[i], prefix + "" + (character), result);
          }
      }
  }

  searchNode(str) {
      let node = this.root;
      for (let i = 0; i < str.length; i++) {
          const index = str[i];
          if (node && node.arr[index] !== null) {
              node = node.arr[index];
          } else {
              return null;
          }
      }

      if (node === this.root)
          return null;

      return node;
  }

  parseText(text){
      if(!text){
          return null;
      }
      
      for(var i=0; i<text.length; i++){
          var node = this.root;
          var str = ""
          for(var j=i; j<text.length; j++){
              if(node.arr[text[j]]){
                  str += text[j]
                  node = node.arr[text[j]]
                  if(node.isEnd){
                      console.log({position:i, str, value: node.value})
                  }
              }else{
                  break;
              }  
          }
      }

  }
}