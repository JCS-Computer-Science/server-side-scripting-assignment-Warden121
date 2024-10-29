const express = require("express");
const { errorMonitor } = require("supertest/lib/test");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))

let activeSessions={

}

server.get('/newgame',function(req,res){
    let newID = uuid.v4()
    let newgame = {
        wordToGuess: "spike",
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
    if(sessionID == undefined){
        res.status(400)
        res.send({error: "Bad request"})
    }
    guess = req.body.guess.toLowerCase()
    gameState = activeSessions[sessionID]
    if(gameState == undefined){
        res.status(404)
        res.send({error: "Failed"})
    }
    let gstatus = [false,false,false,false,false]
    if(gameState.remainingGuesses > 0 && gameState.gameOver != true){
        let answer = gameState.wordToGuess.split('') 
        let attempt = guess.split('')

        if(attempt.length != 5){
            res.status(400)
            res.send({error: "Invalid length"})
        }
        let valid = /[a-z]/
        for(let i=0;i<5;i++){
            if(attempt[i].match(valid) == null){
                res.status(400)
                res.send({error: "Invalid Character"})
            }
        }
        let newguess = [{value:attempt[0], result:''},{value:attempt[1], result:''},{value:attempt[2], result:''},{value:attempt[3], result:''},{value:attempt[4], result:''},]
            for(let i=0; i <5;i++){
                if(answer[i] == attempt[i]){
                    if(gameState.rightLetters.includes(answer[i]) == false){
                        if(gameState.closeLetters.includes(attempt[i]) == false){
                            gameState.rightLetters.push(answer[i])
                        } else {
                            gameState.closeLetters.splice(gameState.closeLetters.indexOf(attempt[i]), 1)
                            gameState.rightLetters.push(answer[i])
                        }
                    }
                    newguess[i].result = 'RIGHT'
                    gstatus[i] = true
                } else {    
                    for(let i2 = 0; i2<5;i2++){
                        if(answer[i2] == attempt[i]){
                            if(gstatus[i2] == false){
                                if(gameState.closeLetters.includes(attempt[i]) == false){
                                    if(gameState.rightLetters.includes(answer[i2]) == false) {
                                        gameState.closeLetters.push(attempt[i])
                                    }
                                }
                                newguess[i].result = 'CLOSE'
                        } 
                    } else if(newguess[i].result != 'CLOSE'){
                        newguess[i].result = 'WRONG'
                    }
                }
                if(gameState.wrongLetters.includes(newguess[i].value) == false){
                    if(gameState.closeLetters.includes(newguess[i].value) == false){
                        gameState.wrongLetters.push(newguess[i].value)
                    }
                }
            }  
    }
        gameState.remainingGuesses = gameState.remainingGuesses -1
        gameState.guesses.push(newguess)
    }
    if(gameState.remainingGuesses <= 0){
        gameState.gameOver=true
    }
    let correct = true
    for(let i=0; i<5;i++){
       if(gameState.guesses[gameState.guesses.length-1][i].result == "WRONG" || gameState.guesses[gameState.guesses.length-1][i].result == "CLOSE"){
        correct = false
       }
    }
    if(correct == true){
        gameState.gameOver = true
    }
    res.status(201)
    res.send({gameState: gameState})
})




//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;