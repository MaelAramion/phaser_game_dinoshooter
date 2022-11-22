var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
        function Bullet(scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
            this.speed = 1;
            this.born = 0;
            this.direction = 0;
            this.xSpeed = 0;
            this.ySpeed = 0;
            this.setSize(12, 12, true);
        },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, target) {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y) {
            this.xSpeed = this.speed * Math.sin(this.direction);
            this.ySpeed = this.speed * Math.cos(this.direction);
        } else {
            this.xSpeed = -this.speed * Math.sin(this.direction);
            this.ySpeed = -this.speed * Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

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

function endGame() {
    nbEnemy = 0;
    enemyInGame = 0;
    let data = {score: score};
    this.scene.start('EndScene', data);
    score = 0;
}

function killEnemy(enemyKilled, bullet) {
    enemyKilled.destroy();
    enemyInGame -= 1;
    if (enemyInGame == 0) {
        nbEnemy += 1;

        let eX = Math.random() * 960;
        let eY = Math.random() * 640;


        // Gauche & haut
        if (eX >= player.x - 100 && eY >= player.y - 100) {
            eX -= 100;
            eY -= 100;
        }
        // Gauche & Bas
        if (eX >= player.x - 100 && eY <= player.y + 100) {
            eX -= 100;
            eY += 100;
        }
        // droite & Haut
        if (eX <= player.x + 100 && eY >= player.y - 100) {
            eX += 100;
            eY -= 100;
        }
        // Droite & Bas
        if (eX <= player.x + 100 && eY <= player.y + 100) {
            eX += 100;
            eY += 100;
        }

        enemy = this.physics.add.group({
            key: 'enemy',
            repeat: nbEnemy,
            setXY: {x: eX, y: eY},
        });
        this.physics.add.collider(enemy, objects, null, null, this);
        this.physics.add.overlap(enemy, player, endGame, null, this);
        let game = this;
        enemy.children.iterate(function (child) {
            enemyInGame += 1;
            child.setPosition(
                Math.random() * 960,
                Math.random() * 640
            );
            child.setScale(2);
            // Enemy qui suit le joueur
            game.physics.moveToObject(child, player, 100);
            // Change l'orientation de l'enemy lorsqu'il va à gauche ou à droite
            if (child.body.velocity.x < 0) {
                child.flipX = true;
            }
            if (child.body.velocity.x > 0) {
                child.flipX = false;
            }
            // Alterne animation quand enemy bouge et ne bouge pas
            if (child.body.velocity.x != 0 || child.body.velocity.y != 0) {
                child.anims.play('redDinoMove', true);
            } else {
                child.anims.play('redDinoIdle', true);
            }
            // Taille de la hitbox
            child.body.setSize(16, 16, true);
        });
    }
    // enemy.setVisible(false).setActive(false);
    bullet.destroy();
    score = score + 1;
    scoreText.setText('Score: ' + score);
}

let keys = null;
let player = null;
let enemy = null;
let cursor = null;
let bar = null;
let fillbar = null;
let  gun = null;
let objects = null;


let speed = null;
let bullets = null;
let cursors = null;
let angleBullet = null;
let graphics = null;

let nbEnemy = 0;
let  enemyInGame = 0;
let scoreText = null;
let score = 0;


class DinoShooter extends Phaser.Scene{
    constructor(){
        super('DinoShooter');
    }
    preload() {
        // Tiles ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.image('grass', 'src/assets/tilesets/tileset_grass.png');
        this.load.image('plant', 'src/assets/tilesets/tileset_plant.png');
        this.load.image('props', 'src/assets/tilesets/tileset_props.png');
        // Map ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.tilemapTiledJSON('map', 'src/assets/map/map_tps.json');

        // Sprites ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.spritesheet('player', 'src/assets/sprites/blue_dino.png', {frameWidth: 24, frameHeight: 24});
        this.load.spritesheet('enemy', 'src/assets/sprites/red_dino.png', {frameWidth: 24, frameHeight: 24});

        // Gun ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.image('gun', 'src/assets/sprites/gun.png');
        // Bullet
        this.load.image('bullet', 'src/assets/sprites/bullet.png');

        // Cursor ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.image('cursor', 'src/assets/sprites/cursor.png');

        //HUD ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.load.image('bar', 'src/assets/hud/bar.png');
        this.load.image('fillbar', 'src/assets/hud/fillbar.png');


        // Tire des balles lorsque clic gauche ------------------------------------------------------------------------------------------------------------------------------
        this.input.on('pointerdown', function (pointer, time, lastFired) {
            if (player.active === false)
                return;

            // Get bullet from bullets group
            var bullet = bullets.get().setActive(true).setVisible(true);
            bullet.fire(gun, this.input.mousePointer);

            this.physics.add.overlap(enemy, bullet, killEnemy, null, this);
        }, this);
    }


    create() {

        // variables
        this.score = 0;

        // Map ------------------------------------------------------------------------------------------------------------------------------------------------------------
        const map = this.make.tilemap({key: 'map', tileWidth: 32, tileHeight: 32});
        const tileset = map.addTilesetImage('grass', 'grass');
        const plant_tileset = map.addTilesetImage('plant', 'plant', 32, 32);
        const props_tileset = map.addTilesetImage('props', 'props', 32, 32);

        const background = map.createLayer('floor', tileset, 0, 0);
        objects = map.createLayer('objects', [plant_tileset, props_tileset], 0, 0);
        const foreground = map.createLayer('foreground', [plant_tileset, props_tileset], 0, 0).setDepth(1);

        objects.setCollisionByProperty({collides: true});


        // world bounds ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.physics.world.setBounds(0, 0, 960, 640);


        // HUD ------------------------------------------------------------------------------------------------------------------------------------------------------------
        bar = this.add.image(10, 645, 'bar').setScale(4).setOrigin(0, 0);
        fillbar = this.add.image(18, 653, 'fillbar').setScale(4).setOrigin(0, 0);

        fillbar.width = fillbar.width - 33;
        // Score
        scoreText = this.add.text(780, 645, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'gamefont'
        }).setDepth(3);


        // Player------------------------------------------------------------------------------------------------------------------------------------------------------------
        // animation lorsque ne bouge pas
        var idleBlueDino = idleDino('blueDinoIdle', 'player');
        var idleRedDino = idleDino('redDinoIdle', 'enemy');
        // animation lorsque bouge
        var moveBlueDino = moveDino('blueDinoMove', 'player');
        var moveRedDino = moveDino('redDinoMove', 'enemy');

        // animation du blue dino ------------------------------------------------------------------------------------------------------------------------------------------------------------
        this.anims.create(idleBlueDino);
        this.anims.create(moveBlueDino);
        // animation du red dino
        this.anims.create(idleRedDino);
        this.anims.create(moveRedDino);


        // Attribution de l'animation au joueur ------------------------------------------------------------------------------------------------------------------------------------------------------------
        player = this.physics.add.sprite(470, 320, 'player').setScale(2);

        // Joueur ne dépasse pas les limites du niveau ------------------------------------------------------------------------------------------------------------------------------------------------------------
        player.setCollideWorldBounds(true);

        // Enemy --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        enemy = this.physics.add.group({
            key: 'enemy',
            repeat: nbEnemy,
            setXY: {x: Math.random() * 960, y: Math.random() * 640, stepX: 10},
        });

        enemy.children.iterate(function (child) {
            child.body.setSize(16, 16, true);
            child.setScale(2);
            enemyInGame += 1;
        });

        // condition d'arrêt
        this.physics.add.overlap(enemy, player, endGame, null, this);

        // Cursor --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        cursor = this.physics.add.sprite(0, 0, 'cursor').setScale(2).setDepth(99);

        // Gun --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        gun = this.physics.add.sprite(300, 300, 'gun').setScale(3);


        // Ajout des touches à utiliser pour se déplacer -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        keys = this.input.keyboard.addKeys(up + ',' + left + ',' + down + ',' + right);

        // Collision
        this.physics.add.collider(player, objects, null, null, this);
        this.physics.add.collider(enemy, objects, null, null, game);
        // enemy.body.setSize(16, 16, true);
        player.body.setSize(16, 16, true);


        cursors = this.input.keyboard.createCursorKeys();

        speed = Phaser.Math.GetSpeed(300, 1);

        bullets = this.physics.add.group({classType: Bullet, runChildUpdate: true});
    }

    update(time) {

        player.setVelocity(
            (keys[left].isDown) ? -200 : 0 || (keys[right].isDown) ? 200 : 0,
            (keys[up].isDown) ? -200 : 0 || (keys[down].isDown) ? 200 : 0
        );

        // Change l'orientation du joueur lorsqu'il va à gauche ou à droite ------------------------------------------------------------------------------------------------------------------------------------------------------------
        if (keys[left].isDown) {
            player.flipX = true;
        }
        if (keys[right].isDown) {
            player.flipX = false;
        }

        // Change l'orientation de l'enemy lorsqu'il va à gauche ou à droite ------------------------------------------------------------------------------------------------------------------------------------------------------------

        enemy.children.iterate(function (child) {
            if (child.body.velocity.x < 0) {
                child.flipX = true;
            }
            if (child.body.velocity.x > 0) {
                child.flipX = false;
            }
        });


        // Alterne animation quand joueur bouge et ne bouge pas ------------------------------------------------------------------------------------------------------------------------------------------------------------
        if (player.body.velocity.x != 0 || player.body.velocity.y != 0) {
            player.anims.play('blueDinoMove', true);
        } else {
            player.anims.play('blueDinoIdle', true);
        }


        // Alterne animation quand enemy bouge et ne bouge pas ------------------------------------------------------------------------------------------------------------------------------------------------------------
        enemy.children.iterate(function (child) {
            if (child.body.velocity.x != 0 || child.body.velocity.y != 0) {
                child.anims.play('redDinoMove', true);
            } else {
                child.anims.play('redDinoIdle', true);
            }
        });


        // Enemy qui suit le joueur ------------------------------------------------------------------------------------------------------------------------------------------------------------
        let game = this;
        enemy.children.iterate(function (child) {
            game.physics.moveToObject(child, player, 100);
        });

        // Curseur qui suit la souris ------------------------------------------------------------------------------------------------------------------------------------------------------------
        cursor.setPosition(
            this.input.mousePointer.x,
            this.input.mousePointer.y
        );


        // Gère l'orientation du gun en fonction de l'emplacement du curseur ------------------------------------------------------------------------------------------------------------------------------------------------------------
        if (this.input.mousePointer.x > player.x) {
            gun.flipY = false;
        }
        if (this.input.mousePointer.x < player.x) {
            gun.flipY = true;
        }

        // Gère l'angle du gun en fonction de l'emplacement du curseur ------------------------------------------------------------------------------------------------------------------------------------------------------------
        let angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.mousePointer.x, this.input.mousePointer.y);
        Phaser.Actions.RotateAroundDistance([gun], {x: player.x, y: player.y}, null, 30);
        gun.rotation = angle;
        angleBullet = angle;


        // Gère l'orientation du gun en fonction de la souris autour du joueur ------------------------------------------------------------------------------------------------------------------------------------------------------------
        var mouseX = this.input.mousePointer.x;
        var mouseY = this.input.mousePointer.y;
        var theta = Math.atan2(mouseX - player.x, mouseY - player.y);
        var newX = Math.sin(theta) * 30;
        var newY = Math.cos(theta) * 30;

        gun.x = player.x + newX;
        gun.y = player.y + newY;
    }



}