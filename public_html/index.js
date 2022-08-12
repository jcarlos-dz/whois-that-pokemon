const apiUrl = "https://pokeapi.co/api/v2/pokemon/"; //API base URL
const delay = 1500;
const offset = 0;
const limit = 665; //limiting Pokemons - sprites are not numbered properly after 665
const pokemonUrl = apiUrl + "?limit=" + limit + "&offset=" + offset; //complete URL with limit
const spriteUrl =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"; //base URL from which sprites are fetched

const MAX_NUMBER_OF_GUESSES = 3;

const spriteElement = document.getElementById("sprite"); //element object from HTML with an id 'sprite'
const streakElement = document.getElementById("streak"); //element object from HTML with an id 'streak'

var audioHit = new Audio("hit.wav");
var audioMiss = new Audio("miss.wav");

var correctAnswer = -1;
var streak = 0; //initialize streak to zero
var pokemonData; //variable which holds the response from Pokemon API
var pokemonSet = [];
var buttonsBlocked = false;

//function that fetched Pokemon data from the API
const fetchPokemonData = async () => {
  return fetch(pokemonUrl).then((response) => response.json());
};

const fetchPokemonDetails = async (pokemonName) => {
  return fetch(apiUrl + pokemonName).then((response) => response.json());
};

//main function
const main = async () => {
  let response = await fetchPokemonData(pokemonUrl);
  pokemonData = response.results; //save API response to pokemonData variable
  getPokemon();
};

const displayInteraction = (whichAudio, whichButton, whichClass) => {
  whichAudio.play();
  streakElement.classList.add(whichClass);
  whichButton.classList.add(whichClass);

  setTimeout(() => {
    whichButton.classList.remove(whichClass);
    streakElement.classList.remove(whichClass);
    resolve();
  }, delay); // wait before generating new Pokemon and start the same logic again
};

//function that compares player's guess with Pokemon name and based on that either increases or resets streak
const checkGuess = async (button) => {
  if (buttonsBlocked) {
    // So that player cannot press the button again while showing correct answer
    return;
  }

  buttonsBlocked = true;
  let theClass = "";
  let theButton = "";
  let theAudio = "";

  if (parseInt(button.getAttribute("data-id")) === correctAnswer) {
    streak++; //correct guess - increase streak by one
    theAudio = audioHit;
    theButton = button;
    theClass = "hit";
  } else {
    streak = 0; //wrong guess - reset streak
    let correctButton = document.querySelectorAll(
      '[data-id="' + correctAnswer + '"]'
    );
    theAudio = audioMiss;
    theButton = correctButton[0];
    theClass = "miss";
  }
  displayInteraction(theAudio, theButton, theClass);

  showPokemon(); //call function that will reveal a Pokemon
};

//function that generates random number, shows a Pokemon's shadow with that number and saves Pokemon name to variable
const getPokemon = async () => {
  // Initialization
  for (i = 0; i < MAX_NUMBER_OF_GUESSES; i++) {
    pokemonSet[i] = getRandomIntInclusive(offset, limit + offset); //get a random number
  }

  guess1.innerHTML = pokemonData[pokemonSet[0]].name;
  guess2.innerHTML = pokemonData[pokemonSet[1]].name;
  guess3.innerHTML = pokemonData[pokemonSet[2]].name;

  correctAnswer = Math.floor(Math.random() * MAX_NUMBER_OF_GUESSES);

  spriteElement.src = "loading.gif";

  let pokemonDetails = await fetchPokemonDetails(
    pokemonData[pokemonSet[correctAnswer]].name
  );

  spriteElement.style.setProperty("transition", "initial"); //reset CSS transition property
  spriteElement.src = ""; //reset sprite URL so it has smooth transition to new Pokemon sprite
  spriteElement.style.setProperty("filter", "brightness(0)"); //set CSS property brightness to zero of sprite element - that way shadow is created

  let sprite = pokemonDetails.sprites.other["official-artwork"].front_default;
  if (sprite == null) sprite = pokemonDetails.sprites.front_default;
  spriteElement.src = sprite; //set URL to src property of img tag

  console.log(pokemonData[pokemonSet[correctAnswer]].name);
  buttonsBlocked = false;
};

//function that reveals Pokemon's sprite, shows Pokemon's name and calls getPokeon function
function showPokemon() {
  streakElement.innerHTML = "Streak: " + streak; // show new streak value
  spriteElement.style.setProperty("transition", "filter 1s ease-out"); // add CSS property to reveal Pokemon with simple transition from shadow to normal brightness
  spriteElement.style.setProperty("filter", "initial");

  setTimeout(() => getPokemon(), delay); // wait before generating new Pokemon and start the same logic again
}

//function that generates random number between min value and max value.
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

//function call that starts application
main();
