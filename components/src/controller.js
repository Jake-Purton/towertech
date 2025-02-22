import * as Phaser from 'phaser';
import {modulo } from './utiles.js';
import Button from './button.js';


export default class Controller extends Phaser.Scene{
    constructor(output_data_func){
        super('GameController');

        // constants
        this.output_data = output_data_func;

        //variables
        this.player_created = false;

        this.player_coins = 0;

    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');

        this.load.image('button','/game_images/UI/button.png');
        this.load.image('button2','/game_images/UI/button2.png');
    }
    create() {

        // make ui
        let f1 = () => console.log('press');
        let f2 = () => console.log('release');

        // this.thingy = new Button(this, 40, 40, {press_command:f1, release_command:f2});

        new Button(this, 250, 120, {text:'Left',height:90,width:150,
            press_command:() => this.button_pressed('Left'),
            release_command:() => this.button_released('Left')})
        new Button(this, 400, 65, {text:'UP',height:90,width:150,
            press_command:() => this.button_pressed('Up'),
            release_command:() => this.button_released('Up')})
        new Button(this, 400, 175, {text:'Down',height:90,width:150,
            press_command:() => this.button_pressed('Down'),
            release_command:() => this.button_released('Down')})
        new Button(this, 550, 120, {text:'Right',height:90,width:150,
            press_command:() => this.button_pressed('Right'),
            release_command:() => this.button_released('Right')})

        let towers = ['CannonTower','SniperTower','BallistaTower','LaserTower','FlamethrowerTower',
        'HealingTower','SlowingTower','BuffingTower'];

        let tower_button;
        for (let i=0;i<towers.length;i++) {
            tower_button = new Button(this,140+modulo(i,3)*260,280+Math.floor(i/3)*80,
                {texture:'button2',text:towers[i].replace('Tower',''),width:240,height:60,
                 press_command:() => this.make_tower(towers[i],'Down'),
                 release_command:() => this.make_tower(towers[i],'Up')})
        }
    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        // console.log('player_created:', this.player_created);
        if (!this.player_created) {
            // tell server to create a player
            this.output_data({type: 'Constructor'});
            this.player_created = true;
        }
    }

    take_input(input) {
        switch (input.type) {
            case 'Player_Constructor_Acknowledgement':
                this.player_created = true;
                break;
            case 'Set_Coins':
                this.player_coins = input.coins;
                console.log('player has '+this.coins+' coins.')
                break;
            default:
                console.log('unused input received: ',input)
        }
    }

    button_pressed(button) {
        this.output_data({type:'Key_Input', Key: button, Direction: 'Down'});
    }
    button_released(button) {
        this.output_data({type:'Key_Input', Key: button, Direction: 'Up'});
    }
    make_tower(tower, direction) {
        this.output_data({type:'Create_Tower', Tower: tower, Direction: direction})
    }

}