// Подключаем звуки
const coinSound = new Audio("sounds/coin.wav");
const mineSound = new Audio("sounds/mine.wav");
const winSound = new Audio("sounds/win.wav");

// Находим важные элементы
const game = document.querySelector(".game");
const startButton = document.querySelector(".start-button");
const badMineInput = document.querySelector(".mines-input");
const betAmountInput = document.querySelector(".amount-input");
const totalEarningsTitle = document.querySelector(".earnings-title");
const totalEarningsInput = document.querySelector(".earnings-input");
const [amountButton, amountButton2, amountButton3] =
  document.querySelectorAll(".amount-button");
const minesButtons = document.querySelectorAll(".mines-button");

// Отслеживаем баланс
const balance = document.querySelector(".balance");
let balanceCount = 100;

// Делаем кнопки в инпуте ставки
amountButton.addEventListener("click", () => {
  betAmountInput.value /= 2;
  betAmountInput.value = Number(betAmountInput.value).toFixed(2);
});
amountButton2.addEventListener("click", () => {
  betAmountInput.value *= 2;
  betAmountInput.value = Number(betAmountInput.value).toFixed(2);
});
amountButton3.addEventListener("click", () => {
  betAmountInput.value = balanceCount;
  betAmountInput.value = Number(betAmountInput.value).toFixed(2);
});

// Делаем кнопки в инпуте мин
minesButtons.forEach((button) => {
  button.addEventListener("click", clickOnMinesButton);
});

// При нажатии на кнопку начинается игра
startButton.addEventListener("click", startGame);

function startGame() {
  // Смотрим идёт ли сейчас игра
  if (startButton.classList.contains("disabled")) {
    balanceCount += Number(totalEarningsInput.value);
    balance.innerHTML = `Balance: ${balanceCount.toFixed(2)}`;
    totalEarningsInput.value = null;

    // Звук выигрыша
    winSound.currentTime = 0;
    winSound.play();

    // Завершаем игру
    endGame();

    return;
  }

  // Запрещаем делать ставку меньше единицы
  if (0.9 >= betAmountInput.value) {
    game.classList.add("close");
    game.innerHTML = "You cannot bet less than one.";
    return;
  }

  // Запрещаем делать ставку больше чем баланс
  if (balanceCount < betAmountInput.value) {
    return;
  }

  // Запрещаем ставить абсурдные значения мин
  if (badMineInput.value > 24 || 1 > badMineInput.value) {
    return;
  }

  // Настраиваем кнопку новой игры
  startButton.classList.add("disabled");
  startButton.style = "opacity: 0.8;";
  startButton.disabled = true;
  startButton.innerHTML = "Waiting to uncover a mine";

  // Запрещаем вводить кол-во мин и ставку
  InputsAndButtonsDisabled(true);

  // Отнимаем ставку из баланса
  betAmountInput.value = Number(betAmountInput.value).toFixed(2);
  balanceCount -= betAmountInput.value;
  balance.innerHTML = `Balance: ${balanceCount.toFixed(2)}`;

  // Начальное значение выигрыша это наша ставка
  totalEarningsInput.value = betAmountInput.value;

  // Создаём массив мин
  const mineArray = [];

  // Смотрим сколько пользователь захотел плохих мин
  const badMineCount = badMineInput.value;

  // Наполняем массив
  createMinesArray(mineArray, badMineCount);

  // Добавляем плохие мины
  addBadMines(mineArray, badMineCount);

  // Перемешиваем массив
  shuffleArray(mineArray);

  // Добавляем стиль для анимации
  document.querySelectorAll(".mine").forEach((mine) => {
    mine.classList.add("animation");
  });

  // Открываем поле (if нужен потому что нам нужно делать это действие только один раз)
  if (game.classList.contains("close")) {
    game.classList.remove("close");

    // Чистим поле и позволяем с ним взаимодейстовать
    game.classList.remove("disabled");
    game.innerHTML = "";

    // Создаём мины
    createMines(mineArray, badMineCount);
  } else {
    // Чистим поле и позволяем с ним взаимодейстовать
    setTimeout(() => {
      game.classList.remove("disabled");
      game.innerHTML = "";
    }, 300);

    // Создаём мины
    setTimeout(() => {
      createMines(mineArray, badMineCount);
    }, 300);
  }
}

function clickOnMinesButton(e) {
  badMineInput.value = e.srcElement.innerText;
}

function InputsAndButtonsDisabled(value) {
  badMineInput.disabled = value;
  betAmountInput.disabled = value;

  minesButtons.forEach((button) => {
    button.disabled = value;
  });
  amountButton.disabled = value;
  amountButton2.disabled = value;
  amountButton3.disabled = value;

  let pointerEvents = "";

  if (value) {
    pointerEvents = "none";
  } else {
    pointerEvents = "all";
  }

  minesButtons.forEach((button) => {
    button.style = `pointer-events:${pointerEvents};`;
  });
  amountButton.style = `pointer-events:${pointerEvents};`;
  amountButton2.style = `pointer-events:${pointerEvents};`;
  amountButton3.style = `pointer-events:${pointerEvents};`;
}

function createMinesArray(mineArray, badMineCount) {
  for (let i = 0; i < 25 - badMineCount; i++) {
    mineArray.push("good");
  }
}

function addBadMines(mineArray, badMineCount) {
  for (let i = 0; i < badMineCount; i++) {
    mineArray.push("bad");
  }
}

function shuffleArray(mineArray) {
  for (let i = 0; i < mineArray.length; i++) {
    let randomIndex = Math.floor(Math.random() * mineArray.length);

    let temp = mineArray[i];

    mineArray[i] = mineArray[randomIndex];
    mineArray[randomIndex] = temp;
  }
}

function createMines(mineArray, badMineCount) {
  mineArray.forEach((status) => {
    let mine = document.createElement("div");
    mine.classList.add("mine", status);

    // Клик по мине
    mine.addEventListener("click", (event) => {
      mine.classList.add("open");

      if (mine.classList.contains("good")) {
        coinSound.currentTime = 0;
        coinSound.play();

        const multiplier = Number.parseFloat(
          (0.97 * getProduct(badMineCount)).toFixed(2)
        );

        totalEarningsTitle.innerHTML = `Total earnings ${multiplier}x`;
        startButton.innerHTML = `Cashout (${multiplier}x)`;
        startButton.style = "opacity: 1;";
        startButton.disabled = false;

        totalEarningsInput.value = Number.parseFloat(
          Number(betAmountInput.value) * multiplier
        ).toFixed(2);
      } else {
        mineSound.currentTime = 0;
        mineSound.play();

        startButton.disabled = false;
        startButton.style = "opacity: 1;";

        event.target.classList.add("target");

        // Завершаем игру
        endGame();
      }
    });

    game.append(mine);
  });
}

function endGame() {
  game.classList.add("disabled");
  startButton.classList.remove("disabled");

  document.querySelectorAll(".mine").forEach((mine) => {
    mine.classList.add("open");
  });

  InputsAndButtonsDisabled(false);

  totalEarningsTitle.innerHTML = "Total earnings";
  startButton.innerHTML = "Start new game";
}

function getProduct(badMineCount) {
  let mines = 25;
  let goodsMines = 25 - badMineCount;
  let openMines = game.querySelectorAll(".open").length;

  let product = 1;

  for (let i = 0; i < openMines; i++) {
    product *= 1 / (goodsMines / mines);
    mines -= 1;
    goodsMines -= 1;
  }

  return product;
}
