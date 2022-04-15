//DOM ELEMENTS
const scoreValue = document.querySelector(".score__amount");
const timeInfo = document.querySelector(".game__info--timer");
const timerValue = document.querySelector(".timerValue");
const canvas = document.querySelector("#game__canvas");
////////////////////////////////////////////////////////////
const startButton = document.querySelector(".start__button");
const gameSection = document.querySelector(".game");
const startSection = document.querySelector(".start");
const endSection = document.querySelector(".end");
const endButton = document.querySelector(".end__button");
const endBack = document.querySelector(".end__start");
const endScore = document.querySelector(".end__score");
const gridButton = document.querySelector(".game__buttons--grid");
const soundButton = document.querySelector(".game__buttons--music");
const rad = document.querySelectorAll("input[name='size']");
let boardSize = 50;

const game = () => {
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(0xf5f5f5);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 60);
  const boardGeometry = new THREE.PlaneBufferGeometry(boardSize, boardSize, 1);
  const boardMaterial = new THREE.MeshPhongMaterial({
    color: 0x80a822,
  });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  scene.add(board);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0xdce825,
  });

  const gridGroup = new THREE.Group();
  const fieldGeometry = new THREE.PlaneBufferGeometry(1, 1, 1);
  const fielfMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
  });

  for (let i = -boardSize / 2; i <= boardSize / 2; i += 1) {
    if (i % 2 == 0) {
      for (let j = -boardSize / 2; j <= boardSize / 2; j += 2) {
        const field = new THREE.Mesh(fieldGeometry, fielfMaterial);
        field.position.set(i, j, 0.1);
        gridGroup.add(field);
      }
    } else {
      for (let j = -boardSize / 2; j <= boardSize / 2; j += 2) {
        const field = new THREE.Mesh(fieldGeometry, fielfMaterial);
        field.position.set(i, j + 1, 0.1);
        gridGroup.add(field);
      }
    }
  }

  const borderGeometry = new THREE.BoxGeometry(boardSize, 0.5, 2);
  const borderMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  const border1 = new THREE.Mesh(borderGeometry, borderMaterial);
  const border2 = new THREE.Mesh(borderGeometry, borderMaterial);
  const border3 = new THREE.Mesh(borderGeometry, borderMaterial);
  const border4 = new THREE.Mesh(borderGeometry, borderMaterial);
  border1.position.set(0, boardSize / 2, 0);
  border2.position.set(0, -boardSize / 2, 0);
  border3.position.set(boardSize / 2, 0, 0);
  border3.rotation.z = Math.PI / 2;
  border4.position.set(-boardSize / 2, 0, 0);
  border4.rotation.z = Math.PI / 2;

  const border = new THREE.Group();
  border.add(border1);
  border.add(border2);
  border.add(border3);
  border.add(border4);
  scene.add(border);

  {
    const color = 0xffffff;
    const intensity = 0.5;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 0, 150);
    scene.add(light);
  }

  const snake = [];
  const food = [];
  const lights = [];
  let direction = "left";
  let gameSpeed = 1000 / 20;
  let score = 0;
  let bandOn = true;
  let gridOn = false;
  let soundOn = true;
  let sec;
  let counter;
  let cube;

  const init = () => {
    for (let i = 0; i < 8; i++) {
      cube = new THREE.Mesh(boxGeometry, boxMaterial);
      snake.push(cube);
      snake[i].position.x = i;
      scene.add(snake[i]);
    }
    generateApple();
    renderer.render(scene, camera);
  };

  const changeDirection = (event) => {
    switch (event.keyCode) {
      case 68:
        if (direction != "right") direction = "left";
        break;
      case 65:
        if (direction != "left") direction = "right";
        break;
      case 87:
        if (direction != "down") direction = "up";
        break;
      case 83:
        if (direction != "up") direction = "down";
        break;
    }
  };

  const move = () => {
    const head = {
      x: snake[snake.length - 1].position.x,
      y: snake[snake.length - 1].position.y,
    };

    switch (direction) {
      case "left":
        head.x += 1;
        break;
      case "right":
        head.x -= 1;
        break;
      case "up":
        head.y += 1;
        break;
      case "down":
        head.y -= 1;
        break;
    }

    walls(head);

    cube = new THREE.Mesh(boxGeometry, boxMaterial);
    cube.position.set(head.x, head.y, 0);
    snake.push(cube);
    scene.add(cube);

    scene.remove(snake[0]);
    snake.shift();

    checkGameStatus(head);
    seflColission(head);
    grow(head);
    renderer.render(scene, camera);
  };

  const checkGameStatus = (head) => {
    const isOutOfBoard =
      head.x > boardSize / 2 - 0.5 ||
      head.x < -boardSize / 2 + 0.5 ||
      head.y > boardSize / 2 - 0.5 ||
      head.y < -boardSize / 2 + 0.5;

    if (bandOn) {
      if (isOutOfBoard) {
        gameOver();
      }
    }
  };
  const walls = (head) => {
    if (!bandOn) {
      if (direction == "left") {
        if (head.x > boardSize / 2 - 0.5) {
          head.x = head.x * -1;
        }
      }
      if (direction == "right") {
        if (head.x < -boardSize / 2 - 0.5) {
          head.x = head.x * -1;
        }
      }
      if (direction == "up") {
        if (head.y > boardSize / 2 - 0.5) {
          head.y = head.y * -1;
        }
      }
      if (direction == "down") {
        if (head.y < -boardSize / 2 - 0.5) {
          head.y = head.y * -1;
        }
      }
    }
  };

  const generateApple = () => {
    let test = 0;
    let type = Math.floor(Math.random() * 9);

    const applePosition = {
      x:
        Math.floor(
          Math.random() * (boardSize / 2 - 1 - -(boardSize / 2 - 1) + 1)
        ) -
        (boardSize / 2 - 1),
      y:
        Math.floor(
          Math.random() * (boardSize / 2 - 1 - -(boardSize / 2 - 1) + 1)
        ) -
        (boardSize / 2 - 1),
    };

    snake.forEach((e) => {
      if (e.position.x == applePosition.x && e.position.y == applePosition.y) {
        test = 1;
      }
    });

    food.forEach((e) => {
      if (e.position.x == applePosition.x && e.position.y == applePosition.y) {
        test = 1;
      }
    });
    if (test == 0) {
      const appleGeometry = new THREE.SphereGeometry(0.5, 64, 32); //0.5,32,16
      let appleMaterial;
      if (type < 6) {
        appleMaterial = new THREE.MeshPhongMaterial({
          color: 0xff0000,
        });
      } else {
        appleMaterial = new THREE.MeshPhongMaterial({
          color: 0x2d23e8,
        });
      }

      const apple = new THREE.Mesh(appleGeometry, appleMaterial);
      apple.position.set(applePosition.x, applePosition.y, 0.5);

      //////////////////
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(applePosition.x, applePosition.y, 5);
      scene.add(light);
      lights.push(light);
      //////////////////

      food.push(apple);
      scene.add(apple);
    } else {
      generateApple();
    }
  };

  const grow = (head) => {
    food.forEach((e, i) => {
      if (e.position.x == head.x && e.position.y == head.y) {
        if (food[i].material.color.r != 1) {
          bandOn = false;
          clearInterval(counter);
          scene.remove(border);
          sec = 10;
          counter = setInterval(timer, 1000);
        }

        play("collect");

        score++;
        food.slice(i, 1);
        scoreValue.textContent = score;
        scene.remove(food[i]);
        food.splice(i, 1);

        ///////
        lights.slice(i, 1);
        scene.remove(lights[i]);
        lights.splice(i, 1);
        ///////

        const endOfTail = {
          x: snake[0].position.x,
          y: snake[0].position.y,
        };
        cube = new THREE.Mesh(boxGeometry, boxMaterial);
        cube.position.set(endOfTail.x, endOfTail.y, 0);
        snake.unshift(cube);
        scene.add(cube);
      }
    });
  };

  const seflColission = (head) => {
    const tail = [];
    for (let i = 0; i < snake.length - 1; i++) {
      tail.push(snake[i]);
    }

    tail.forEach((e) => {
      if (e.position.x == head.x && e.position.y == head.y) {
        gameOver();
      }
    });
  };

  const gameOver = () => {
    play("hit");
    clearInterval(game);
    clearInterval(generateApples);
    clearInterval(counter);
    setTimeout(() => {
      canvas.classList.add("none");
      startSection.classList.add("none");
      gameSection.classList.add("none");
      endSection.classList.remove("none");
      endScore.textContent = score;
      timeInfo.classList.add("hidden");
      soundButton.innerHTML = "<i class='fas fa-volume-up'></i>";
      gridButton.textContent = "Show Grid";
      score = 0;
      scoreValue.textContent = 0;
    }, 1000);
  };

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  };

  gridButton.addEventListener("click", () => {
    if (!gridOn) {
      gridButton.textContent = "Turn off the grid";
      scene.add(gridGroup);
    } else {
      gridButton.textContent = "Show grid";
      scene.remove(gridGroup);
    }
    gridOn = !gridOn;
  });
  soundButton.addEventListener("click", () => {
    if (!soundOn) {
      soundButton.innerHTML = "<i class='fas fa-volume-up'></i>";
    } else {
      soundButton.innerHTML = "<i class='fas fa-volume-mute'></i>";
    }
    soundOn = !soundOn;
  });

  const timer = () => {
    timeInfo.classList.remove("hidden");
    sec--;
    timerValue.textContent = sec;
    if (sec == 0) {
      timeInfo.classList.add("hidden");
      bandOn = true;
      sec = 10;
      scene.add(border);
      clearInterval(counter);
    }
  };

  const play = (name) => {
    if (soundOn) {
      let play;
      switch (name) {
        case "hit":
          play = new Audio("audio/hit.wav");
          break;
        case "collect":
          play = new Audio("audio/collect.wav");
          break;
      }
      play.play();
    }
  };

  init();
  window.addEventListener("keydown", changeDirection);
  window.addEventListener("resize", resize);
  const game = setInterval(move, gameSpeed);
  const generateApples = setInterval(generateApple, 3000);
};

const startGame = () => {
  canvas.classList.remove("none");
  gameSection.classList.remove("none");
  startSection.classList.add("none");
  endSection.classList.add("none");
  game();
};

startButton.addEventListener("click", () => {
  rad.forEach((e, i) => {
    if (e.checked == true) {
      if (i == 0) {
        boardSize = 50;
      } else if (i == 1) {
        boardSize = 40;
      } else {
        boardSize = 30;
      }
    }
  });
  startGame();
});

endButton.addEventListener("click", () => {
  startGame();
});

endBack.addEventListener("click", () => {
  canvas.classList.add("none");
  gameSection.classList.add("none");
  startSection.classList.remove("none");
  endSection.classList.add("none");
});
