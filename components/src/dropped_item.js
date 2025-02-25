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
}