import * as Phaser from 'phaser';
import Entity from "./entity.js";
const Vec = Phaser.Math.Vector2;
import {random_int} from "./utiles.js";

class Particle extends Entity {
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle, properties) {
        if (typeof(properties.drag) == "undefined"){
            properties.drag = 0.95;
        }
        super(scene, x, y, texture, speed, angle, properties);
    }
    game_tick(delta_time) {
        this.physics_tick(delta_time);
    }
}

class GooBlood extends Particle {
    constructor(scene, x, y, speed, angle) {
        super(scene, x, y, 'goo_blood', speed, angle,
            {angle_spread:20, speed_spread:1});
    }
}
class Fire extends Particle {
    constructor(scene, x, y, radius) {
        super(scene, x, y, 'fire_particle', 1, -90,
            {angle_spread:90, speed_spread:0.5, max_speed_spread:1,
            acceleration:new Vec(0,-0.1), alpha_change:-0.5, x_offset_spread:radius/6, y_offset_spread:radius/6,
            initial_scale:radius/5,scale_change:-3, initial_alpha: 0.6, speed_min_to_kill:-1,
            colour:[255,random_int(130,200),30],colour_change:[-50,-200,-50]});
    }
}


export {GooBlood, Fire };