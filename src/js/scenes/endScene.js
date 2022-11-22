class EndGame extends Phaser.Scene{
    constructor(){
        super('EndScene');
        this.restart = null;
        this.menu = null;
    }

    preload(){
        this.load.image('background', 'src/assets/background/backgroundTitleScreen.png');
        this.load.image('cursor', 'src/assets/sprites/cursor.png');

        this.load.image('restart', 'src/assets/sprites/restart.png');
        this.load.image('menu', 'src/assets/sprites/menu.png');

    }

    create(data) {
        const background = this.physics.add.image(480, 320, 'background');
        this.cursor = this.physics.add.sprite(0, 0, 'cursor').setScale(2).setDepth(5);

        this.restart = this.physics.add.sprite(480,280,'restart').setScale(2).setDepth(3).setInteractive();
        this.menu = this.physics.add.sprite(480,340,'menu').setScale(2).setDepth(3).setInteractive();


        let restart = this.restart;
        let menu = this.menu;
        this.restart.on('pointerdown',function(pointer){
            background.destroy();
            menu.destroy();
            this.destroy();
            scoreText.destroy();
            data.score = 0;
            game.scene.start('DinoShooter');
        });

        this.menu.on('pointerdown',function(pointer){
            background.destroy();
            restart.destroy();
            scoreText.destroy();
            data.score = 0;
            this.destroy();
            game.scene.start('StartScene');
        });

        scoreText = this.add.text(370, 50, 'Score: 0', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'gamefont'
        }).setDepth(3);

        scoreText.setText('Score ' + data.score);
    }

    update(){
        this.cursor.setPosition(
            this.input.mousePointer.x,
            this.input.mousePointer.y
        );
    }

}