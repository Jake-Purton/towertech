import HealthBar from './health_bar.js';
import {clamp} from "./utiles.js";

export default class WaveBar extends HealthBar{
    constructor(scene, back_texture, front_texture, parent_x, parent_y, parent_height, parent_width=40, z_depth=1000) {
        super(scene, back_texture, front_texture, parent_x, parent_y, parent_height, parent_width, z_depth);
        this.bar.setScale(2);
        this.bar_back.setScale(2);
        this.text = this.scene.add.text(this.scene.level.texture_width/2, 30, 'Preparing First Wave');
        this.text.setDepth(10000);
        this.text.setOrigin(0.5, 0.5);
    }

    set_position(x, y) {
        this.setPosition(this.scene.level.texture_width/2, 30);
    }

    set_health(health, max_health=null) {
        if (max_health === null) {
            max_health = this.max_health
        }
        health = clamp(health, 0, this.max_health);
        this.setVisible(true);
        this.health = health;
        this.max_health = max_health;
        this.bar.setCrop(0,0,this.bar.width*this.health/this.max_health,this.bar.height)
    }

    set_text(wave_title){
        if (wave_title !== ""){
            this.text.setText(wave_title)
        }
        else {
            this.text.setText('Preparing Next Wave')
        }
    }
}