const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const messages = []

const hackers = []

const users = [
    {
        "username": "rey",
        "password": "123456789",
        "token": undefined,
        "admin": true
    },
    {
        "username": "user1",
        "password": "123456",
        "token": undefined,
        "admin": false
    },
    {
        "username": "user2",
        "password": "1234",
        "token": undefined,
        "admin": false
    }
]

const ret = {}

ret.header = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Session Control</title>
        <link rel="stylesheet" href="styles.css" type="text/css">
    </head>`

ret.homePage = `
    ${ret.header}
    <body>
    <form action="/" method="POST">
        <p>
            <label for="username">Username: </label>
            <input type="text" name="username" id="username" />
        </p>
        <p>
            <label for="password">Password: </label>
            <input type="password" name="password" id="password" />
        </p>
        <input class="submit" type="submit" value="Entrar" />
    </form>
    </body>
</html>`

ret.userErrorPage = `
${ret.header}
    <body>
        <div>
            <h1>Usuário não encontrado</h1>
            <form action="/" method="GET">
                <input class="submit" type="submit" value="Voltar" />
            </form>
        </div>
    </body>
</html>`

ret.tokenErrorPage = `
${ret.header}
    <body>
        <div>
            <h1>Token Inválido</h1>
            <form action="/" method="GET">
                <input class="submit" type="submit" value="Voltar" />
            </form>
        </div>
    </body>
</html>`

app.use('/styles.css', express.static(path.join(__dirname, "/styles.css")));

app.get("/", (req, res) => res.send(ret.homePage));

app.post("/", (req, res) => {

    res.setHeader('Content-Type', 'text/html')

    const username = req.body.username.toLowerCase();
    const password = req.body.password;

    const userFilter = users.filter(data => data.username === username && data.password === password)
    const user = userFilter[0]

    if (!user) {
        res.send(ret.userErrorPage)
        return false
    }


    if (!user.token) {
        const findUserToken = users.findIndex(value => value === user);
        users[findUserToken].token = `${new Date().getTime()}:${username}`
        console.log(users);
    }

    const result = {}

    result.title = `<h2>Seja bem-vindo <span class="user">${username}</span ></h2>`

    let message = ''

    for(let i = 0; i < messages.length; i++) {
        message += `
            <tr>
                <td>${messages[i].username}</td>
                <td>${messages[i].message}</td>
            </tr>` 
    }

    result.adminPage = `
    ${ret.header}
        <body>
            <div>
                <h1>Página do administrador</h1>
                ${result.title}
                <table>
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Mensagem</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${message}
                    </tbody>
                </table>
            </div>
        </body>
    </html> `;

    result.userPage = `
    ${ret.header}
        <body>
            <div>
                <h1>Página do usuário</h1>
                ${result.title}
                <form id="logout" action="/logout" method="POST">
                    <input type="hidden" name="session" value=${user.token} />
                    <input class="btn-logout" type="submit" value="Logout" />
                </form>
                <form class="pages-form" action="/message" method="POST">
                    <input type="hidden" name="username" value=${username} />
                    <p class="textarea-content">
                        <label for="sub-message">Mensagem: </label>
                        <textarea id="sub-message" rows="10" cols="30" name="message"></textarea>
                    </p>
                    <input type="hidden" name="session" value=${user.token} />
                    <input class="submit" type="submit" value="Enviar" />
                </form>
            </div>
        </body>
    </html> `;

    return user.admin ? res.send(result.adminPage) : res.send(result.userPage)
});

app.post("/message", (req, res) => {
    res.setHeader('Content-Type', 'text/html')

    const username = req.body.username;
    const message = req.body.message;
    const session = req.body.session;
    const newMessage = { username, message, session }

    const userFilter = users.filter(data => data.token === session)
    const user = userFilter[0]

    if (!user) {
        hackers.push(newMessage)
        console.log('hackers', hackers)
        res.send(ret.tokenErrorPage)
        return false
    }

    messages.push(newMessage)

    const finishPage = `
    ${ret.header}
        <body>
            <div>
                <h1>Mensagem Enviada!<br />Responderemos em breve</h1>
                <form action="/" method="GET">
                    <input class="submit" type="submit" value="Voltar" />
                </form>
            </div>
        </body>
    </html>`
    console.log('messages',messages)
    res.send(finishPage)
});

app.post("/logout", (req, res) => {
    res.setHeader('Content-Type', 'text/html')

    const sessionToken = req.body.session

    const userFilter = users.filter(data => data.token === sessionToken)
    const user = userFilter[0]

    if (!user) {
        hackers.push(sessionToken)
        console.log('hackers', hackers)
        res.send(ret.tokenErrorPage)
        return false
    }

    const findUserToken = users.findIndex(value => value === user);
    users[findUserToken].token = undefined

    console.log('users',users);

    res.send(ret.homePage)
});

app.listen(8080);