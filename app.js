const status = document.getElementById('status')
const message = document.getElementById('message')
const form = document.getElementById('form')
const input = document.getElementById('input')

const nick1 = document.getElementById('nick1') // login
const paswrd1 = document.getElementById('paswrd1')

const nick2 = document.getElementById('nick2') // register
const paswrd2 = document.getElementById('paswrd2')

const block = document.getElementById('block') // soobweniya

const modal1 = document.getElementById('openModal1')
const modal2 = document.getElementById('openModal2')

const nickSpace = document.getElementById('nickSpace') // div s nickom
const modal3 = document.getElementById('openModal3')
const nick = document.getElementById('nick')

const sidebar = document.getElementById('sidebar')
const buttonForSidebar = document.getElementById('buttonForSidebar')
const sidebarSpace = document.getElementById('sidebarSpace')
const inputImage = document.getElementById('oboi')

const butLog = document.getElementById('butLog')
const butReg = document.getElementById('butReg')
const butLogout = document.getElementById('butLogout')

const HOST = location.origin.replace(/^http/, 'ws')
let ws

let isLogined = false

const B_Herrington = 'https://www.shitpostbot.com/img/sourceimages/bill-herrington-5920aa9d56a30.jpeg'

// let timeout
let nickName, user = ''
let password = ''
let cnt = 0

function newConnect(HOST) {
    ws = new WebSocket(HOST)

    ws.onopen = () => {
        console.log(user, password)
        ws.send(JSON.stringify({
            type: 'authorize',
            user: user,
            password: password,
            cnt: cnt
        }))
        setStatus('ONLINE')
    }
    ws.onmessage = response => printMessage(response.data)

    ws.onclose = () => {
        setStatus('DISCONNECTED, try to reconnect...')
        setTimeout(() => {
            newConnect(HOST)
        }, 5000)
    }
}

console.log(isLogined)
if (localStorage.getItem('isLogined')) {
    butLog.style.display = butReg.style.display = "none"
    butLogout.style.display = "block"
    isLogined = true
    nickName = localStorage.getItem('nickName')
    user = localStorage.getItem('user')
    password = localStorage.getItem('password')
    
    nickSpace.innerHTML = nickName + ' [change]'
}
// console.log(user, password)

newConnect(HOST)


function setStatus(value) {
    status.innerHTML = value
}

function printMessage(value) {
    value = JSON.parse(value)
    
    switch (value.type) {
        case 'bdMsg':
            message.innerHTML = JSON.parse(value.message).join('')
            block.scrollTop = block.scrollHeight
            break
        case 'online':
            setStatus(`ONLINE - ${value.message}`)
            break
        case 'message':
            scrollBlock(value.message)
            break
        case 'authorize':
            if (value.authorized) {
                isLogined = true
                cnt = 0
                localStorage.setItem('isLogined', isLogined)
                nickSpace.innerHTML = nickName + ' [change]'
    
                butLog.style.display = butReg.style.display = "none"
                butLogout.style.display = "block"
            } else {
                isLogined = false
                if (cnt == 3) {
                    cnt = 0
                } else {
                    cnt++
                }
                nickSpace.innerHTML = ' [change]'
    
                butLog.style.display = butReg.style.display = "block"
                butLogout.style.display = "none"
            }
            
            scrollBlock(value.message)
            break
        case 'register':
            if (value.authorized) {
                isLogined = true
                localStorage.setItem('isLogined', isLogined)
                nickSpace.innerHTML = nickName + ' [change]'
    
                butLog.style.display = butReg.style.display = "none"
                butLogout.style.display = "block"
            }
            
            scrollBlock(value.message)
            break
        case 'changeName':
            if (value.success) {
                user = nickName
                localStorage.setItem('nickName', nickName)
                localStorage.setItem('user', user)
                nickSpace.innerHTML = nickName + ' [change]'
            } else {
                isLogined = false
                
                nickSpace.innerHTML = ' [change]'
    
                butLog.style.display = butReg.style.display = "block"
                butLogout.style.display = "none"
            }
            
            scrollBlock(value.message)
            break
    }
}

