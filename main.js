const express = require('express')
const LiveChat = require('youtube-chat').LiveChat
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const log4js = require('log4js')
app.use(cors())
app.use(helmet())

log4js.configure({
    appenders: {
        chatlog: { 
            type: 'dateFile', 
            filename: 'youtube-chat.log',
            pattern: "-yyyyMMdd",
            backups: 14,
            compress: true}
    },
    categories: {
        default: { appenders: ['chatlog'], level: 'info' },
    }
})
var logger = log4js.getLogger('chatlog')

const http = require('http').createServer(app)
const io = require('socket.io')(http)

var youtubeChat = {}

io.on('connection', (socket) => {
    logger.info(socket.id+" is connecting.")
    console.log("Started!", socket.id);
    socket.on('event', () => { })
    socket.on('begin', (v) => {
        if (v.match(/[^"&?\/\s]{11}/)) {
            logger.info(`${socket.id} begin to receive chat. (${v})`)
            console.log('videoId: ' + v)
            youtubeChat[socket.id] = new LiveChat({ liveId: v })
            youtubeChat[socket.id].on('comment', (msg) => {
                io.to(socket.id).emit('comment', msg)
            })
            youtubeChat[socket.id].on('error', (err)=> {
                logger.info(`YouTube Chat Error: ${err}`)
                youtubeChat[socket.id].stop()
                delete youtubeChat[socket.id]
                logger.info(`Current Connections: [${Object.keys(youtubeChat)}]`)
            })
            youtubeChat[socket.id].start()
        }
    })
    socket.on('disconnect', () => {
        console.log("Stopped!", socket.id)
        if (typeof youtubeChat[socket.id] != "undefined") {
            logger.info(`${socket.id} diconnected.`)
            youtubeChat[socket.id].stop()
            delete youtubeChat[socket.id]
        }
        logger.info(`Current Connections: [${Object.keys(youtubeChat)}]`)
    })
    socket.on('error', (err)=>{
        logger.error("Error: ", err)
    })
})

http.listen(3000)