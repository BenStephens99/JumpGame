const GAMEHEIGHT = 800;
const GAMEWIDTH = 500;
let config = {
    type: Phaser.AUTO,
    width: GAMEWIDTH,
    height: GAMEHEIGHT, 
    backgroundColor: '#4488aa',
    physics: {
        default:'arcade',
        arcade:{
            debug:false
        },
    },
    scene: {
        preload: preload, 
        create: create,
        update: update,
    }
};

let jumpSound;
let game = new Phaser.Game(config);
let jumpButton;
let scoreTextStyle = { 
    color: '#000', 
    fontSize: 24,
    stroke: '#000', 
    strokeThickness: 1,
    align: 'right', 
}
let titleTextStyle = { 
    color: '#000', 
    fontSize: 32,
    stroke: '#000', 
    strokeThickness: 2,
}

let newHighScoreStyle = { 
    color: '#0FF500', 
    fontSize: 32,
    stroke: '#0FF500', 
    strokeThickness: 2,
}
let score = 0;
let plat1;
let isPlaying = false;
let highScore = 0;
let gameOverText;
let bottomPlatform;
let highScoreText;
let startText;
let playAgainText;
let newHighScore;
let enemyVel = 20;
let enemySpeed = 20;
let GameOverSound;


function preload () {

    //load in image assets
    this.load.spritesheet('player', 'assets/playerSprite.png', {
    frameWidth: 64,
    frameHeight: 74
    });
    this.load.spritesheet('enemy', 'assets/enemy.png', {
        frameWidth: 64,
        frameHeight: 82
        });
        
    this.load.image('platform', 'assets/platform.png');
    
    //audio assets
    this.load.audio('jump', 'assets/jump.mp3');
    this.load.audio('gameOver', 'assets/gameOver.mp3')
    this.load.audio('enemySound', 'assets/enemy.mp3');

    //setup cursor input
    this.cursors = this.input.keyboard.createCursorKeys();


}
 
function create () {
   
    // click to start game
    this.input.addListener('pointerdown', startGame, this);
    
    // crate score texts 
    startText = this.add.text(GAMEWIDTH/2 - 120, 650, "Click to Start", titleTextStyle );
    this.scoreText = this.add.text(100, 10, 'Score: ' + score, scoreTextStyle).setScrollFactor(0).setOrigin(0.5, 0);
    highScoreText = this.add.text(120, 30, "Highscore: " + highScore, scoreTextStyle).setScrollFactor(0).setOrigin(0.5, 0);

    // create the player 
    this.player = this.physics.add.sprite(GAMEWIDTH/2, 900 , 'player');

    // create enemy 
    this.enemy = this.physics.add.sprite(30,-1000 , 'enemy')
    this.enemy.setScale(1.2);
    this.physics.add.collider(this.player, this.enemy);
    this.enemy.setImmovable();
    
    
    // create group of platforms
    this.platforms = this.physics.add.staticGroup()
    this.physics.add.collider(this.platforms, this.player)

    // keyboard inputs
    jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // create sounds
    jumpSound = this.sound.add('jump');
    letGameOverSound = this.sound.add('gameOver')
    enemySound = this.sound.add('enemySound');
  
    // create end of game text to be made visible after game
    gameOverText = this.add.text(GAMEWIDTH/2, GAMEHEIGHT/2, 'Game Over', titleTextStyle).setScrollFactor(0).setOrigin(0.5, 0);
    gameOverText.visible = false;
    newHighScore = this.add.text(GAMEWIDTH/2, GAMEHEIGHT/2 + 50, 'New High Score!', newHighScoreStyle).setScrollFactor(0).setOrigin(0.5, 0);
    newHighScore.visible = false;
    playAgainText = this.add.text(GAMEWIDTH/2, GAMEHEIGHT/2 + 100, 'Click to try again', titleTextStyle).setScrollFactor(0).setOrigin(0.5, 0);
    playAgainText.visible = false;

    // start camera follow
    this.cameras.main.startFollow(this.player)
    // set deadzone for camera so will only follow up and down
    this.cameras.main.setDeadzone(this.scale.width * 1.5)
    // this will put the player towards the bottom of the camera     
    this.cameras.main.setFollowOffset(0, 200)

    // create animations for player and enemy
    this.anims.create({
        key: 'playerJump',
        frames: this.anims.generateFrameNumbers('player', {
            start: 4,
            end: 5
        }),
        frameRate: 10,
    });

    this.anims.create({
        key: 'playerLeft',
        frames: this.anims.generateFrameNumbers('player', {
            start: 1,
            end: 1
        }),
        frameRate: 10,
    });

    this.anims.create({
        key: 'playerRight',
        frames: this.anims.generateFrameNumbers('player', {
            start: 3,
            end: 3
        }),
        frameRate: 10,
    });

    this.anims.create({
        key: "enemyLeft",
        frames: this.anims.generateFrameNumbers('enemy', {
            start: 3,
            end: 5,
            repeat: true
        }),
        frameRate: 4,
    })

    this.anims.create({
        key: "enemyRight",
        frames: this.anims.generateFrameNumbers('enemy', {
            start: 0,
            end: 2,
            repeat: true
        }),
        frameRate: 4,
    })
   
}

