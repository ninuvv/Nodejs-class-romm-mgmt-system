
const state = { db: null }
const monogoClient = require('mongodb').MongoClient

//const client = require('socket.io')();
//const client = require('socket.io').listen(3000).sockets;
// var express = require('express');
// var app = express();
// // call socket.io to the app
// app.io = require('socket.io')();

module.exports.Connection = function (done) {
  // const url = "mongodb+srv://ninu:dhanyam123@cluster0.rdpuw.mongodb.net/CRMS?retryWrites=true&w=majority"
  const url = "mongodb://localhost:27017"
  const dbname = "CRMS"

  //connect to mongo 
  monogoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) return done(err)
    state.db = data.db(dbname)
    done()



    // // Connect to Socket.io
    // client.on('connection', function (socket) {
    //   let chat = db.collection('chats');

    //   // Create function to send status
    //   sendStatus = function (s) {
    //     socket.emit('status', s);
    //   }

    //   // Get chats from mongo collection
    //   chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
    //     if (err) {
    //       throw err;
    //     }

    //     // Emit the messages
    //     socket.emit('output', res);
    //   });

    //   // Handle input events
    //   socket.on('input', function (data) {
    //     let name = data.name;
    //     let message = data.message;

    //     // Check for name and message
    //     if (name == '' || message == '') {
    //       // Send error status
    //       sendStatus('Please enter a name and message');
    //     } else {
    //       // Insert message
    //       chat.insert({ name: name, message: message }, function () {
    //         client.emit('output', [data]);

    //         // Send status object
    //         sendStatus({
    //           message: 'Message sent',
    //           clear: true
    //         });
    //       });
    //     }
    //   })
    //   // Handle clear
    //   socket.on('clear', function (data) {
    //     // Remove all chats from collection
    //     chat.remove({}, function () {
    //       // Emit cleared
    //       socket.emit('cleared');
    //     });
    //   });

    // })
  })

}
module.exports.get = function () { return state.db }