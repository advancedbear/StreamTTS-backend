const express = require('express');
const LiveChat = require('youtube-chat').LiveChat
const app = express();
const cors = require('cors');
const helmet = require('helmet');
app.use(cors());
app.use(helmet())

const http = require('http').createServer(app)
const io = require('socket.io')(http);

var youtubeChat = {};

io.on('connection', (socket) => {
    console.log("Started!", socket.id);
    socket.on('event', ()=>{})
    socket.on('begin', (v) => {
        if(v.match(/[^"&?\/\s]{11}/)){
            console.log('videoId: ' + v);
            youtubeChat[socket.id] = new LiveChat({liveId: v})
            youtubeChat[socket.id].on('comment', (msg)=>{
                io.to(socket.id).emit('comment', msg);
            })
            youtubeChat[socket.id].start()
        }
    });
    socket.on('disconnect', () => {
        console.log("Stopped!", socket.id);
        if(typeof youtubeChat[socket.io] != "undefined"){
            youtubeChat[socket.id].stop()
            youtubeChat[socket.id] = null;
            console.log(youtubeChat)
        }
    });
});

http.listen(3000)