function startGame(){
    // remove startscreen listener and text
    this.input.removeListener('pointerdown', startGame, this);
    startText.visible = false;
    
    // create first platform for player to start on
    plat1 = this.physics.add.sprite(GAMEWIDTH/2, 1000, 'platform');
    plat1.scaleX = 10;
    this.physics.add.collider(plat1, this.player);
    plat1.setImmovable();
    
    // start update method
    isPlaying = true;

    createPlayer(this.player);
    createPlatforms (this.platforms);
}

function update () {

    if (isPlaying){
    
        //updates player position and takes user input
    updatePlayer (this.player, this.cursors, this);

    //creates new platfroms
    addPlatforms (this.platforms, this.cameras);

    //update score 
    getScore(this); 

    // sets bottom platform const to value of bottomPlat() function
    const bottomPlatform = bottomPlat(this);


    // remove starting platform
    if(this.player.y < plat1.y - 200){
        plat1.destroy();
    }
    /* checks if player is below bottom platform (+ 200 pixles so the 
    game doesnt end if the player jumps past a platform then falls back
    on to it.)*/
    if (this.player.y > bottomPlatform.y + 200)
    {
        gameOver (this);
    }

    // passed enemy so move enemy up to higher point
    if(this.player.y < this.enemy.y - 300){
        this.enemy.setPosition(10, this.enemy.y - 2000);
        enemySpeed = enemySpeed + 20;
    }

    // when close to the enemy
    if (this.player.y - 1000 > this.enemy.y){
        enemySound.play();
    }

    //starting velocity for the enemy 
    this.enemy.setVelocityX(enemyVel)

    // checks for enemy hitting edge of game
    if (this.enemy.x < 20)
    {
        this.enemy.anims.play('enemyRight');
        enemyVel = enemySpeed

    }
    if (this.enemy.x > 480)
    {
        this.enemy.anims.play('enemyLeft');
        enemyVel = -enemySpeed;
        
    }

    //check for collison with player
    checkCollision(this.player, this.enemy, this)

}
}



/* changes the score variable to the distance the camera has scrolled 
on the Y axis, rounded to the nearest whole number and divided by 10
and then multiplied by -1 to return a positive number and + 35 due to the 
player starting game 35 pixles below scrollY */
function getScore (scene) {
    score = Math.round(scene.cameras.main.scrollY /10 ) * -1 + 35;
    // updates on screen score text
    scene.scoreText.text = "Score: " + score;
}

function bottomPlat (scene) {

    // gets all platforms as an array 
    const platforms = scene.platforms.getChildren()

    /* sets bottomBottom let to the platform at the 
    bottom of the array */
    bottomPlatform = platforms[0]

    /* loops through the platform array checking to see if 
    each platforms Y is more the Y of of bottomPlatform and if 
    it is, it will be stored as the new bottomPlatform */
    for (let i = 1; i < platforms.length; ++i){
    const platform = platforms[i]
        if (platform.y < bottomPlatform.y){
            continue;
        }
            bottomPlatform = platform;
        }

 return bottomPlatform
 }

 // will end game if the player and enemy collide
 function checkCollision(player, enemy, scene) {
    let endGame = collided(player, enemy);
    if (endGame) {
        player.setVelocityY(50);
       gameOver(scene);
    }
}

// checking for collision between player and enemy 
function collided(player, enemy) {
    let colliding = false;
    let xDiff
    let yDiff;
    xDiff = Math.abs(player.x - enemy.x);
    yDiff = Math.abs(player.y - enemy.y);
    colliding = (xDiff + yDiff) < 100;
    return (colliding);
} 

 function gameOver(scene) {

    // stop update method 
    isPlaying = false;
    // play end of game sound
    letGameOverSound.play();
    
    // allows plauer to fall off the screen when dead for effect
    scene.player.body.checkCollision.down = false;
    scene.cameras.main.stopFollow(scene.player);

    // check to see if high score has been reached and if so let player know
    if (score > highScore) {
        highScore = score;
        newHighScore.visible = true;
        newHighScore.text = "New high score! " + highScore;
    }

    // show end of game text
     gameOverText.visible = true;
     playAgainText.visible = true;
     highScoreText.text = "High Score: " +  highScore;   
     scene.input.addListener('pointerdown',restartGame, scene);
    
 }

 // restart the game
 function restartGame () {
     score = 0;
     enemySpeed = 20;
    this.scene.restart()
 }

