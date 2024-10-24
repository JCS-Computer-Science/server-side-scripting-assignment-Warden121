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
    if(gameState.remainingGuesses > 0){
        let answer = gameState.wordToGuess.split("") 
        let attempt = guess.split("")
        let status = [false,false,false,false,false]
        let go = true
        let newguess = [
            {value:attempt[0], result:''},
            {value:attempt[1], result:''},
            {value:attempt[2], result:''},
            {value:attempt[3], result:''},
            {value:attempt[4], result:''},
        ]
        if(answer == attempt){
            console.log("YAYYYYYY")
        } else {
            for(let i=0; i <5;i++){
            
                // if(gameState.guesses.length >0){
                //     console.log("lonk")
                //     if(gameState.guesses[gameState.guesses.length-1][i].result == "RIGHT"){
                //         go=false
                //         console.log("canceled" + " --- "+ answer[i] + " -- " + attempt[i])
                //     }
                // }

                // if(go==true){
                if(answer[i] == attempt[i]){
                    if(gameState.rightLetters.includes(answer[i]) == false){
                    gameState.rightLetters.push(answer[i])
                    }
                    newguess[i].result = "RIGHT"
                    status[i] = true
                } else {    
                    for(let i2 = 0; i2<5;i2++){
                        if(answer[i2] == attempt[i]){
                            if(status[i2] == false){
                                if(gameState.closeLetters.includes(attempt[i]) == false){
                                    gameState.closeLetters.push(attempt[i])
                                }
                                newguess[i].result = "CLOSE"
                        } 
                    } else if(newguess[i].result != "CLOSE"){
                        newguess[i].result = "WRONG"
                    }
                }
            }
        // } else {
        //     console.log("HELLO")
        // }
    }
    }
        gameState.remainingGuesses = gameState.remainingGuesses -1
        gameState.guesses.push(newguess)
        console.log(answer)
        console.log(attempt)
        console.log(status)
        console.log("")
        console.log(newguess)
        console.log(gameState)


    }
    res.status(201)
})





//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;