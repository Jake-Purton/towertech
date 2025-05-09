import {get_distance, random_range, get_item_type, clamp} from './utiles.js';
import Entity from './entity.js';

export default class DroppedItem extends Entity {
    constructor(scene, x, y, item, speed_multiplier=1, size=25, time_to_live=30) {
        let speed = random_range(1,2)*speed_multiplier
        super(scene, x, y, item, speed, random_range(180,-180),
            {initial_angle: random_range(180,-180),
                initial_angular_velocity: random_range(-10, 10), angular_drag:0.95, drag:0.9, time_to_live:time_to_live});
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(2);

        this.setScale(size/this.height);

        this.item_name = item;
        this.picked_up = false;

        this.item_type = get_item_type(this.item_name);
    }
    game_tick(delta_time, players) {
        this.physics_tick(delta_time);
        this.update_flash();
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
        return this.picked_up || this.time_to_live < 0
    }
    set_pos(x, y) {
        this.setPosition(x, y);
    }
    set_as_ui_display() {
        this.setDepth(1);
    }
    destroy(fromScene) {
        super.destroy(fromScene);
    }
    update_flash() {
        let flash_info = {start:5, speed:12}

        let alpha = 1;
        if (this.time_to_live < flash_info.start) {
            alpha = clamp(1+Math.floor(Math.sin(flash_info.speed*this.time_to_live)),0.3,1)
        }
        this.setAlpha(alpha);
    }
}