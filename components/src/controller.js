import * as Phaser from 'phaser';

export default class Controller extends Phaser.Scene{
    constructor(output_data_func){
        super('GameController');

        // constants
        this.output_data = output_data_func;

    }
    preload() {

    }
    create() {
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
    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {

    }

    take_input(input) {

    }

    button_pressed(button) {
        console.log('button pressed',button)
        this.output_data({Key: button, Direction: 'Down'});
    }
    button_released(button) {
        console.log('button released',button)
        this.output_data({Key: button, Direction: 'Up'});
    }

}