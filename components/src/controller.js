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

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {

    }

    take_input(input) {

    }


}