import * as Phaser from 'phaser';
import Entity from "./entity.js";
const Vec = Phaser.Math.Vector2;
import {random_int, random_range} from "./utiles.js";

class Particle extends Entity {
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle, properties) {
        if (typeof(properties.drag) == "undefined"){
            properties.drag = 0.95;
        }
        super(scene, x, y, texture, speed, angle, properties);
        this.setDepth(5);
    }
    game_tick(delta_time) {
        this.physics_tick(delta_time);
    }
}

class GooBlood extends Particle {
    constructor(scene, x, y, speed, angle) {
        super(scene, x, y, 'goo_blood', speed, angle,
            {angle_spread:20, speed_spread:1, x_offset_spread:10, y_offset_spread:10,
            drag:0.92,scale_change:-1,speed_min_to_kill:-1});
    }
}
class FireParticle extends Particle {
    constructor(scene, x, y, radius) {
        super(scene, x, y, 'fire_particle', 1, -90,
            {angle_spread:90, speed_spread:0.5, max_speed_spread:1,
            acceleration:new Vec(0,-0.1), alpha_change:-0.5, x_offset_spread:radius/6, y_offset_spread:radius/6,
            initial_scale:radius/5,scale_change:-3, initial_alpha: 0.6, speed_min_to_kill:-1,
            colour:[255,random_int(130,200),30],colour_change:[-50,-200,-50],
            alpha_min_to_kill:0.2,scale_min_to_kill:0.2});
    }
}
class HeartParticle extends Particle {
    constructor(scene, x, y) {
        super(scene, x, y-10, 'heart_particle', 1, -90,
            {angle_spread:90, acceleration:new Vec(0,-0.05),alpha_change:-1,
            initial_scale:1.5, speed_min_to_kill:-1, x_offset_spread:10, y_offset_spread:4});
    }
}
class SpeedParticle extends Particle {
    constructor(scene, x, y, radius) {
        super(scene, x, y, 'speed_particle', 3, 180*random_int(0,1),
            {alpha_change:-1, initial_scale:1, speed_min_to_kill:-1,
                x_offset_spread:radius/2, y_offset_spread:radius/2,
                time_to_live:0.25});
    }
}
class SlowParticle extends Particle {
    constructor(scene, x, y) {
        super(scene, x, y+10, 'slow_particle', 0.3, 180*random_range(-1,1),
            {drag:1, alpha_change:-1, initial_scale:1.8, scale_change:-0.5,
            speed_min_to_kill:-1,alpha_min_to_kill:0.3});
    }
}

class LaserDust extends Particle {
    constructor(scene, x, y, angle) {
        super(scene, x, y, 'laser_particle', 2, angle,
            {alpha_change:-1, initial_scale:0.7, scale_change:-0.5,
                speed_min_to_kill:-1,alpha_min_to_kill:0.3,
                angle_spread:15,speed_spread:0.2,
                x_offset_spread:5,y_offset_spread:5});
    }
}
class SmokeParticle extends Particle {
    constructor(scene, x, y, angle) {
        super(scene, x, y, 'smoke_particle', 5, angle,
            {alpha_change:-2, initial_scale:0.7, scale_change:3,
                speed_min_to_kill:-1, alpha_min_to_kill:0,
                speed_spread:0.4,
                x_offset_spread:5, y_offset_spread:5, drag:0.8});
    }
}

export {GooBlood, FireParticle, HeartParticle, SpeedParticle, SlowParticle, LaserDust, SmokeParticle };