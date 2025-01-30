/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Phaser from 'phaser';
import Player from './player.js'
import Enemy from './enemy.js'

export default class Game extends Phaser.Scene{
    constructor(){
        super('GameScene');
    }
    preload() {
        this.load.image('body','/game_images/body_image.png');
        this.load.image('leg','/game_images/leg.png');
        this.load.image('arm','/game_images/arm.png');
        this.load.spritesheet('goolime','/game_images/goolime.png', {frameWidth:30, frameHeight:13});
    }
    create() {
        this.anims.create({
            key: 'walk_animation',
            frames: this.anims.generateFrameNumbers('goolime', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        this.players = new Map([]);
        this.players.set('TempPlayerID', new Player(this, 100, 100));

        this.kprs = this.input.keyboard.createCursorKeys();


        this.enemy_path = this.load_path([[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]);

        this.enemies = [];
        this.enemies.push(new Enemy(this, 50, 50, 'goolime',this.enemy_path));

    }
    update(time, delta) {
        this.dummy_input();
        for (let [_, player] of this.players) {
            player.game_tick(delta);
        }
    }
    take_input(input){
        console.log(input, input.has(input.get('PlayerID')), input.get('PlayerID'));
        if (this.players.has(input.get('PlayerID'))){
            let player = this.players.get(input.get('PlayerID'));
            player.input_key(input.get('Key'), input.get('Direction'));
        }
    }

    load_path(points){
        let path = new Phaser.Curves.Path(points[0][0], points[0][1]);
        for (let i=1;i<points.length;i++) {
            path.lineTo(points[i][0],points[i][1]);
        }
        return path
    }

    dummy_input(){
        // dummy method that attempts to recreate how inputs would be taken
        if (this.kprs.up.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','UP'],['Direction','Down']]))
        }
        if (this.kprs.down.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','DOWN'],['Direction','Down']]))
        }
        if (this.kprs.right.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','RIGHT'],['Direction','Down']]))
        }
        if (this.kprs.left.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','LEFT'],['Direction','Down']]))
        }

        if (this.kprs.up.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','UP'],['Direction','Up']]))
        }
        if (this.kprs.down.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','DOWN'],['Direction','Up']]))
        }
        if (this.kprs.right.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','RIGHT'],['Direction','Up']]))
        }
        if (this.kprs.left.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','LEFT'],['Direction','Up']]))
        }
    }
}