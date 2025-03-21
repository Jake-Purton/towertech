import * as Phaser from 'phaser';
import {clamp} from "./utiles.js";

export default class HealthBar extends Phaser.GameObjects.Container {
    constructor(scene, back_texture, front_texture, parent_x, parent_y, parent_height, parent_width=40, z_depth=3.1) {

        super(scene, 0, 0, []);
        scene.add.existing(this);
        this.setDepth(z_depth);

        this.bar_back = scene.add.sprite(0, 0, back_texture)
        this.bar = scene.add.sprite(0, 0, front_texture)
        this.set_parent_width(parent_width);

        this.add(this.bar_back);
        this.add(this.bar);
        this.setVisible(false);

        this.set_position(parent_x, parent_y, parent_height);

        this.health = 10;
        this.max_health = this.health;
    }
    set_position(parent_x, parent_y, parent_height) {
        this.setPosition(parent_x, parent_y - parent_height/2 - 5);
    }
    set_parent_width(parent_width) {
        this.bar.setScale(parent_width/this.bar_back.width*1.1);
        this.bar_back.setScale(parent_width/this.bar_back.width*1.1);
    }
    set_health(health, max_health=null) {
        if (max_health === null) {
            max_health = this.max_health
        }
        health = clamp(health, 0, max_health);
        this.setVisible(health !== max_health);
        this.health = health;
        this.max_health = max_health;
        this.bar.setCrop(0,0,this.bar.width*this.health/this.max_health,this.bar.height)
    }
}