// Kat - Function para que se abra el div de las normas
const rulesPopup = document.getElementById("rules-popup");
function openRules() {
  document.getElementById("rules-popup").style.display = "block";
}

//  Start Game

// Initiate a new game, not yet started.
let newGame = new Game();

//Validacion form new
const form = document.getElementById("player_form");
const errorMessagesDiv = document.getElementById("errorMessages");

form.addEventListener("submit", (e) => {
  e.preventDefault(); //prevenir envio formulario
  let errors = [];
  const name = document.getElementById("id_name").value.trim();

  //validacion del campo nombre
  if (name.length < 3) {
    errors.push("The name should contain at least 3 characters");
  }
  const isValid = /^[a-zA-Z\s]+$/.test(name);
  if (!isValid) {
    errors.push("Name can not contain special characters");
  }

  if (errors.length > 0) {
    errorMessagesDiv.innerText = errors[0];
    const audio = new Audio("/images/audio/validation_name.mp3");
    audio.play();
  } else {
    errorMessagesDiv.innerText = "";
    document.getElementById("rules-popup").style.display = "block";
    playGame();
  }
});

function playGame() {
  // Coge el valor del elmento input de nombre del form
  const playerName = document.getElementById("id_name").value;

  // Pone el nombre en el elemento de player name bienvenida
  document.getElementById("player_name").innerHTML = playerName;

  // Start a new game and pass along the name of the player
  newGame.play(playerName);

  // Esconde player form
  document.getElementById("player_form").setAttribute("hidden", "");

  // Muestra en lugar el elemento de game play
  //   document.getElementById("game_play").removeAttribute("hidden");
  //Kat Aquí he borrado esto para "game_play" y lo he aplicado a "game_area_container", que engloba todo el area del juego

  // Kat - NEW Mostrar el area del juego
  document.getElementById("game_area_container").removeAttribute("hidden", "");

  /// DUCKIES ANIMATION///
  function animateDucks() {
    const initiateGame = document.getElementById("game_play");
    initiateGame.classList.add("animate");
  }

  document
    .getElementById("start_button")
    .addEventListener("click", animateDucks);

  ///END ANIMATION DUCKS////

  // Mostrar botones
  document.getElementById("start_button").removeAttribute("hidden");
  document.getElementById("reset_button").removeAttribute("hidden");
  document.getElementById("timer-wrapper").removeAttribute("hidden");
  document.getElementById("score").removeAttribute("hidden", "");

  // Reproductor de música
  document.getElementById("music-player").removeAttribute("hidden");
}

// HIDDEN BUTTONS AND COUNTER

document.getElementById("start_button").setAttribute("hidden", "");
document.getElementById("reset_button").setAttribute("hidden", "");
document.getElementById("timer-wrapper").setAttribute("hidden", "");
document.getElementById("score").setAttribute("hidden", "");
document.getElementById("alert-message").setAttribute("hidden", "");
// document.getElementById("underlay").setAttribute("hidden", "");

// Kat sábado por la mañana
// Game-area hidden - contenedor nuevo que engloba todo el area del juego
document.getElementById("game_area_container").setAttribute("hidden", "");

function resetGame() {
  newGame.stop();
  newGame.play();
}

window.onload = function () {
  //playGame() // @TODO remove this, temporary to not show the form every time ...
  var startButton = document.getElementById("start_button");
  var resetButton = document.getElementById("reset_button");
  //startButton.addEventListener('click', startCountdown);
  startButton.addEventListener("click", function () {
    newGame.start();
  });
  resetButton.addEventListener("click", resetGame);

  // @TODO enable this again.
  setTimeout(function () {
    document.getElementById("overlay").hidden = true;
  }, 3000);
};

