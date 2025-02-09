import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import Effects from './effects.js';
import {GooBlood} from "./particle.js";
import {random_range } from './utiles.js'

export default class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, type, path) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.move_speed = 1;
        this.path = path;
        this.path_t = 0; // value moves from 0 to 1 when moving along path
        this.play(type+'_walk')

        this.health = 100;

        // effects info
        this.effects = new Effects(scene);

        this.game_tick(0); // sets the position to the start of the path
    }
    game_tick(delta_time){
        // handle effects
        this.health += this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps;
        this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
        this.effects.game_tick(delta_time, this);

        // Moves enemy round path
        // returns true if the enemy has got to the end of the path
        this.path_t += (delta_time * this.move_speed * this.effects.get_speed_multiplier())/this.path.getLength();
        this.path_t = Phaser.Math.Clamp(this.path_t,0,1);
        let position = this.path.getPoint(this.path_t);
        this.setPosition(position.x, position.y);
        return this.path_t >= 1;
    }
    take_damage(damage, speed=3, angle=null) {
        this.health -= damage;
        this.make_hit_particles(damage, speed, angle);
    }
    make_hit_particles(num_particles, speed=1, angle=null) {
        while (num_particles > 0) {
            if (Math.random() < num_particles) {
                let particle_angle = angle;
                if (particle_angle == null) {
                    particle_angle = random_range(-Math.PI,Math.PI);
                }
                this.scene.particles.push(new GooBlood(this.scene, this.x, this.y,
                    speed * 0.4, particle_angle * 180 / Math.PI));
            }
            num_particles -= 1;
        }
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
}