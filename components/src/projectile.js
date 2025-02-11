import * as Phaser from 'phaser';
import Entity from './entity.js';
import {GooBlood} from './particle.js';
const Vec = Phaser.Math.Vector2;

export default class Projectile extends Entity {
    // team variable can be one of "Enemy", "Player" or "Tower"
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle, team, target=null,
                drag=1, damage=1, auto_aim_range=1000, auto_aim_strength=1,
                speed_min_to_kill=0, time_to_live=5, pierce_count=0) {
        super(scene, x, y, texture, speed, angle, drag, speed_min_to_kill,
            time_to_live, pierce_count);

        //// variables
        this.team = team

        // attack info
        this.damage = damage;
        this.target = target;
        this.auto_aim_range = auto_aim_range;
        this.auto_aim_stength = auto_aim_strength;

        // kill particle info
        this.pierce_count = pierce_count;  // reduces by 1 each time the projectile hits something
    }
    game_tick(delta_time, enemies, players, towers) {

        // collision detection
        let collision = false;
        switch (this.team) {
            case "Tower":
                collision = this.check_collision(enemies);
                break;
            case "Enemy":
                collision = (this.check_collision(towers) || this.check_collision(players))
        }
        this.follow_target();
        this.physics_tick(delta_time);
    }
    follow_target() {
        if (this.target !== null && typeof(this.target.scene) !== "undefined") {
            let prev_length = this.velocity.length()
            let relative_position = this.target.body.position.clone();
            relative_position.x -= this.body.position.x;
            relative_position.y -= this.body.position.y;
            if (relative_position.length() < this.auto_aim_range) {
                relative_position.setLength(this.auto_aim_stength);
                this.velocity.add(relative_position);
                this.velocity.setLength(prev_length);
            }

        }

    }
    check_collision(entities){
        for (let entity of entities) {
            if (this.scene.physics.world.overlap(this, entity)) {
                this.deal_damage(entity);
                return true;
            }
        }
        return false;
    }
    deal_damage(entity) {
        entity.health -= this.damage;
        this.pierce_count -= 1;
        for (let i=0;i<3;i++) {
            this.scene.particles.push(new GooBlood(this.scene, entity.x, entity.y,
                this.velocity.length()/3,this.velocity.angle()*180/Math.PI));
        }
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.pierce_count<0);
    }
}

class CannonBall extends Projectile {
    constructor(scene, x, y, angle, team, target=null, speed_multiplier=1) {
        let base_speed = 10;
        super(scene, x, y, 'cannon_ball', base_speed*speed_multiplier, angle, team, target);
    }
}

export {CannonBall };