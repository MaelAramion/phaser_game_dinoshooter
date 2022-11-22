// Récupèration des données du jeu sur un fichier json

var up;
var down;
var left;
var right;

$(document).ready(function () {
    $.ajax({
        dataType: "json",
        type: "GET",
        url: "src/json/settings.json",
        success: function (json) {
            up = json.settings.up;
            down = json.settings.down;
            left = json.settings.left;
            right = json.settings.right;
        }
    })
});


var config = {
    type: Phaser.AUTO,
    width: 960,
    height: 680,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 0},
            debug: false
        }
    },
    scene: [StartGame, DinoShooter, EndGame],
    pixelArt: true,

};

var game = new Phaser.Game(config);