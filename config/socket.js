var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;
//var db = require("../config/connection")
//var collection = require("../config/collection")

const users = {};

// //start listen with socket.io
io.on('connection', function (socket) {
    console.log('a user connected');


   

    socket.on("sendNotification", function (details) {
        //console.log(details)
        socket.broadcast.emit("sendNotification", details);
    })


    socket.on("new-user-joined", name => {
        console.log(name)
        users[socket.id] = name;
        console.log(users[socket.id])
        socket.broadcast.emit("user-joined" ,name )
    })

    
    socket.on("send", message => {
        socket.broadcast.emit("receive" ,{message:message,name:users[socket.id]} )
    })


    socket.on("disconnect", function () {
        console.log('a user disconnected ' +users[socket.id] );
        socket.broadcast.emit("leave",users[socket.id]);
        delete users[socket.id]
    })


    // // Connect to Socket.io

    //     let chat = db.get().collection(collection.CHAT_COLLECTION)

    //     // Create function to send status
    //     sendStatus = function (s) {
    //         socket.emit('status', s);
    //     }

    //     // Get chats from mongo collection
    //     chat.find().limit(100).sort({ _id: -1 }).toArray(function (err, res) {
    //         if (err) {
    //             throw err;
    //         }

    //         // Emit the messages
    //         socket.emit('output', res);
    //     });

    //     // Handle input events
    //     socket.on('input', function (data) {
    //         let name = data.name;
    //         let message = data.message;

    //         // Check for name and message
    //         if (name == '' || message == '') {
    //             // Send error status
    //             sendStatus('Please enter a name and message');
    //         } else {
    //             // Insert message
    //             chat.insert({ name: name, message: message }, function () {
    //                 socket.emit('output', [data]);

    //                 // Send status object
    //                 sendStatus({
    //                     message: 'Message sent',
    //                     clear: true
    //                 });
    //             });
    //         }
    //     })
    //     // Handle clear
    //     socket.on('clear', function (data) {
    //         // Remove all chats from collection
    //         chat.remove({}, function () {
    //             // Emit cleared
    //             socket.emit('cleared');
    //         });
    //     });



})

module.exports = socketApi;