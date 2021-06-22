const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let data = {};

data.rey = "senhadorey"

app.get("/", (req, res) => {
    const ret = `
    <html>
        <form action="/" method="POST">
            <label>Username: </label>
            <input type="text" name="username" />
            <label>Password: </label>
            <input type="password" name="password" />
            <input type="hidden" name="id" value=1234 />
            <input type="submit" value="Enter" />
        </form>
    </html>`;
    res.send(ret)
});

app.post("/", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const ret = {};
    ret.token = `${new Date().getTime()}:${username}`
    res.setHeader('Content-Type', 'text/html')

    const result = `
    <html>
        <h1>Seja bem-vindo ${username}</h1>
        <form action="/" method="POST">
            <input type="text" name="action" />          
            <input type="hidden" name="session-id" value=${ret.token} />
            <input type="submit" value="Action" />
        </form>
    </html>`;

    return password === data[username] ? res.send(result) : res.send('Invalid Login')
});

app.listen(8080);