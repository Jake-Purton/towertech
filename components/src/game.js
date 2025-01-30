/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Phaser from 'phaser';
import Player from './player.js'

export default class Game extends Phaser.Scene{
    constructor(){
        super('GameScene');
    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body_image.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('default_arm','/game_images/player_sprites/weapons/default_arm.png');
    }
    create() {
        this.players = new Map([]);
        this.players.set('TempPlayerID', new Player(this, 100, 100));

        this.kprs = this.input.keyboard.createCursorKeys();

    }
    update(time, delta) {
        this.dummy_input();
        for (let [key, player] of this.players) {
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