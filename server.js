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
    res.status(200) 
    res.send({gameState: gameState})
})
server.post('/guess', function(req,res){
    sessionID = req.body.sessionID
    guess = req.body.guess
    gameState = activeSessions[sessionID]
    console.log(gameState)
    if(gameState.remainingGuesses > 0){
        answer = gameState.wordToGuess.split("") 
        attempt = guess.split("")
        if(answer == attempt){
            console.log("YAYYYYYY")
        } else {
            for(let i=0; i <5;i++){
                console.log(answer[i] + " ---- "+ attempt[i])
                if(answer[i] == attempt[i]){
                    gameState.rightLetters.push(answer[i])
                } else {
                    for(let i2 = 0; i2<5;i2++){
                        if(answer[i2] == attempt[i2]){
                            gameState.closeLetters.push(answer[i])
                        }
                    }
                }
            }
        }
        console.log(answer)
        console.log(attempt)
        console.log(gameState)
    }
    res.status(201)
})





//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;