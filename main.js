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
            compress: true
        },
        errorlog: {
            type: 'dateFile',
            filename: 'error.log',
            pattern: "-yyyyMMdd",
            backups: 14,
            compress: true
        }
    },
    categories: {
        default: { appenders: ['chatlog', 'errorlog'], level: 'all' },
    }
})
var logger = log4js.getLogger('chatlog')
var error_logger = log4js.getLogger('errorlog')

const http = require('http').createServer(app)
const io = require('socket.io')(http)

var youtubeChat = {}

io.on('connection', (socket) => {
    logger.info(socket.id + " is connecting.")
    console.log("Started!", socket.id);
    socket.on('event', () => { })
    socket.on('begin', (v) => {
        if (v.match(/[^"&?\/\s]{11}/)) {
            logger.info(`${socket.id} via ${socket.handshake.headers["x-forwarded-for"]} begin to receive chat. ( https://youtu.be/${v} )`)
            console.log('videoId: ' + v)
            youtubeChat[socket.id] = new LiveChat({ liveId: v })
            youtubeChat[socket.id].on('chat', (msg) => {
                io.to(socket.id).emit('comment', msg)
            })
            youtubeChat[socket.id].on('error', (err) => {
                error_logger.warn(`YouTube Chat Error: ${err}`)
                try {
                    youtubeChat[socket.id].stop()
                } catch (e) {
                    error_logger.error(e)
                } finally {
                    delete youtubeChat[socket.id]
                    logger.info(`Current Connections: [${Object.keys(youtubeChat)}]`)
                }
            })
            youtubeChat[socket.id].start()
        }
    })
    socket.on('disconnect', () => {
        console.log("Stopped!", socket.id)
        logger.info(`${socket.id} diconnected.`)
        try {
            youtubeChat[socket.id].stop()
        } catch (e) {
            error_logger.warn(e)
        } finally {
            delete youtubeChat[socket.id]
            logger.info(`Current Connections: [${Object.keys(youtubeChat)}]`)
        }
    })
    socket.on('error', (err) => {
        error_logger.error("Error: ", err)
    })
})

http.listen(3000)