function scrollBlock(value) {
    if (block.scrollTop === block.scrollHeight - block.offsetHeight) {
        message.innerHTML += value
        block.scrollTop = block.scrollHeight
    } else {
        message.innerHTML += value
    }
}

function displayModal() {
    modal1.style.display = "block"
    nick1.focus()
}

function displayModalReg() {
    if (!isLogined) {
        modal2.style.display = "block"
        nick2.focus()
        
    }
}

function closeModal() {
    if (modal1.style.display == "block") {
        nickName = nick1.value
        user = nick1.value
        password = paswrd1.value
        modal1.style.display = "none"
    } else if (modal2.style.display == "block") {
        nickName = nick2.value
        user = nick2.value
        password = paswrd2.value
        modal2.style.display = "none"
    } else if (modal3.style.display == "block") {
        nickName = nick.value
        modal3.style.display = "none"
    } else {
        sidebarSpace.style.display = 'none'
        sidebar.style.cssText = null
    }
    
    localStorage.setItem('nickName', nickName)
    localStorage.setItem('user', user)
    localStorage.setItem('password', password)
    input.focus()
}




if (localStorage.getItem('urlImage')) {
    setBackgroundImage(localStorage.getItem('urlImage'))
}

if (!isLogined) {
    butLog.style.display = butReg.style.display = "block"
    butLogout.style.display = "none"
    displayModal()
}

setInterval(() => {
    if (ws.readyState == ws.OPEN) {
        ws.send('')
        // console.log('qwe')
    }
}, 30000)


//================================== listeners ============================

 function login(event) {
    event.preventDefault()
    if (nick1.value && paswrd1.value) {
        closeModal()
        if (user === 'gay') {
            setBackgroundImage(B_Herrington)
        }
        ws.send(JSON.stringify({
            type: 'authorize',
            user: user,
            password: password,
            cnt: cnt
        }))
    }
    
}

 function register(event) {
    event.preventDefault()
    if (nick2.value && paswrd2.value) {
        closeModal()
        if (user === 'gay') {
            setBackgroundImage(B_Herrington)
        }
        ws.send(JSON.stringify({
            type: 'register',
            user: user,
            password: password
        }))
    }
    
}


function logout() {
    isLogined = false
    localStorage.removeItem('isLogined')
    localStorage.removeItem('nickName')
    localStorage.removeItem('user')
    localStorage.removeItem('password')
    nickSpace.innerHTML = ' [change]'
    butLog.style.display = butReg.style.display = "block"
    butLogout.style.display = "none"
}

function checkLoginState() {
    if (!isLogined) return displayModal()
}

function displayModalWithNickname() {
    if (!isLogined) return displayModal()

    nick.value = nickName
    modal3.style.display = "block"
    nick.focus()
}

function changeNickname(event) {
    event.preventDefault()
    if (nick.value) {
        closeModal()
        ws.send(JSON.stringify({
            type: 'changeName',
            nick: nickName,
            user: user,
            password: password
        }))
    }  
}

window.addEventListener('click', event => {
    if (event.target == modal1 || event.target == modal2 || event.target == modal3 || event.target == sidebarSpace) {
        closeModal()
    }
})

function setBackgroundImage(value) {
    inputImage.value = value
    localStorage.setItem('urlImage', value);
    
    document.body.style.background = `url(${value})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
}

function displaySidebarForSmartphones() {
    sidebar.style.display = "block"
    sidebarSpace.style.display = "block"
    // console.log(sidebar.className)
}

form.addEventListener('submit', event => {
    event.preventDefault()
    if (!isLogined) return displayModal()

    if (input.value && ws.readyState == ws.OPEN) {
        let now = new Date().toLocaleString().slice(0,-3)
        
        let msg = `<li>[${user}]: ${now} <br />&#160;${input.value}</li> <br />` ///////////////date = new Date
        ws.send(JSON.stringify({
            type: 'message',
			message: msg,
			from: nickName
        }))
        input.value = ''
        if (block.scrollTop !== block.scrollHeight - block.offsetHeight) {
            block.scrollTop = block.scrollHeight
        }
    }
    
})

// block.addEventListener("scroll", () => {
//     clearTimeout(timeout)
//     console.log(123++)
//     timeout = setTimeout(() => {
//       console.log("Вы остановились.");
//     }, 200)
// })