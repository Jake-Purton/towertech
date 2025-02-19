import * as Phaser from 'phaser';
import {get_distance } from './utiles.js';

export default class DroppedItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, item) {
        super(scene, x, y, item);
        this.item_name = item;
        this.picked_up = false;
    }
    game_tick(delta_time, players) {
        if (!this.picked_up) {
            for (let player of Object.values(this.players)) {
                let distance = get_distance(player, this);
                if (distance < player.pickup_range) {
                    player.pickup_item(this);
                    this.picked_up = true;
                }
            }
        }
    }
    get_dead() {
        return this.picked_up
    }
}