import * as Phaser from 'phaser';
import Button from '../button.js';


export default class CreateTowerMenu extends Phaser.Scene {
    constructor(output_data_func) {
        super('CreateTower')

        this.output_data = output_data_func;
    }
    preload() {

    }
    create() {
        new Button(this, 100, 100, {text:'Back',height:60,width:100,
            press_command:this.menu_back})

    }
    menu_back = () => {
        this.scene.switch('GameController');
    }
}