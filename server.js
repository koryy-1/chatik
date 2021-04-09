const http = require('http')
const path = require('path')
const fs = require('fs')
const WebSocket = require('ws')
const MongoClient = require('mongodb').MongoClient

const PORT = process.env.PORT || 80

const uri = 'sdlkngsdflkgndfslglnk'


let ONLINE = 0
let Msg = null
let checkAuth = null

let userListDB = null
let chatDB = null

const clientForDb = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function startdb() {
    // подсоединяемся к БД
    await clientForDb.connect()
    // записываем ссылки на таблицы (коллекции) в глобальные переменные
    userListDB = clientForDb.db().collection("users")
    chatDB = clientForDb.db().collection("chat")
    
}
startdb()

const server = http.createServer((req, res) => {
    const fixPath = (filename) => path.join(__dirname, filename)
    const readFile = (filename) => fs.readFileSync(fixPath(filename), 'utf-8')
    // switch(req.url) {
    //     case '/':
    //         // res.writeHead(200, { 'Content-Type': 'text/html' })
    //         res.end(readFile('/index.html'))
    //         console.log('zxc')
    //         break
    //     case '/theme.css':
    //         // res.writeHead(200, { 'Content-Type': 'text/css' })
    //         res.end(readFile(req.url))
    //         break
    //     case '/app.js':
    //         // res.writeHead(200, { 'Content-Type': 'text/javascript' })
    //         res.end(readFile(req.url))
    //         break
    //     default:
    //         res.writeHead(404, { 'Content-Type': 'text/plain' })
    //         res.end('404')
    // }
    
    try {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(readFile('/index.html'))
        } else {
            // console.log(req.url.split('.').pop())
            res.writeHead(200, { 'Content-Type': `text/${req.url.split('.').pop()}` })
            res.end(readFile(req.url))
        }
    } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end('<h1>404 not found(</h1>')
        // console.log(req.url.split('.').pop())
        // console.log(e)
    }
    // console.log(req.url)
    
}).listen(PORT, () => console.log('server up'))

const serverWs = new WebSocket.Server({ server })

serverWs.on('connection', async ws => {
    // ws.id = Math.random()
    ws.on('message', async message => {
        if (message === '') return
        
        Msg = JSON.parse(message)

        switch (Msg.type) {
            case 'message':
                //добавить проверку на наличие аккаунта
                await chatDB.insertOne({messageDb: Msg.message})
                serverWs.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message)
                    }
                })
                break

            case 'authorize':
                // console.log(Msg.user, Msg.password)
                // console.log(userListDB, 'qweqweqwe')
                checkAuth = await userListDB.findOne({
                    user: Msg.user, password: Msg.password
                })
                // const qwe = await userListDB.findOne({user: 'qwe111', password: 'qw13e'})
                // console.log(checkAuth)
                if (checkAuth) {
                    // console.log(userListDB)
                    ws.send(JSON.stringify({
                        type: 'authorize',
                        message: `<li>[SERVER]: <br />&#160;login success</li> <br />`,
                        authorized: true
                    }))
                } else {
                    if (Msg.cnt < 3) {
                        ws.send(JSON.stringify({
                            type: 'authorize',
                            message: `<li>[SERVER]: <br />&#160;takogo accaunta net</li> <br />`,
                            authorized: false
                        }))
                    } else {
                        ws.send(JSON.stringify({
                            type: 'authorize',
                            message: `<li>[SERVER]: <br />&#160;ty wo covcem tupoi????</li> <br />`,
                            authorized: false
                        }))
                    }
                    
                }
                break

            case 'register':
                checkAuth = await userListDB.findOne({
                    user: Msg.user, password: Msg.password
                })
                if (!checkAuth) {
                    await userListDB.insertOne({
                        user: Msg.user,
                        password: Msg.password
                    })
                    // console.log(userListDB)
                    ws.send(JSON.stringify({
                        type: 'register',
                        message: `<li>[SERVER]: <br />&#160;register success</li> <br />`,
                        authorized: true
                    }))
    
                } else {
                    ws.send(JSON.stringify({
                        type: 'register',
                        message: `<li>[SERVER]: <br />&#160;kakaya-to xuevaya registraciya</li> <br />`
                    }))
                }
                break

            case 'changeName':
                checkAuth = await userListDB.findOne({
                    user: Msg.user, password: Msg.password
                })
                
                // console.log(checkAuth)
                if (checkAuth) {
                    // console.log('old nick: ' + checkAuth,'\n new nick: ' + Msg.nick)
    
                    await userListDB.findOneAndUpdate(
                        {user: Msg.user, password: Msg.password},
                        { $set: {user: Msg.nick}},
                        function (err, result) {
                            if (err) {throw err}
                            console.log('old result: ', result)
                        }
                    )
                    // console.log(checkAuth)
                    ws.send(JSON.stringify({
                        type: 'changeName',
                        message: `<li>[SERVER]: <br />&#160;nickname changed</li> <br />`,
                        success: true
                    }))
                } else {
                    ws.send(JSON.stringify({
                        type: 'changeName',
                        message: `<li>[SERVER]: <br />&#160;4to-to ne to(</li> <br />`,
                        success: false
                    }))
                }
                break
        }
    })

    // console.log(chatDB)
    await chatDB.find().toArray(function(error, entries) {
        let msgs = []
        if (error) {throw error}
        entries.forEach(function (entry){
            // console.log(entry)
            msgs.push(entry.messageDb)

            // entry.type = 'bdMsg';
            // ws.send (JSON.stringify(entry));
        })
        ws.send(JSON.stringify({
            type: 'bdMsg',
            message: JSON.stringify(msgs)
        }))
    })
    // let msg = await chatDB.findOne({})
    // console.log(msg)
    
    // ws.send(JSON.stringify({
    //     type: 'bdMsg',
    //     message: JSON.stringify(msg)
    // }))
    // }
    // checkNewMsg()

    ONLINE++
    serverWs.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'online',
			    message: ONLINE
            }))
            // client.send(JSON.stringify(userListDB))
        }
    })
    ws.on('close', () => {
        // let index = userListDB.indexOf(ws.id) // fix
        // userListDB.splice(index)
        ONLINE--
        serverWs.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'online',
                    message: ONLINE
                }))
                // client.send(JSON.stringify(userListDB))
            }
        })
    })

})
