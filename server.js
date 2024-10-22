const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))

let activeSessions={

}

server.get('/newgame',function(req,res){
    let newID = uuid.v4()
    let newgame = {
        wordToGuess: "stink",
        guesses:[],
        wrongLetters: [],
        closeLetters: [], 
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    }
    activeSessions[newID]= newgame
    res.status(201)
    res.send({sessionID: newID})
})
server.get('/gamestate', function(req,res){
    sessionID = req.query.sessionID
    gameState = activeSessions[sessionID]
    console.log(gameState)
    res.status(200) 
    res.send({gameState: gameState})
})





//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;