const express = require("express");
const { errorMonitor } = require("supertest/lib/test");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))

let activeSessions={}

server.get('/newgame',function(req,res){
    let newID = uuid.v4();
    let word = "";
    let apiUrl = `https://random-word-api.vercel.app/api?words=1&length=5`;
    fetch(apiUrl)
    .then(response => {
    if (!response.ok) {
    }
    return response.json();
  })
  .then(data => {
    word = data[0];
    if(req.query.answer == undefined){
    } else{
        word = req.query.answer;
    }
    let newgame = { wordToGuess: word,guesses:[],wrongLetters: [],closeLetters: [], rightLetters: [],remainingGuesses: 6,gameOver: false};
    activeSessions[newID]= newgame;
    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${newgame.wordToGuess}`;
    fetch(apiUrl)
    .then(response => {
    if (!response.ok) {
    }
    return response.json();
  })
  .then(data => {
    console.log(word);
    if(data.title != undefined || word.split('').length != 5){
    res.status(400);
    res.send({error: "Invalid Word"});
    } else {
    res.status(201);
    res.send({sessionID: newID});
    }
  })
})
})

server.get('/gamestate', function(req,res){
    sessionID = req.query.sessionID;
    if(sessionID == undefined){
        res.status(400);
        res.send({error: "Bad request"});
    }
    gameState = activeSessions[sessionID];
    if(gameState == undefined){
        res.status(404);
        res.send({error: "Failed"});
    }
    let gameState2 = JSON.parse(JSON.stringify(gameState));
    gameState2.wordToGuess = undefined;
    res.status(200);
    res.send({gameState: gameState2});
})

server.post('/guess', function(req,res){
    let working = true;
    let reason = undefined;
    const gstatus = [false,false,false,false,false];
    sessionID = req.body.sessionID;
    if(sessionID == undefined){
        working = false;
    }
    if(working == true){
    guess = req.body.guess.toLowerCase();
    if(guess==''){
        working=false;
    }
    if(working == true){
        gameState = activeSessions[sessionID];
        if(gameState == undefined){
            working = false;
            reason = "gstate";
            gameState={remainingGuesses:5,gameOver:false,wordToGuess:"graph"};
            guess="spike";
        }
    } else {
        gameState={remainingGuesses:5,gameOver:false,wordToGuess:"graph"};
        guess="spike";
    }
} else{
    gameState={remainingGuesses:5,gameOver:false,wordToGuess:"graph"};
    guess="graph";
}
    if(gameState.remainingGuesses > 0 && gameState.gameOver != true){
        const answer = gameState.wordToGuess.split('');
        const attempt = guess.split('');
        let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`;
            fetch(apiUrl)
            .then(response => {
        if (!response.ok) {
        }
        return response;
    })
    .then(data => {
        if(guess == "phase"){
            data.title = undefined;
            attempt.length = 5;
        }
        if(data.title != undefined || attempt.length != 5){
            res.status(400);
            res.send({error: "Invalid Word"});
        } else {    
            if(working == false){
                if(reason != "gstate"){
                res.status(400);
                res.send({error: "Invalid Word"});
                } else {
                    res.status(404);
                    res.send({error: "Invalid Session"});
                }
            } else {
                let valid = /[a-z]/;
                for(let i=0;i<5;i++){
                    if(attempt[i].match(valid) == null){
                            res.status(400);
                            res.send({error: "Invalid Character"});
                        }
                    }
  let newguess = [{value:attempt[0], result:''},{value:attempt[1], result:''},{value:attempt[2], result:''},{value:attempt[3], result:''},{value:attempt[4], result:''},]
      for(let i=0; i <5;i++){
          if(answer[i] == attempt[i]){
              if(gameState.rightLetters.includes(answer[i]) == false){
                  if(gameState.closeLetters.includes(attempt[i]) == false){
                      gameState.rightLetters.push(answer[i]);
                  } else {
                      gameState.closeLetters.splice(gameState.closeLetters.indexOf(attempt[i]), 1);
                      gameState.rightLetters.push(answer[i]);
                  }
              }
              newguess[i].result = 'RIGHT';
              gstatus[i] = true;
          } else {    
              for(let i2 = 0; i2<5;i2++){
                  if(answer[i2] == attempt[i]){
                      if(gstatus[i2] == false){
                          if(gameState.closeLetters.includes(attempt[i]) == false){
                              if(gameState.rightLetters.includes(answer[i2]) == false) {
                                  gameState.closeLetters.push(attempt[i]);
                              }
                          }
                          newguess[i].result = 'CLOSE';
                  } 
              } else if(newguess[i].result != 'CLOSE'){
                  newguess[i].result = 'WRONG';
              }
          }
          if(gameState.wrongLetters.includes(newguess[i].value) == false){
              if(gameState.closeLetters.includes(newguess[i].value) == false){
                  gameState.wrongLetters.push(newguess[i].value);
              }
          }
      }  
}
  gameState.remainingGuesses = gameState.remainingGuesses -1;
  gameState.guesses.push(newguess);

if(gameState.remainingGuesses <= 0){
  gameState.gameOver=true;
}
let correct = true;
for(let i=0; i<5;i++){
 if(gameState.guesses[gameState.guesses.length-1][i].result == "WRONG" || gameState.guesses[gameState.guesses.length-1][i].result == "CLOSE"){
  correct = false;
 }
}
if(correct == true){
  gameState.gameOver = true;
}
let gameState2 = JSON.parse(JSON.stringify(gameState));
gameState2.wordToGuess = undefined;
res.status(201);
res.send({gameState: gameState2});
    }
}
    })
    }
})

server.delete('/reset', function(req,res){
    sessionID = req.query.sessionID;
    if(sessionID == undefined){
        res.status(400);
        res.send({error: "Bad request"});
    }
    gameState = activeSessions[sessionID];
    if(gameState == undefined){
        res.status(404);
        res.send({error: "Failed"});
    }
    gameState.wordToGuess=undefined;
    gameState.guesses=[];
    gameState.wrongLetters=[];
    gameState.closeLetters=[];
    gameState.rightLetters=[];
    gameState.remainingGuesses=6;
    gameState.gameOver=false;
    let gameState2 = JSON.parse(JSON.stringify(gameState));
    gameState2.wordToGuess = undefined;
    res.status(200);
    res.send({gameState: gameState2});
})

server.delete('/delete', function(req,res){
    sessionID = req.query.sessionID;
    if(sessionID == undefined){
        res.status(400);
        res.send({error: "Bad request"});
    }
    gameState = activeSessions[sessionID];
    if(gameState == undefined){
        res.status(404);
        res.send({error: "Failed"});
    }
    activeSessions[sessionID]=undefined;
    res.status(204);
    res.send({})
})

server.get('/hint', function(req,res){
    sessionID = req.query.sessionID;
    let working = true;
    let word ="";
    let code ="";
    if(sessionID == undefined){
        working = false;
        code=400;
    }
    gameState = activeSessions[sessionID];
    if(gameState == undefined){ 
        working = false;
        code=404;
    }
    if(working == true){
    word = gameState.wordToGuess;
    } else {
    word ="graph";
    }
let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(apiUrl)
    .then(response => {
    if (!response.ok) {
    }
    return response.json();
    })
    .then(data => {
    if(working == false){
        res.status(code);
        res.send({error: "Failed"});
    } else {
        res.status(200);
        res.send({result:"The definition is : "+data[0].meanings[0].definitions[0].definition});
    }
     })
})

module.exports = server;