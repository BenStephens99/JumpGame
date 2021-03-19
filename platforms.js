
// create 7 platforms 
function createPlatforms (platforms) {
    for (let i = 0; i < 7 ; ++i) {
            //random postition from left to right
            const x = Phaser.Math.Between(30, 460);
            // 150 pixles above last one
            const y = 150 * i;
            // create the platform
            platform = platforms.create(x, y, 'platform');
            const body = platform.body;
            body.updateFromGameObject()
    }
}

// add more platforms
function addPlatforms (platforms, cameras) {
   
    platforms.children.iterate(child => {
        
        const platform = child;
        const scrollY = cameras.main.scrollY;
        // if the distance the camera has scrolled is 30 pixles more than game height
        if (platform.y >= scrollY + 830 ){
                // move platform back to top of the screen
                platform.y = scrollY - Phaser.Math.Between(50, 100);
                platform.x = Phaser.Math.Between(30, 460)
                platform.body.updateFromGameObject();
       }
       })
    }