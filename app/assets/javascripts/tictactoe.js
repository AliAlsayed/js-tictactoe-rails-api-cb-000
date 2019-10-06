// Code your JavaScript / jQuery solution here
var turn = 0;
var loadedGames = [];
var currentGame;
function player(){
  return turn % 2 == 0 ? 'X' : 'O'
}

function updateState(td){
  td.innerHTML = player()
}

function setMessage(message){
  document.getElementById("message").innerHTML = '<p>' + message + '</p>'
}

function getBoard(){
  var state = [];
  var board = document.getElementsByTagName("td");
  for(var i = 0; i < board.length; i++){
    state.push(board[i].innerHTML)
  }
  return state;
}

function saveGame(){
  var state = getBoard();
  if(currentGame){
    $.ajax(
      type: 'PATCH',
      url: '/games/' + currentGame
      data: {state: state}
    )(, )
  } else {
    $.post('/games', {state: state})
  }
}

function checkWinner(){
  var state = getBoard();

  if(xCombo(state)){
    setMessage('Player X Won!');
    return true;
  }

  if(oCombo(state)){
    setMessage('Player O Won!');
    return true;
  }

  if(turn === 8){
    setMessage('Tie game.');
    return true;
  }
  return false;
}

function xCombo(state){
  var xHor = JSON.stringify(state.slice(0, 3)) == JSON.stringify(["X", "X", "X"]) ||
  state.slice(3, 6) === ["X", "X", "X"] ||
  state.slice(6, 9) === ["X", "X", "X"]

  var xVer = JSON.stringify([state[0], state[3], state[6]]) === JSON.stringify(["X", "X", "X"]) ||
  JSON.stringify([state[1], state[4], state[7]]) === JSON.stringify(["X", "X", "X"]) ||
  JSON.stringify([state[2], state[5], state[8]]) === JSON.stringify(["X", "X", "X"])

  var xDiag = JSON.stringify([state[0], state[4], state[8]]) === JSON.stringify(["X", "X", "X"]) ||
  JSON.stringify([state[2], state[4], state[6]]) === JSON.stringify(["X", "X", "X"])

  return xHor || xVer || xDiag
}

function oCombo(state){
  var oHor = JSON.stringify(state.slice(0, 3)) === JSON.stringify(["O", "O", "O"]) ||
  JSON.stringify(state.slice(3, 6)) === JSON.stringify(["O", "O", "O"]) ||
  JSON.stringify(state.slice(6, 9)) === JSON.stringify(["O", "O", "O"])

  var oVer = JSON.stringify([state[0], state[3], state[6]]) === JSON.stringify(["O", "O", "O"]) ||
  JSON.stringify([state[1], state[4], state[7]]) === JSON.stringify(["O", "O", "O"]) ||
  [state[2], state[5], state[8]] === ["O", "O", "O"]

  var oDiag = JSON.stringify([state[0], state[4], state[8]]) === JSON.stringify(["O", "O", "O"]) ||
  JSON.stringify([state[2], state[4], state[6]]) === JSON.stringify(["O", "O", "O"])


  return oHor || oVer || oDiag
}


function doTurn(element){
  turn += 1
  updateState(element);
  if (checkWinner()){
    saveGame();
    currentGame = null;
    var board = document.getElementsByTagName("td");
    for(var i = 0; i < board.length; i++){
      $(board[i]).empty();
    }
    turn = 0;
  }
}

function previousGames(data){
  var prevGames = [];
  var games = data["data"];
  for(var i = 0; i < games.length; i++){
    prevGames.push({id: games[i]["id"], state: games[i]["attributes"]["state"]})
  }
  return prevGames
}

function appendGamesToDiv(games){
  for(var i = 0; i < games.length; i++){
    if (!loadedGames.includes(games[i]["id"])){
      var id = games[i]["id"]
      $("#games").append(`<button class="gameButtons">${id}</button></br>`);
      loadedGames.push(games[i]["id"])
    }
  }
}

function populateBoard(state){
  var board = document.getElementsByTagName("td");
  for(var i = 0; i < board.length; i++){
    board[i].innerHTML = state[i]
  }
}

function attachListeners(){

  $(document).ready(function(){
    $("table").click(function(e){
      if(e.target.innerHTML != "X" && e.target.innerHTML != "O"){
        doTurn(e.target);
      }
    });

    $("#clear").click(function(){
      currentGame = null
      var board = document.getElementsByTagName("td");
      for(var i = 0; i < board.length; i++){
        $(board[i]).empty();
      }
      turn = 0;
    });

    $("#save").click(function(){
      saveGame();
    });

    $("#previous").click(function(){
      $.get('/games', function(data){
        games = previousGames(data)
        appendGamesToDiv(games)
      });
    });


    $(document).on('click', '.gameButtons', function(e){
      var id = e.target.innerHTML
      $.get('/games/' + id, function(data){
        var state = data["data"]["attributes"]["state"]
        var id = data["data"]["id"]
        currentGame = id;
        populateBoard(state)
      })
    })

  });

}

attachListeners()
