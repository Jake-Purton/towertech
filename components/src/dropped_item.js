import * as Phaser from 'phaser';
import {get_distance, random_range } from './utiles.js';
import Entity from './entity.js';

export default class DroppedItem extends Entity {
    constructor(scene, x, y, item) {
        super(scene, x, y, item, random_range(1,2), random_range(180,-180),
            {initial_angle: random_range(180,-180),
                initial_angular_velocity: random_range(-10, 10), angular_drag:0.95, drag:0.9});
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.item_name = item;
        this.picked_up = false;

        if (this.item_name.split("_")[1] === "leg" || this.item_name === "wheel") {
            this.item_type = 'leg';
        } else if (this.item_name.split("_")[1] === "body") {
            this.item_type = 'body';
        } else if (this.item_name.split("_")[1] === "weapon") {
            this.item_type = 'weapon';
        } else {
            this.item_type = 'unknown'
        }
    }
    game_tick(delta_time, players) {
        this.physics_tick(delta_time);
        if (!this.picked_up) {
            for (let player of Object.values(players)) {
                if (!player.dead) {
                    let distance = get_distance(player, this);
                    if (distance < player.pickup_range) {
                        player.pickup_item(this);
                        this.picked_up = true;
                    }
                }
            }
        }
    }
    get_dead() {
        return this.picked_up
    }
    set_pos(x, y) {
        this.setPosition(x, y);
    }
    set_as_ui_display() {

    }
    destroy(fromScene) {
        super.destroy(fromScene);
    }
}