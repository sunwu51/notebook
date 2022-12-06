import {express,readJSONFromURL} from "./deps.js";
const app = express();
app.get("/", async function (req, res) {
    const data = await readJSONFromURL('https://jsonplaceholder.typicode.com/comments');
    res.send(data);
});

app.listen(3000);
console.log("listening on http://localhost:3000/");