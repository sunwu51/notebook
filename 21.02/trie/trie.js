class TrieNode {
    constructor() {
        this.value = undefined;
        this.isEnd = false;
        this.arr = {};
    }
}
class TrieTree {

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
            return false;
        } else {
            this.printStrings(node, prefix);
            return true;
        }
    }

    printStrings(node, prefix) {
        if (node.isEnd) console.log(prefix);
        for (var i in node.arr) {
            if (node.arr[i] !== null) {
                const character = i;
                this.printStrings(node.arr[i], prefix + "" + (character));
            }
        }
    }

    searchNode(str) {
        let node = this.root;
        for (let i = 0; i < str.length; i++) {
            const index = str[i];
            if (node.arr[index] !== null) {
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


// 使用
var trie = new TrieTree()
trie.insert("吴孟达","一位伟大的配角演员")
trie.insert("吴孟达去世","这是非常令人遗憾的事情")
trie.insert("吴京","一位功夫演员")
trie.insert("周星驰","最受人喜爱的喜剧演员")

trie.startsWith('吴')
trie.searchNode('吴孟达')
trie.parseText('昨日，吴孟达去世，周星驰表示哀悼')