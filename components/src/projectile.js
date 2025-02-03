import * as Phaser from 'phaser';
import Entity from './entity.js';
import {GooBlood} from './particle.js';
const Vec = Phaser.Math.Vector2;

class Projectile extends Entity {
    // team variable can be one of "Enemy", "Player" or "Tower"
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle, team, target=null,
                drag=0.9, damage=1,
                speed_min_to_kill=1, time_to_live=5, pierce_count=0) {
        super(scene, x, y, texture, speed, angle, drag, speed_min_to_kill,
            time_to_live, pierce_count);

        //// variables
        this.team = team

        // attack info
        this.damage = damage;

        // kill particle info
        this.pierce_count = pierce_count;  // reduces by 1 each time the projectile hits something
    }
    game_tick(delta_time, enemies, tower) {

        // collision detection
        let collision = false;
        switch (this.team) {
            case "Tower":
                collision = this.check_collision(enemies);
                break;
        }

        this.physics_tick(delta_time)
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
        let base_speed = 20;
        super(scene, x, y, 'cannon_ball', base_speed*speed_multiplier, angle, team, target);
    }
}

export {CannonBall };