// Class that handles the state and every action for the game
function Game() {
  // these are all variables linked to the game and set to their default values
  this.score = 0;
  this.name = "";
  this.duckies;
  this.timer = 10;
  this.timerId;
  this.timerDisplay = document.querySelector("#time"); // this is the element that will show the timer
  this.audioBackground = document.getElementById("music-player");
  this.alertMessage = document.getElementById("alert-message"); // this is the element that will show alerts
  this.isRunning = false;
  this.succesfulHit = new Audio("/images/audio/shoot_winning.wav");
  this.missHit = new Audio("/images/audio/shoot.mp3");
  this.plusOnes = document.querySelectorAll(".plus-one");

  this.stop = function () {
    // Stop the music
    this.audioBackground.pause();

    // Set score to 0
    this.score = 0;
    document.getElementById("score").innerHTML = this.score;

    // Set time to 10
    this.timer = 10;
    this.timerDisplay.textContent = "0:10";
    clearInterval(this.timerId);

    // Uncheck all duckies
    for (const duck of document.querySelectorAll("#game_play input")) {
      duck.checked = false;
    }

    this.isRunning = false;
  };

  // this is the entry point of the game. It will initialize all variables
  // - reset the score to zero
  // - set the name of the player
  // - add the necessary event listeners
  this.play = function (name) {
    this.score = 0;
    this.name = name;

    // these are all the duck targets
    this.duckies = document.querySelectorAll("#game_play input");
    // because we have a lot of ducks, we need to iterate over them and add the eventlistener click separately to each duck
    for (const duck of this.duckies) {
      duck.addEventListener("click", () => this.hit());
    }

    const self = this;
    document
      .getElementById("game_area")
      .addEventListener("click", function (event) {
        // we do not want to make sound when the game is not running
        if (self.isRunning === false) {
          return;
        }
        // we should only look for input fields. Duck is also triggerd because of the link between the input and the label [for]
        if (event.target.classList.contains("duck")) {
          // not a duck, so do not play a sound
          return;
        }

        // when hitting an input field we should play a song
        if (event.target.tagName === "INPUT") {
          // play song and then return
          self.succesfulHit.play();
          return;
        } else {
          // In case we do not hit anything play the miss song
          self.missHit.play();
        }
      });
  };

  // This will start the actual gameplay
  this.start = function () {
    // @TODO disable start button when gameplay has started or change with a restart ???

    this.isRunning = true;
    // Run the timer.
    this.startTimer();
    this.audioBackground.play();

    const audio = new Audio("/images/audio/go.wav");
    audio.play();
    // @TODO:
    // - the ducks need to be shown
    // - the score needs to be shown
  };

  this.startTimer = function () {
    // We can not use 'this' inside the setInterval as it is a different scope and 'this' will refer to the interval function and not the game one.
    // To circumvent this we copy it in a self constant so we can use that one.
    const self = this;
    let minutes, seconds;
    // we save the identifier of the setInterval function so we later can stop it when we want it to stop.
    this.timerId = setInterval(function () {
      minutes = parseInt(self.timer / 60, 10);
      seconds = parseInt(self.timer % 60, 10);

      seconds = seconds < 10 ? "0" + seconds : seconds;

      self.timerDisplay.textContent = minutes + ":" + seconds;

      let allDuckies = self.duckies.length;
      for (const duck of self.duckies) {
        // for each duck we check if the checkbox is checked
        if (duck.checked === true) {
          // Every time a duckie is checked we decrease the amount of allDuckies
          allDuckies--;
        }
      }

      // If our allDuckies equals 0 we know that there are no more duckies to be checked/hit and we can stop
      // the timer.
      if (allDuckies === 0) {
        clearInterval(self.timerId);
      }

      // When the timer goes below 0 (-1 because we actually count 11 :3) we stop the execution of the interval
      if (--self.timer <= -1) {
        // this function will stop the loop of the given identifier
        clearInterval(self.timerId);
        // Do whatever we want to do when the player loses the game.
        self.lostGame();
        // self.audioBackground.stop();
      }
    }, 1000);
  };

  // function to increase the score counter every time a duck is hit
  this.hit = function () {
    if (this.isRunning === false) {
      return;
    }
    this.score += 1;
    document.getElementById("score").innerHTML = this.score;

    // Show message that the player has scored.
    this.alertMessage.removeAttribute("hidden");

    const self = this;
    setTimeout(function () {
      // reset alert by hidding it
      self.alertMessage.setAttribute("hidden", "");
    }, 400);

    // @TODO
    // - display +1s

    const maxHeight = window.screen.availHeight;
    const maxWidth = window.screen.availWidth;
    // loop over all available +1 thingies
    for (const plusOne of this.plusOnes) {
      plusOne.hidden = false;
      plusOne.style.top = Math.floor(Math.random() * (maxHeight + 1)) + "px";
      plusOne.style.left = Math.floor(Math.random() * (maxWidth + 1)) + "px";
    }

    setTimeout(() => {
      for (const plusOne of this.plusOnes) {
        plusOne.hidden = true;
      }
    }, 500);

    // loop over all of the ducks
    for (const duck of this.duckies) {
      // for each duck we check if the checkbox is unchecked
      if (duck.checked === false) {
        // if a checkbox is unchecked we know that there are still duckies not hit. so we can continue our game
        return;
      }
    }

    // If we did not encounter any unchecked duckies this means they all have been hit and we can end the game as WON.
    this.wonGame();
  };

  // Everything related to a lost game goes here
  this.lostGame = function () {
    this.isRunning = false;
    console.log("game over !!!!!!!!!!!");

    // testing popup you lose////
    const losePopup = document.createElement("div");
    losePopup.id = "lose-popup";
    losePopup.classList.add("popup-lose");
    losePopup.innerHTML = `
      <button class="closepopupsButtons" id="closeLosePopup">X</button>
      <img id="duckieLose" src="/images/duckie_lose.svg" alt="You Lose!">
      <h2>You Lose!</h2>`;

    document.body.appendChild(losePopup);

    const closeLosePopupButton = document.getElementById("closeLosePopup");
    closeLosePopupButton.addEventListener("click", () => {
      losePopup.setAttribute("hidden", "");
      window.location.reload();
    });

    // add audio of celebration
    const audio = new Audio("/images/audio/you_lose.wav");
    audio.play();
    // @TODO : show a pop up that the player ran out of time.
    // note for myself: add here a reset or trigger an event
  };

  // Everything related to a won game goes here
  // this.wonGame = function () {
  //   this.isRunning = false
  //   console.log('hooray you won!!')
  //   // @TODO : show a pop up that the player has won
  // }

  //// TESTING POPUP YOU WON////

  this.wonGame = function () {
    this.isRunning = false;
    console.log("you won!!");

    // Create a win popup
    const winPopup = document.createElement("div");
    winPopup.id = "win-popup";
    winPopup.classList.add("popup-won");
    winPopup.innerHTML = `
    <button class="closepopupsButtons" id="closeWinPopup">X</button>
    <img id="duckieWin" src="/images/duckie_win.svg" alt="You Won!">
    <h2>You Won!</h2>`;
    document.body.appendChild(winPopup);

    const closeWinPopupButton = document.getElementById("closeWinPopup");
    closeWinPopupButton.addEventListener("click", () => {
      winPopup.setAttribute("hidden", "");
      resetGame();
    });

    // add audio of celebration
    const audio = new Audio("/images/audio/you_win.wav");
    audio.play();
  };
}

//END
// Close Rules popup
function closeRules() {
  document.getElementById("rules-popup").style.display = "none";
}
document
  .getElementById("close-rules-button")
  .addEventListener("click", closeRules);

// todos:

// [DONE] 1. every time a duck is hit a message should be displayed under neat the score board
// - only shown for 1 second [or lower]

// 2. show +1s in the background [similar to clouds]
// - only show for 1 second [or lower]

//  [DONE] 3. play sounds on duck hit

// 4. you lose popup
// - should play a sound
// - close button

// 5. you win popup
// - should play a sound
// - close button

// 6. animation of duckies
// - still to be decicded how they will move arround ...

// 7. disable buttons when game is in progress, to avoid weird side effects//