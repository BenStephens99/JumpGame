
function createPlayer (player) {
   
    // strngth of gravity on player
    player.setGravityY(900); 
    
    //turns off collions so player can pass through platforms
    player.body.checkCollision.up = false; 
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;
}

function updatePlayer (player, cursors, scene) {
    
    
    const touchingDown = player.body.touching.down; 
   
    // if player is on a platform jump
    if (touchingDown && jumpButton.isDown ) {
        player.anims.play('playerJump');
        player.setVelocityY(-750  );
        jumpSound.play();
    }
    // movement for left right and down
    if (cursors.down.isDown){
        player.setVelocityY(400) 
    }
    else if (cursors.left.isDown) {
        player.anims.play('playerLeft');
        player.setVelocityX(-300);
    }
    else if (cursors.right.isDown) {
        player.anims.play('playerRight');
        player.setVelocityX(200);
    }
    
    // if nothing is being pressed stop player moving
    else {
        player.setVelocityX(0);
    }

    // wrap the player round the screen if they go over the edge
    if (player.x <- player.displayWidth / 2)
    {
        player.x = GAMEWIDTH + player.displayWidth / 2;
    }
    else if (player.x > GAMEWIDTH + player.displayWidth / 2)
    {
        player.x = - player.displayWidth / 2;
    }
}