import * as Phaser from 'phaser';
import {modulo } from './utiles.js';


export default class Controller extends Phaser.Scene{
    constructor(output_data_func){
        super('GameController');

        // constants
        this.output_data = output_data_func;

        //variables
        this.player_created = false;

    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');

    }
    create() {

        // make ui
        this.buttons = {
            "Left": this.add.text(100,100,'LEFT',{fixedHeight:80,fixedWidth:100,backgroundColor:'#ff0000'}
            ).setInteractive().on('pointerdown', () => this.button_pressed('Left'), this)
                .on('pointerup', () => this.button_released('Left')),
            
            "Up": this.add.text(210,45,'UP',{fixedHeight:80,fixedWidth:100,backgroundColor:'#ff0000'}
            ).setInteractive().on('pointerdown', () => this.button_pressed('Up'), this)
                .on('pointerup', () => this.button_released('Up')),

            "Down": this.add.text(210,155,'DOWN',{fixedHeight:80,fixedWidth:100,backgroundColor:'#ff0000'}
            ).setInteractive().on('pointerdown', () => this.button_pressed('Down'), this)
                .on('pointerup', () => this.button_released('Down')),

            "Right": this.add.text(320,100,'RIGHT',{fixedHeight:80,fixedWidth:100,backgroundColor:'#ff0000'}
            ).setInteractive().on('pointerdown', () => this.button_pressed('Right'), this)
                .on('pointerup', () => this.button_released('Right')),
        }

        let towers = ['CannonTower','SniperTower','BallistaTower','LaserTower','FlamethrowerTower',
        'HealingTower','SlowingTower','BuffingTower'];

        let tower_button;
        for (let i=0;i<towers.length;i++) {
            tower_button = this.add.text(10+modulo(i,5)*100,250+Math.floor(i/5)*100,towers[i],{fixedWidth:90,fixedHeight:90,backgroundColor:'#0000ff'})
            tower_button.setInteractive().on('pointerdown', () => this.make_tower(towers[i],'Down'))
                .on('pointerup', () => this.make_tower(towers[i],'Up'))
        }
    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        if (!this.player_created) {
            // tell server to create a player
            this.output_data({type: 'Constructor'});
            this.player_created = true;
        }
    }

    take_input(data) {
        console.log('data received: ',data);
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