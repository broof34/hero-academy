/* Generic Space Shooter, MIT, Jafnee Jesmee; see LICENSE.txt. Kenney sprites: CC0, see KENNEY-LICENSE.txt. Academy wrapper and rendering changes: MIT. */
var modules={},instances={};function define(id,deps,factory){modules[id]={deps:deps,factory:factory}}function resolve(id){if(instances[id])return instances[id];var m=modules[id];if(!m)throw new Error('Missing module '+id);return instances[id]=m.factory.apply(null,m.deps.filter(Boolean).map(resolve))}
define('model/canvas',[],()=>{const canvas=document.querySelector('canvas');return {canvas,context:canvas.getContext('2d'),canvasWidth:1000,canvasHeight:500}});
define('controller/localStorageManager',[],()=>({set(){},get(){return 0},init(){},load(){}}));
define('model/sounds',[],()=>new Proxy({},{get:()=>({play(){}})}));
define('model/images',[],()=>window.academyImages);
define('model/game',["model/canvas"], function (Canvas) {
    var generateStar = function generateStar(old) {
        var star = {
            y: Math.floor(Math.random() * Canvas.canvasHeight) + 1,
            speed: Math.floor(Math.random() * 4) + 1
        };
        if (old) {
            star.x = Canvas.canvasWidth;
        } else {
            star.x = Math.floor(Math.random() * Canvas.canvasWidth) + 1;
        }
        return star;
    };

    var addStars = function addStars() {
        "use strict";
        var i;
        for (i = 0; i < Game.noStars; i += 1) {
            Game.stars.push(generateStar());
        }
    };

    var getScreen = function getScreen() {
        var screen, curPage;
        curPage = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
        if (curPage === "" || curPage === "index.html") {
            Game.screen = "main_menu";
        } else if (curPage === "about.html") {
            Game.screen = "about";
        }
        return screen;
    };

    var keyboard = {
        use: false,
        sbFlag: false,
        up: false,
        down: false
    };
    var mouse = {
        use: false,
        mdFlag: false,
        pos: pos = {
            x: 100,
            y: 100
        }
    };
    var Game = {
        //functions
        generateStar: generateStar,
        addStars: addStars,
        getScreen: getScreen,
        //variables
        stars: stars = [],
        noStars: 300,
        screen: "",
        timer: 0,
        level: 1,
        gameOver: false,
        levelStarted: false,
        keyboard: keyboard,
        mouse: mouse,
        fps: 0,
        lastCalledTime: 0,
        lastScreen: "main_menu",
        paused: false,
        screenTooSmall: false,
        //user settings
        muteMusic: false,
        musicCreated: false,
        muteSFX: false,
        disableHelp: false,
        //stats
        highscore: 0,
        isHighScore: false,
        //enemies killed
        scout: 0,
        fighter: 0,
        interceptor: 0,
        tank: 0,
        transport: 0
    };

    return Game;
});

define('model/character',["model/images"], function (Images) {
    var player = {
        name: "player1",
        sprite: Images.playerShip,
        width: 75,
        height: 99,
        frame: 0,
        score: 0,
        damage: 10,
        guns: 1,
        fireRate: 3,
        hasShot: false,
        hp: 100,
        lives: 3,
        pos: pos = {
            x: 40,
            y: 100
        }
    };
    var enemy = {
        scout: scout = {
            name: "scout",
            ship: Images.scout,
            width: 84,
            height: 93,
            hp: 10,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 100,
            x: 0,
            y: 0,
            time: 0,
            speed: 7
        },
        fighter: fighter = {
            name: "fighter",
            ship: Images.fighter,
            width: 84,
            height: 104,
            hp: 30,
            alive: true,
            damage: 10,
            fireRate: 3,
            hasShot: false,
            score: 200,
            x: 100,
            y: 100,
            time: 0,
            speed: 3
        },
        interceptor: interceptor = {
            name: "interceptor",
            ship: Images.interceptor,
            width: 84,
            height: 103,
            hp: 30,
            alive: true,
            damage: 10,
            fireRate: 4,
            hasShot: false,
            score: 300,
            x: 100,
            y: 100,
            time: 0,
            speed: 2.5
        },
        tank: tank = {
            name: "tank",
            ship: Images.tank,
            width: 84,
            height: 82,
            hp: 60,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 300,
            x: 100,
            y: 100,
            time: 0,
            speed: 2
        },
        transport: transport = {
            name: "transport",
            ship: Images.transport,
            width: 84,
            height: 97,
            hp: 30,
            alive: true,
            damage: 0,
            fireRate: 0,
            hasShot: false,
            score: 400,
            x: 100,
            y: 100,
            time: 0,
            speed: 3
        }

    };
    var ship = {
        enemy: enemy,
        player: player
    };
    var Character = {
        ship: ship
    };
    return Character;
});

define('model/inPlay',[], function () {
    var InPlay = {
        enemies: enemies = [],
        playerBullets: playerBullets = [],
        enemyBullets: enemyBullets = [],
        powerUps: powerUps = []
    };
    return InPlay;
});

