import * as Phaser from 'phaser';
import Entity from "./entity.js";

class Particle extends Entity {
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle,
                drag = 0.9, damage = 1,
                speed_min_to_kill = 1, time_to_live = 5) {
        super(scene, x, y, texture, speed, angle, drag, speed_min_to_kill,
            time_to_live);

    }
    game_tick(delta_time) {
        this.physics_tick(delta_time);
    }

}

class GooBlood extends Particle {
    constructor(scene, x, y, speed, angle) {
        angle+=scene.RNG.normal()*60;
        speed+=scene.RNG.normal()*4;
        super(scene, x, y, 'goo_blood', speed, angle);
    }
}

export {GooBlood };
