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
    let gstatus = [false,false,false,false,false]
    if(gameState.remainingGuesses > 0){
        let answer = gameState.wordToGuess.split('') 
        let attempt = guess.split('')
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
                                        console.log(gameState.rightLetters.includes(answer[i2]))
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
    
    //DO WINCON BASDBASJONDFIOASNF

    res.status(201)
    res.send({gameState: gameState})
})




//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;