define('controller/gameLogic',["model/game", "model/character", "model/inPlay", "model/canvas", "model/sounds", "model/images", "controller/localStorageManager"], function (Game, Character, InPlay, Canvas, Sounds, Images, LSM) {
    var timerInterval;
    var resetTimer = function resetTimer() {
        Game.timer = 0;
    };

    var clone = (function () {
        return function (obj) {
            Clone.prototype = obj;
            return new Clone();
        };

        function Clone() {}
    }());

    var startTimer = function startTimer() {
        timerInterval = setInterval(function () {
            if (Game.levelStarted) {
                Game.timer += 0.01;
                GameLogic.addScore(2);
            }
        }, 10);
    };

    var addScore = function addScore(add) {
        Character.ship.player.score += add;
    };

    var stopTimer = function stopTimer() {
        clearInterval(timerInterval);
    };

    var getTimer = function getTimer() {
        return Game.timer;
    };

    var timer = {
        reset: resetTimer,
        start: startTimer,
        stop: stopTimer,
        get: getTimer
    };

    var startLevel = function startLevel() {
        setTimeout(function () {
            if (!Game.muteSFX) {
                Sounds.levelUp.play();
            }
            Game.levelStarted = true;
            GameLogic.timer.start();
            GameLogic.addEnemies();
        }, 3000);
    };

    var checkEnemiesDead = function checkEnemiesDead() {
        var alive = 0;
        var enemies = InPlay.enemies;
        var i;
        if (enemies.length > 0 && !Game.gameOver) {
            for (i = 0; i < enemies.length; i++) {
                if (enemies[i].alive) {
                    alive++;
                }
            }
            if (alive === 0) {
                GameLogic.timer.stop();
                enemies.length = 0;
                Game.level++;
                Game.levelStarted = false;
                GameLogic.level.start();
            }
        }
    };

    var checkBulletCollision = function checkBulletCollision() {
        var bullet, ship;
        var enemyBullets = InPlay.enemyBullets;
        var playerPos = Character.ship.player.pos;
        var playerBullets = InPlay.playerBullets;
        var enemies = InPlay.enemies;
        for (bullet = 0; bullet < playerBullets.length; bullet++) {
            if (playerBullets[bullet].alive) {
                for (ship = 0; ship < enemies.length; ship++) {
                    if (enemies[ship].alive) {
                        if (playerBullets[bullet].x >= enemies[ship].x && playerBullets[bullet].x <= enemies[ship].x + enemies[ship].width) {
                            if (playerBullets[bullet].y >= (enemies[ship].y - 9) && playerBullets[bullet].y <= enemies[ship].y + enemies[ship].height) {
                                playerBullets[bullet].alive = false;
                                enemies[ship].hp -= playerBullets[bullet].damage;
                                if (enemies[ship].hp <= 0) {
                                    if (!Game.muteSFX) {
                                        Sounds.death.play();
                                    }
                                    enemies[ship].alive = false;
                                    GameLogic.addScore(enemies[ship].score);
                                    if (enemies[ship].name === "transport") {
                                        GameLogic.dropPickUp(enemies[ship].x, enemies[ship].y);
                                        Game.transport += 1;
                                    }
                                    if (enemies[ship].name === "scout") {
                                        Game.scout += 1;
                                    }
                                    if (enemies[ship].name === "fighter") {
                                        Game.fighter += 1;
                                    }
                                    if (enemies[ship].name === "interceptor") {
                                        Game.interceptor += 1;
                                    }
                                    if (enemies[ship].name === "tank") {
                                        Game.tank += 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (bullet = 0; bullet < enemyBullets.length; bullet++) {
            if (enemyBullets[bullet].alive) {
                if (enemyBullets[bullet].x >= playerPos.x - 13 && enemyBullets[bullet].x <= playerPos.x + Character.ship.player.width) {
                    if (enemyBullets[bullet].y >= playerPos.y - Character.ship.player.height / 2 && enemyBullets[bullet].y <= playerPos.y + Character.ship.player.height / 2) {
                        if (!Game.muteSFX) {
                            Sounds.playerHit.play();
                        }
                        enemyBullets[bullet].alive = false;
                        Character.ship.player.hp -= enemyBullets[bullet].damage;
                        if (Character.ship.player.hp <= 0) {
                            if (!Game.muteSFX) {
                                Sounds.explosion.play();
                            }
                            GameLogic.gameOver();
                        }
                    }
                }
            }
        }
    };

    var dropPickUp = function dropPickUp(x, y) {
        var selector;
        selector = Math.floor(Math.random() * (3 - 1 + 1) + 1);
        var pickUp = {
            x: x,
            y: y + 45,
            alive: true
        };
        if (selector === 1) {
            pickUp.type = "health";
            pickUp.icon = Images.pickUpHealth;
        } else if (selector === 2) {
            pickUp.type = "fireRate";
            pickUp.icon = Images.pickUpFireRate;
        } else if (selector === 3) {
            pickUp.type = "damage";
            pickUp.icon = Images.pickUpDamage;
        }
        InPlay.powerUps.push(pickUp);
    };

    var checkPickUp = function checkPickUp() {
        var powerUps = InPlay.powerUps;
        var player = Character.ship.player;
        var i;
        for (i = 0; i < powerUps.length; i++) {
            if (powerUps[i].alive) {
                if (powerUps[i].x >= player.pos.x && powerUps[i].x <= (player.pos.x + player.width)) {
                    if (powerUps[i].y >= (player.pos.y - player.height) && powerUps[i].y <= player.pos.y + player.height / 2) {
                        if (!Game.muteSFX) {
                            Sounds.powerUp.play();
                        }
                        if (powerUps[i].type === "health") {
                            player.hp += 20;
                        } else if (powerUps[i].type === "fireRate") {
                            player.fireRate -= 0.09;
                            GameLogic.fRate = true;
                        } else if (powerUps[i].type === "damage") {
                            player.damage += 1;
                        }
                        powerUps[i].alive = false;
                    }
                }
            }
        }
    };

    var checkShipCollision = function checkShipCollision() {
        var enemies = InPlay.enemies;
        var player = Character.ship.player;
        var playerPos = Character.ship.player.pos;
        var ship;
        for (ship = 0; ship < enemies.length; ship++) {
            if (Character.ship.player.hp > 0 && enemies[ship].alive) {
                if ((enemies[ship].x >= playerPos.x && enemies[ship].x <= (playerPos.x + player.width)) || (enemies[ship].x + enemies[ship].width >= playerPos.x && enemies[ship].x + enemies[ship].width <= (playerPos.x + player.width))) {
                    if ((enemies[ship].y >= (playerPos.y - player.height) && enemies[ship].y <= (playerPos.y + player.height / 2)) || ((playerPos.y - player.height / 2) >= enemies[ship].y && (playerPos.y - player.height / 2) <= (enemies[ship].y + enemies[ship].height))) {
                        if (!Game.muteSFX) {
                            Sounds.playerHit.play();
                            Sounds.death.play();
                        }
                        enemies[ship].alive = false;
                        Character.ship.player.hp -= enemies[ship].hp;
                        if (Character.ship.player.hp <= 0) {
                            if (!Game.muteSFX) {
                                Sounds.explosion.play();
                            }
                            GameLogic.gameOver();
                        }
                    }
                }
            }
        }
    };

    var gameOver = function gameOver() {
        var isHighscore = false;
        var enemies = InPlay.enemies;
        GameLogic.timer.stop();
        enemies.length = 0;
        Game.levelStarted = false;
        Game.gameOver = true;
        if (Game.highscore < Character.ship.player.score) {
            isHighscore = true;
            Game.highscore = Character.ship.player.score;
        }
        GameLogic.uploadStats(isHighscore);
        Game.screen = "game_over";
    };

    var uploadStats = function uploadStats(isHighscore) {
        if (isHighscore) {
            LSM.set("highscore", Game.highscore);
            Game.isHighscore = true;
        } else {
            Game.isHighscore = false;
        }
        LSM.set("scout", Game.scout);
        LSM.set("fighter", Game.fighter);
        LSM.set("interceptor", Game.interceptor);
        LSM.set("tank", Game.tank);
        LSM.set("transport", Game.transport);
    };

    var resetStats = function resetStats() {
        Game.highscore = 0;
        Game.scout = 0;
        Game.fighter = 0;
        Game.interceptor = 0;
        Game.tank = 0;
        Game.transport = 0;
        LSM.set("highscore", 0);
        LSM.set("scout", 0);
        LSM.set("fighter", 0);
        LSM.set("interceptor", 0);
        LSM.set("tank", 0);
        LSM.set("transport", 0);
    };

    var checkCollisions = function checkCollisions() {
        GameLogic.checkShipCollision();
        GameLogic.checkBulletCollision();
        GameLogic.checkEnemiesDead();
        GameLogic.checkPickUp();
    };

    var spawnCheck = function spawnCheck(newShip, spawnTime) {
        var i, enemies, spawningY, verdict, time;
        verdict = true;
        time = spawnTime;
        spawningY = newShip;
        enemies = InPlay.enemies;
        if (enemies.length >= 1) {
            for (i = 0; i < enemies.length; i++) {
                if (time < enemies[i].time + 1) {
                    if (spawningY > enemies[i].y - 104 && spawningY < enemies[i].y + 104) {
                        verdict = false;
                    }
                }
            }
        }
        return verdict;
    };

    var addEnemies = function addEnemies() {
        var i, enemy, x, y, noEnemies, rate, selector, lvlSelector;
        noEnemies = Game.level * 5;
        if (Game.level <= 5) {
            lvlSelector = Game.level;
        } else {
            lvlSelector = 5;
        }
        if (Game.level < 6) {
            rate = 1;
        } else {
            rate = 0.5;
        }
        var time = 0;
        GameLogic.level.startTime = Game.timer;
        for (i = 0; i < noEnemies; i++) {
            selector = Math.floor(Math.random() * (lvlSelector - 1 + 1) + 1);
            if (selector === 1) {
                enemy = GameLogic.clone(Character.ship.enemy.scout);
            } else if (selector === 2) {
                enemy = GameLogic.clone(Character.ship.enemy.fighter);
            } else if (selector === 3) {
                if (Game.level % 3 === 0) {
                    enemy = GameLogic.clone(Character.ship.enemy.transport);
                } else {
                    enemy = GameLogic.clone(Character.ship.enemy.scout);
                }
            } else if (selector === 4) {
                enemy = GameLogic.clone(Character.ship.enemy.tank);
            } else if (selector === 5) {
                enemy = GameLogic.clone(Character.ship.enemy.interceptor);
            }
            y = Math.floor(Math.random() * (Canvas.canvasHeight - 90)) + 1;
            if (GameLogic.spawnCheck(y, time)) {
                x = Canvas.canvasWidth + 100;
                enemy.y = y;
                enemy.x = x;
                enemy.hp += Game.level * (Math.floor(Game.level / 2) - 1);
                enemy.time = time;
                time += rate;
                InPlay.enemies.push(enemy);
            } else {
                i--;
            }
        }
    };

    var level = {
        //functions
        start: startLevel,
        //variables
        startTime: 0
    };

    var GameLogic = {
        //functions
        clone: clone,
        spawnCheck: spawnCheck,
        addEnemies: addEnemies,
        checkBulletCollision: checkBulletCollision,
        checkShipCollision: checkShipCollision,
        checkPickUp: checkPickUp,
        checkCollisions: checkCollisions,
        checkEnemiesDead: checkEnemiesDead,
        dropPickUp: dropPickUp,
        addScore: addScore,
        gameOver: gameOver,
        uploadStats: uploadStats,
        resetStats: resetStats,
        //variables
        paused: false,
    fRate: false,
        level: level,
        timer: timer
    };
    return GameLogic;
});

define('controller/action',["model/game", "model/canvas", "model/character", "model/images", "model/inPlay", "controller/gameLogic", "model/sounds", "controller/localStorageManager"],
    function (Game, Canvas, Character, Images, InPlay, GameLogic, Sounds, LSM) {
        var shooting;
        var getMousePos = function getMousePos(evt) {
            Game.keyboard.use = false;
            Game.mouse.use = true;
            var rect = Canvas.canvas.getBoundingClientRect();
            Game.mouse.pos.x = evt.clientX - rect.left;
            Game.mouse.pos.y = evt.clientY - rect.top;
            Character.ship.player.pos.y = Game.mouse.pos.y;
            if (Game.mouse.pos.x <= 0 || Game.mouse.pos.x >= Canvas.canvasWidth || Game.mouse.pos.y <= 0 || Game.mouse.pos.y >= Canvas.canvasHeight) {
                clearInterval(Action.shooting);
            }
        };

        var resize = function resize() {
            Canvas.contextCanvasWidth = window.innerWidth;
            Canvas.contextCanvasHeight = window.innerHeight - 70;
            Canvas.canvasWidth = Canvas.canvas.width;
            Canvas.canvasHeight = Canvas.canvas.height;
            canvas = document.getElementById("gameCanvas");
            context = canvas.getContext("2d");
            context.canvas.width = window.innerWidth;
            context.canvas.height = window.innerHeight - 70;
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
        };

        var mouseClicked = function mouseClicked(down, kb) {
            Game.keyboard.use = false;
            Game.mouse.use = true;
            switch (Game.screen) {
            case "main_menu":
                if (down && !kb) {
                    Action.mainMenuButtonCheck();
                }
                break;
            case "game":
                if (down && !Game.keyboard.sbFlag) {
                    Game.keyboard.sbFlag = true;
                    if (!Character.ship.player.hasShot) {
                        Action.playerShoot();
                        Character.ship.player.hasShot = true;
                        window.setTimeout(function() {
                            Character.ship.player.hasShot = false;
                        }, Character.ship.player.fireRate * 100);
                    }
                    Action.shooting = setInterval(function () {
                        if (Character.ship.player.hp > 0) {
                            if (GameLogic.fRate) {
                                GameLogic.fRate = false;
                                clearInterval(Action.shooting);
                                Action.shooting = setInterval(function () {
                                    if (Character.ship.player.hp > 0) {
                                        Action.playerShoot();
                                    }
                                }, Character.ship.player.fireRate * 100);
                            }
                            Action.playerShoot();
                        }
                    }, Character.ship.player.fireRate * 100);
                } else if (!down) {
                    clearInterval(Action.shooting);
                    Game.keyboard.sbFlag = false;
                }
                break;
            case "game_over":
                if (down && !kb) {
                    Action.gameOverButtonCheck();
                }
                break;
            case "options":
                if (down && !kb) {
                    Action.optionsButtonCheck();
                }
                break;
            case "stats":
                if (down && !kb) {
                    Action.statsButtonCheck();
                }
                break;
            }
        };

        var moveShip = function moveShip() {
            if (Game.keyboard.use) {
                if (Game.keyboard.up) {
                    if (Character.ship.player.pos.y >= 10) {
                        Character.ship.player.pos.y -= 10;
                    }
                } else if (Game.keyboard.down) {
                    if (Character.ship.player.pos.y <= Canvas.canvasHeight - 14) {
                        Character.ship.player.pos.y += 10;
                    }
                }
            }
        };

        var gameOverButtonCheck = function gameOverButtonCheck() {
            var mouseX, mouseY, part1, part2;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Action.resetVariables();
                Game.screen = "game";
                GameLogic.level.start();
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "main_menu";
            }
        };

        var optionsButtonCheck = function optionsButtonCheck() {
            var mouseX, mouseY, part1, part2;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                if (Game.muteMusic === false) {
                    Game.muteMusic = true;
                    LSM.set("music", "false");
                    Sounds.bgMusic.mute();
                } else {
                    if (!Game.musicCreated) {
                        Sounds.bgMusic.play();
                        Game.musicCreated = true;
                    }
                    Sounds.bgMusic.unmute();
                    Game.muteMusic = false;
                    LSM.set("music", "true");
                }
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                if (Game.muteSFX === false) {
                    Game.muteSFX = true;
                    LSM.set("sfx", "false");
                } else {
                    Game.muteSFX = false;
                    LSM.set("sfx", "true");
                }
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "main_menu";
            }
        };

        var statsButtonCheck = function statsButtonCheck() {
            var mouseX, mouseY, part1, part2;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "main_menu";
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                GameLogic.resetStats();
            }
        };

        var mainMenuButtonCheck = function mainMenuButtonCheck() {
            var mouseX, mouseY, part1, part2;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "game";
                Action.resetVariables();
                GameLogic.level.start();
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "options";
            }
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "stats";
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                if (!Game.muteSFX) {
                    Sounds.select.play();
                }
                Game.screen = "paused";
                Game.paused = true;
            }
        };

        var enemyShoot = function enemyShoot(x, y, damage) {
            var bullet, tempDamage, tempX, tempY;
            tempX = x;
            tempY = y;
            tempDamage = damage;
            if (!Game.muteSFX) {
                Sounds.laser2.play();
            }
            bullet = {
                x: tempX,
                y: tempY + 52,
                damage: tempDamage,
                alive: true,
                type: Images.redLaser1
            };
            InPlay.enemyBullets.push(bullet);
        };

        var playerShoot = function playerShoot() {
            var bullet, i, tempDamage, tempType;
            if (Game.screen === "game") {
                upgrade = Character.ship.player.upgrade;
                if (!Game.muteSFX) {
                    Sounds.laser1.play();
                }
                bullet = {
                    x: Character.ship.player.pos.x,
                    y: Character.ship.player.pos.y,
                    alive: true
                };
                tempDamage = Character.ship.player.damage;
                tempType = Images.blueLaser1;

                bullet.x += 60;
                bullet.y -= 4;
                bullet.type = tempType;
                bullet.damage = tempDamage;
                InPlay.playerBullets.push(bullet);
            }
        };

        var resetVariables = function resetVariables() {
            //game resets
            Game.gameOver = false;
            Game.timer = 0;
            Game.level = 1;
            Game.levelStarted = false;
            InPlay.enemies.length = 0;
            InPlay.enemyBullets.length = 0;
            InPlay.powerUps.length = 0;
            //character resets
            Character.ship.player.score = 0;
            Character.ship.player.hp = 100;
            Character.ship.player.guns = 1;
            Character.ship.player.damage = 10;
            Character.ship.player.fireRate = 3;
        };

        var Action = {
            moveShip: moveShip,
            shooting: shooting,
            mouseClicked: mouseClicked,
            playerShoot: playerShoot,
            enemyShoot: enemyShoot,
            resetVariables: resetVariables,
            mainMenuButtonCheck: mainMenuButtonCheck,
            optionsButtonCheck: optionsButtonCheck,
            gameOverButtonCheck: gameOverButtonCheck,
            statsButtonCheck: statsButtonCheck,
            getMousePos: getMousePos,
            resize: resize
        };
        return Action;
    });

define('view/draw',["model/images", "model/canvas", "model/game", "model/character", "controller/gameLogic", "model/inPlay", "controller/action"],
    function (Images, Canvas, Game, Character, GameLogic, InPlay, Action) {
        var drawStars = function drawStars() {
            var i, size, x, y;
            for (i = 0; i < Game.stars.length; i += 1) {
                if (Game.stars[i].x < 0) {
                    Game.stars[i] = Game.generateStar(true);
                }
                size = Game.stars[i].speed / 2;
                x = Game.stars[i].x;
                y = Game.stars[i].y;
                Canvas.context.fillStyle = "rgba(255,255,255,0.5)";
                Canvas.context.fillRect(x, y, size, size);
                Game.stars[i].x -= Game.stars[i].speed;
            }
        };

        var drawBackground = function drawBackground() {
            var mousex, mousey;
            mousex = Game.mouse.pos.x;
            mousey = Game.mouse.pos.Y;
            //Black space
            Canvas.context.fillStyle = "#000000";
            Canvas.context.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
            //Debris/Stars
            drawStars();
        };
        var drawMainMenu = function drawMainMenu() {
            var part1, part2, start, options, stats, help, mouseX, mouseY;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            //Button animation
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                start = Images.start1;
            } else {
                start = Images.start0;
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                options = Images.options1;
            } else {
                options = Images.options0;
            }
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                stats = Images.stats1;
            } else {
                stats = Images.stats0;
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                help = Images.help1;
            } else {
                help = Images.help0;
            }
            //drawing button
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.drawImage(Images.bigLogo, part1 * 1.1, part2 * 0.1, part1 * 1.8, part2);
            Canvas.context.drawImage(start, part1 * 1.2, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(options, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(stats, part1 * 1.2, part2 * 2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(help, part1 * 2.1, part2 * 2, part1 * 0.75, part2 * 0.7);
        };

        var drawOptions = function drawOptions() {
            var part1, part2, muteMusic, muteSFX, mainMenu;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            var mouseX = Game.mouse.pos.x;
            var mouseY = Game.mouse.pos.y;
            //Button animation
            if (Game.muteMusic) {
                muteMusic = Images.muteMusic1;
            } else {
                muteMusic = Images.muteMusic0;
            }
            if (Game.muteSFX) {
                muteSFX = Images.muteSFX1;
            } else {
                muteSFX = Images.muteSFX0;
            }

            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                mainMenu = Images.mainMenu1;
            } else {
                mainMenu = Images.mainMenu0;
            }
            //drawing button
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.drawImage(Images.bigLogo, part1 * 1.1, part2 * 0.1, part1 * 1.8, part2);
            Canvas.context.drawImage(muteMusic, part1 * 1.2, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(muteSFX, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(mainMenu, part1 * 2.1, part2 * 2, part1 * 0.75, part2 * 0.7);
        };

        var drawMenu = function drawMenu() {
            switch (Game.screen) {
            case "main_menu":
                Draw.drawMainMenu();
                break;
            case "game_over":
                Draw.drawGameOver();
                break;
            case "options":
                Draw.drawOptions();
                break;
            case "stats":
                Draw.drawStats();
                break;
            case "paused":
                Draw.drawPause();
                break;
            default:
                break;
            }
        };

        var drawPlayerShip = function drawPlayerShip() {
            var sprite, sx, sy, width, height, x, y, frame;
            frame = Character.ship.player.frame;
            x = Character.ship.player.pos.x;
            y = Character.ship.player.pos.y;
            sprite = Character.ship.player.sprite;
            width = Character.ship.player.width;
            height = Character.ship.player.height;
            sy = 0;
            if (Character.ship.player.hp > 0) {
                Canvas.context.drawImage(Images.gun0, x + 55, y - 8.5);
                if (frame === 0) {
                    sx = 0;
                } else if (frame === 1) {
                    sx = 75;
                } else if (frame === 2) {
                    sx = 150;
                } else if (frame === 3) {
                    sx = 225;
                }
                Character.ship.player.frame += 1;
                if (Character.ship.player.frame >= 4) {
                    Character.ship.player.frame = 0;
                }
            } else {
                width = 192;
                height = 192;
                sprite = Images.explosion;
                if (frame === 0) {
                    sx = 0;
                } else if (frame <= 1) {
                    sx = 192;
                } else if (frame <= 2) {
                    sx = 384;
                } else if (frame <= 3) {
                    sx = 576;
                } else if (frame <= 4) {
                    sx = 768;
                } else if (frame <= 5) {
                    sx = 960;
                } else if (frame <= 6) {
                    sx = 0;
                    sy = 192;
                } else if (frame <= 7) {
                    sx = 192;
                    sy = 192;
                }
                Character.ship.player.frame += 0.2;
            }
            Canvas.context.drawImage(sprite, sx, sy, width, height, x, y - (height / 2), width, height);
        };

        var drawPowerups = function drawPowerups() {
            var i;
            var powerUps = InPlay.powerUps;
            for (i = 0; i < powerUps.length; i += 1) {
                if (powerUps[i].alive) {
                    Canvas.context.drawImage(powerUps[i].icon, powerUps[i].x, powerUps[i].y);
                    if (powerUps[i].x <= -10) {
                        powerUps[i].alive = false;
                    } else {
                        powerUps[i].x -= 4;
                    }
                }
            }
        };

        var drawEnemies = function drawEnemies() {
            var i, relativeTime;
            var enemies = InPlay.enemies;
            for (i = 0; i < enemies.length; i += 1) {
                if (enemies[i].alive) {
                    relativeTime = Game.timer - GameLogic.level.startTime;
                    if (relativeTime > enemies[i].time) {
                        Canvas.context.drawImage(enemies[i].ship, enemies[i].x, enemies[i].y);
                        if (enemies[i].x <= -140) {
                            enemies[i].alive = false;
                            Character.ship.player.score -= enemies[i].score * 1.4;
                        } else {
                            enemies[i].x -= enemies[i].speed;
                            if (enemies[i].name === "interceptor") {
                                if (enemies[i].x > Canvas.canvasWidth/2) {
                                    if (enemies[i].y + 2 < Character.ship.player.pos.y - 49.5) {
                                        enemies[i].y += 2;
                                    } else if (enemies[i].y - 2 > Character.ship.player.pos.y - 49.5) {
                                        enemies[i].y -= 2;
                                    }
                                }
                            }
                            if (enemies[i].fireRate > 0) {
                                if ((relativeTime-enemies[i].time) % enemies[i].fireRate <= 0.02) {
                                    enemies[i].hasShot = true;
                                    Action.enemyShoot(enemies[i].x, enemies[i].y, enemies[i].damage);
                                }
                            }
                        }
                    }
                }
            }
        };

        var drawBullets = function drawBullets() {
            var i;
            var playerBullets = InPlay.playerBullets;
            var enemyBullets = InPlay.enemyBullets;
            for (i = 0; i < playerBullets.length; i += 1) {
                if (playerBullets[i].alive) {
                    Canvas.context.drawImage(playerBullets[i].type, playerBullets[i].x, playerBullets[i].y);
                    if (playerBullets[i].x >= Canvas.canvasWidth) {
                        playerBullets.shift();
                    } else {
                        playerBullets[i].x += 40;
                    }
                }
            }
            for (i = 0; i < enemyBullets.length; i += 1) {
                if (enemyBullets[i].alive) {
                    Canvas.context.drawImage(enemyBullets[i].type, enemyBullets[i].x, enemyBullets[i].y);
                    if (enemyBullets[i].x <= 0) {
                        enemyBullets.shift();
                    } else {
                        enemyBullets[i].x -= 10;
                    }
                }
            }
        };

        var drawScore = function drawScore() {
            var score = Character.ship.player.score;
            Canvas.context.fillStyle = ("yellow");
            Canvas.context.fillText("Score: " + score, Canvas.canvasWidth * 0.6, 40);
        };

        var drawHP = function drawHP() {
            var hp = Character.ship.player.hp;
            Canvas.context.fillStyle = ("yellow");
            Canvas.context.fillText("Health: " + hp, 0, 40);
        };

        var drawGameOver = function drawGameOver() {
            var restart, mainMenu;
            var part1 = Canvas.canvasWidth / 4;
            var part2 = Canvas.canvasHeight / 4;
            var mouseX = Game.mouse.pos.x;
            var mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 1.2 && mouseX <= part1 * 1.2 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                restart = Images.restart1;
            } else {
                restart = Images.restart0;
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                mainMenu = Images.mainMenu1;
            } else {
                mainMenu = Images.mainMenu0;
            }
            Draw.drawPlayerShip();
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 2);
            Canvas.context.drawImage(Images.bigLogo, part1 * 1.1, part2 * 0.1, part1 * 1.8, part2);
            Canvas.context.drawImage(restart, part1 * 1.2, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(mainMenu, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            if (Game.isHighscore) {
                Canvas.context.fillStyle = ("yellow");
                Canvas.context.fillText("HIGH SCORE", (Canvas.canvasWidth / 2) - 108, Canvas.canvasHeight / 1.7);
            }
            Canvas.context.fillStyle = ("yellow");
            Canvas.context.fillText("Game Over  Level: " + Game.level + "  Score: " + Character.ship.player.score, (Canvas.canvasWidth / 2) - 345, Canvas.canvasHeight / 1.5);
        };

        var drawStats = function drawStats() {
            var part1, part2, mainMenu, resetStats, mouseX, mouseY;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                mainMenu = Images.mainMenu1;
            } else {
                mainMenu = Images.mainMenu0;
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                resetStats = Images.resetStats1;
            } else {
                resetStats = Images.resetStats0;
            }
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.fillStyle = 'rgba(0,0,0,0.5)';
            Canvas.context.fillRect(part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.fillStyle = 'yellow';
            Canvas.context.drawImage(mainMenu, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(resetStats, part1 * 2.1, part2 * 2, part1 * 0.75, part2 * 0.7);
            Canvas.context.fillText("Highscore: " + Game.highscore, part1 * 1.1, part2 * 0.5);
            Canvas.context.fillText("Enemies killed", part1 * 1.1, part2);
            Canvas.context.fillText("Scout: " + Game.scout, part1 * 1.1, part2 * 1.40);
            Canvas.context.fillText("Fighter: " + Game.fighter, part1 * 1.1, part2 * 1.70);
            Canvas.context.fillText("Interceptor: " + Game.interceptor, part1 * 1.1, part2 * 2);
            Canvas.context.fillText("Tank: " + Game.tank, part1 * 1.1, part2 * 2.30);
            Canvas.context.fillText("Transporter: " + Game.transport, part1 * 1.1, part2 * 2.60);
        };

        var drawPause = function drawPause() {
            Canvas.context.drawImage(Images.pauseScreen, 0, 0, Canvas.canvasWidth, Canvas.canvasHeight);
        };

        var drawGame = function drawGame() {
            if (Game.levelStarted) {
                Draw.drawScore();
                Draw.drawHP();
            } else {
                Canvas.context.fillStyle = ("yellow");
                Canvas.context.fillText("Level: " + Game.level, (Canvas.canvasWidth / 2) - 80, Canvas.canvasHeight / 2);
            }
            Draw.drawBullets();
            Draw.drawPlayerShip();
            Draw.drawEnemies();
            Draw.drawPowerups();
        };

        var Draw = {
            //functions

            drawStars: drawStars,
            drawBackground: drawBackground,
            drawHP: drawHP,
            drawScore: drawScore,
            drawPlayerShip: drawPlayerShip,
            drawEnemies: drawEnemies,
            drawPowerups: drawPowerups,
            drawBullets: drawBullets,
            drawGame: drawGame,
            drawMainMenu: drawMainMenu,
            drawOptions: drawOptions,
            drawMenu: drawMenu,
            drawStats: drawStats,
            drawPause: drawPause,
            drawGameOver: drawGameOver
        };

        return Draw;
    });

var AcademyClock = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var stdin_exports = {};
  __export(stdin_exports, {
    createFixedClock: () => createFixedClock
  });
  function createFixedClock(update) {
    const step = 1 / 60;
    let accumulator = 0;
    return {
      advance(elapsed) {
        accumulator += Math.max(
          0,
          Math.min(Number.isFinite(elapsed) ? elapsed : 0, 0.1)
        );
        while (accumulator + 1e-9 >= step) {
          update(step);
          accumulator -= step;
        }
      }
    };
  }
  return __toCommonJS(stdin_exports);
})();
(async function () {
  const paths = {
    playerShip: "playerShip",
    scout: "scout",
    fighter: "fighter",
    interceptor: "interceptor",
    tank: "tank",
    transport: "transport",
    pickUpHealth: "pickUpHealth",
    pickUpDamage: "pickUpDamage",
    pickUpFireRate: "pickUpFireRate",
  };
  const images = {};
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => {
      const img = new Image();
      img.src = "sprites/" + path + ".png";
      await img.decode();
      const c = document.createElement("canvas");
      const ship = !key.startsWith("pickUp");
      if (ship) {
        c.width = key === "playerShip" ? 75 : 84;
        c.height = key === "playerShip" ? 99 : 93;
        const ctx = c.getContext("2d");
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(key === "playerShip" ? Math.PI / 2 : -Math.PI / 2);
        ctx.drawImage(img, -c.height / 2, -c.width / 2, c.height, c.width);
        images[key] = c;
      } else images[key] = img;
    }),
  );
  window.academyImages = images;
  const Game = resolve("model/game"),
    Character = resolve("model/character"),
    InPlay = resolve("model/inPlay"),
    GL = resolve("controller/gameLogic"),
    Action = resolve("controller/action"),
    Draw = resolve("view/draw"),
    C = resolve("model/canvas");
  const ctx = C.context,
    player = Character.ship.player;
  let started = false,
    paused = false,
    dir = 0,
    countdown = 0,
    shot = 0,
    last = 0,
    frame = 0,
    muted = true,
    effectsVolume = 1,
    audio;
  Game.muteMusic = true;
  Game.muteSFX = true;
  Game.addStars();
  player.pos.x = 85;
  player.pos.y = 250;
  const status = document.querySelector("#status"),
    overlay = document.querySelector("#overlay"),
    start = document.querySelector("#start");
  start.disabled = false;
  status.textContent = "Ready for launch";
  Draw.drawPlayerShip = function () {
    if (player.hp <= 0) return;
    ctx.shadowColor = "#36d6ff";
    ctx.shadowBlur = 12;
    ctx.drawImage(images.playerShip, player.pos.x, player.pos.y - 49.5, 75, 99);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#56d9ff";
    ctx.beginPath();
    ctx.moveTo(player.pos.x, player.pos.y - 9);
    ctx.lineTo(player.pos.x - 18 - Math.random() * 14, player.pos.y);
    ctx.lineTo(player.pos.x, player.pos.y + 9);
    ctx.fill();
  };
  Draw.drawScore = Draw.drawHP = function () {};
  Draw.drawBullets = function () {
    for (const b of InPlay.playerBullets) {
      if (!b.alive) continue;
      b.x += 20;
      ctx.fillStyle = "#a5f4ff";
      ctx.shadowColor = "#37c9ff";
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x, b.y, 24, 5);
      if (b.x > 1000) b.alive = false;
    }
    for (const b of InPlay.enemyBullets) {
      if (!b.alive) continue;
      b.x -= 7;
      ctx.fillStyle = "#ff715c";
      ctx.fillRect(b.x, b.y, 15, 6);
      if (b.x < 0) b.alive = false;
    }
    ctx.shadowBlur = 0;
    InPlay.playerBullets = InPlay.playerBullets.filter((b) => b.alive);
    InPlay.enemyBullets = InPlay.enemyBullets.filter((b) => b.alive);
  };
  function beep() {
    if (muted || effectsVolume === 0) return;
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") void audio.resume().catch(() => {});
      const o = audio.createOscillator(),
        g = audio.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(650, audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(180, audio.currentTime + 0.07);
      g.gain.setValueAtTime(0.025 * effectsVolume, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.07);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + 0.08);
    } catch {}
  }
  GL.level.start = function () {
    GL.timer.stop();
    Game.levelStarted = false;
    countdown = 1;
  };
  function begin() {
    GL.timer.stop();
    Action.resetVariables();
    InPlay.playerBullets.length = 0;
    Game.screen = "game";
    started = true;
    paused = false;
    player.pos.y = 250;
    overlay.style.display = "none";
    GL.level.start();
    if (!muted) {
      audio ??= new AudioContext();
      syncAudio();
    }
    parent.postMessage({ type: "academy:ready" }, "*");
  }
  start.onclick = begin;
  function syncAudio() {
    if (!audio) return;
    if (muted || paused || effectsVolume === 0) void audio.suspend();
    else void audio.resume().catch(() => {});
  }
  function setPaused(value) {
    if (paused === value) return;
    paused = value;
    dir = 0;
    GL.timer.stop();
    if (!value && started && Game.levelStarted && !Game.gameOver)
      GL.timer.start();
    syncAudio();
    if (value) status.textContent = "Paused · timer still running";
  }
  function background() {
    const g = ctx.createLinearGradient(0, 0, 1000, 500);
    g.addColorStop(0, "#071b32");
    g.addColorStop(0.55, "#132342");
    g.addColorStop(1, "#080d20");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1000, 500);
    ctx.fillStyle = "#1e3854";
    ctx.beginPath();
    ctx.arc(820, 110, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a6281";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(820, 110, 123, 19, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    Draw.drawStars();
  }
  function simulate(dt) {
    if (!paused) {
      background();
      if (started && !Game.gameOver) {
        player.pos.y = Math.max(
          55,
          Math.min(445, player.pos.y + dir * 330 * dt),
        );
        if (countdown > 0) {
          countdown -= dt;
          if (countdown <= 0) {
            Game.levelStarted = true;
            GL.addEnemies();
            GL.timer.start();
          }
        }
        shot -= dt;
        if (shot <= 0 && Game.levelStarted) {
          Action.playerShoot();
          beep();
          shot = player.fireRate * 0.1;
        }
        ctx.font = "bold 24px system-ui";
        Draw.drawGame();
        if (Game.levelStarted) GL.checkCollisions();
        status.textContent =
          "Playing · Score " +
          Math.max(0, Math.round(player.score)) +
          " · Wave " +
          Game.level +
          " · Shields " +
          Math.max(0, player.hp) +
          "%";
        if (Game.gameOver) {
          overlay.style.display = "grid";
          overlay.querySelector("h1").textContent = "GREAT PATROL, HERO!";
          overlay.querySelector("p:nth-of-type(2)").textContent =
            "You protected the galaxy. Try another patrol while your ticket time remains.";
          start.textContent = "Play again";
        }
      } else Draw.drawPlayerShip();
    }
  }
  const fixedClock = AcademyClock.createFixedClock(simulate);
  function tick(now) {
    fixedClock.advance(last ? (now - last) / 1000 : 0);
    last = now;
    frame = requestAnimationFrame(tick);
  }
  function key(e, down) {
    if (
      ["ArrowUp", "ArrowDown", "w", "s", "W", "S", " ", "p", "P"].includes(
        e.key,
      )
    ) {
      e.preventDefault();
      if (["ArrowUp", "w", "W"].includes(e.key)) dir = down ? -1 : 0;
      if (["ArrowDown", "s", "S"].includes(e.key)) dir = down ? 1 : 0;
      if (down && e.key === " ") {
        if (!started) begin();
        else Action.playerShoot();
      }
      if (down && !e.repeat && e.key.toLowerCase() === "p") setPaused(!paused);
    }
  }
  addEventListener("keydown", (e) => key(e, true));
  addEventListener("keyup", (e) => key(e, false));
  addEventListener("blur", () => (dir = 0));
  document.querySelectorAll("[data-dir]").forEach((b) => {
    b.onpointerdown = (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      dir = +b.dataset.dir;
    };
    b.onpointerup =
      b.onpointercancel =
      b.onlostpointercapture =
        () => (dir = 0);
  });
  const canvas = C.canvas;
  canvas.onpointerdown = (e) => {
    canvas.setPointerCapture(e.pointerId);
    move(e);
  };
  canvas.onpointermove = (e) => {
    if (e.buttons) move(e);
  };
  function move(e) {
    const r = canvas.getBoundingClientRect();
    player.pos.y = Math.max(
      55,
      Math.min(445, ((e.clientY - r.top) / r.height) * 500),
    );
  }
  addEventListener("message", (e) => {
    if (e.source !== parent || e.data?.type !== "academy:settings") return;
    muted = e.data.muted !== false;
    effectsVolume = typeof e.data.effectsVolume === "number" && Number.isFinite(e.data.effectsVolume) ? Math.max(0, Math.min(1, e.data.effectsVolume)) : 1;
    if (typeof e.data.paused === "boolean") setPaused(e.data.paused);
    syncAudio();
  });
  addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    GL.timer.stop();
    audio?.close();
  });
  window.__patrol = { Game, Character, InPlay };
  frame = requestAnimationFrame(tick);
  parent.postMessage({ type: "academy:ready" }, "*");
})().catch((error) => {
  document.querySelector("#status").textContent =
    "The ship could not load. Try the lighter game or return to the Academy.";
  console.error(error);
  parent.postMessage({ type: "academy:error" }, "*");
});
