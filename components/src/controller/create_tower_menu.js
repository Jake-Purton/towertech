import * as Phaser from 'phaser';
import Button from '../ui_widgets/button.js';


export default class CreateTowerMenu extends Phaser.Scene {
    constructor(scene_info) {
        super('CreateTower')

        this.output_data = scene_info.output_data_func;
        this.screen_width = scene_info.screen_width;
        this.screen_height = scene_info.screen_height;
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