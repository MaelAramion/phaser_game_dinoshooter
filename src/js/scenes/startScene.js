function moveDino(key, spritesheet) {
    // animation lorsque player bouge
    return {
        key: key,
        frames: game.anims.generateFrameNumbers(spritesheet, {start: 4, end: 9, first: 0}),
        frameRate: 15,
        repeat: -1
    }
}

function idleDino(key, spritesheet) {
    return {
        key: key,
        frames: game.anims.generateFrameNumbers(spritesheet, {start: 0, end: 3, first: 0}),
        frameRate: 9,
        repeat: -1
    };
}

class StartGame extends Phaser.Scene {
    constructor() {
        super('StartScene');
        this.cursor = null;
        this.start = null;
        this.enemy;
    }

    preload() {
        this.load.image('background', 'src/assets/background/backgroundTitleScreen.png');
        this.load.image('cursor', 'src/assets/sprites/cursor.png');
        this.load.image('start', 'src/assets/sprites/start.png');
        this.load.spritesheet('enemy', 'src/assets/sprites/red_dino.png', {frameWidth: 24, frameHeight: 24});
    }

    create() {
        const background = this.physics.add.image(480, 320, 'background');
        this.cursor = this.physics.add.sprite(0, 0, 'cursor').setScale(2).setDepth(4);
        this.start = this.physics.add.sprite(480, 320, 'start').setScale(2).setInteractive().setDepth(1);

        this.start.on('pointerdown', function (pointer) {
            this.destroy();
            game.scene.start('DinoShooter');
        });

        this.timer = 300;

        // animation lorsque ne bouge pas
        var idleRedDino = idleDino('redDinoIdle', 'enemy');
        // animation lorsque bouge
        var moveRedDino = moveDino('redDinoMove', 'enemy');
        // animation du red dino
        this.anims.create(idleRedDino);
        this.anims.create(moveRedDino);

        this.enemy = this.physics.add.sprite(350, 320, 'enemy').setScale(2).setDepth(0);

    }

    update() {

        this.cursor.setPosition(
            this.input.mousePointer.x,
            this.input.mousePointer.y
        );

        //Change l'animation quand il se déplace
        if (this.enemy.body.velocity.x != 0 || this.enemy.body.velocity.y != 0) {
            this.enemy.anims.play('redDinoMove', true);
        } else {
            this.enemy.anims.play('redDinoIdle', true);
        }


    }

}