import * as Phaser from 'phaser';
import Entity from './entity.js';
import {GooBlood} from './particle.js';
const Vec = Phaser.Math.Vector2;

class Projectile extends Entity {
    // team variable can be one of "Enemy", "Player" or "Tower"
    // angle in degrees
    constructor(scene, x, y, texture, speed, angle, team,
                {target=null, auto_aim_strength=1, auto_aim_range=100,
                    pierce_count=0, damage=1, inflict_effect=null,
                } = {}, entity_properties={}) {
        super(scene, x, y, texture, speed, angle, entity_properties);

        //// variables
        this.team = team

        // attack info
        this.damage = damage;
        this.target = target;
        this.inflict_effect = inflict_effect; // in the form {name:"Burning",amplifier:2,duration:3}
        this.auto_aim_range = auto_aim_range;
        this.auto_aim_stength = auto_aim_strength;

        // kill particle info
        this.pierce_count = pierce_count;  // reduces by 1 each time the projectile hits something
        this.pierced_enemies = []; // tracks what has been hit so it doesnt hit the same enemy multiple times
    }
    game_tick(delta_time, enemies, tower) {

        // collision detection
        let collision = false;
        switch (this.team) {
            case "Tower":
                collision = this.check_collision(enemies);
                break;
        }
        this.follow_target();
        this.physics_tick(delta_time);
    }
    follow_target() {
        if (this.target !== null && typeof(this.target.scene) !== "undefined") {
            let prev_length = this.velocity.length()
            let relative_position = new Vec(this.target.x-this.x, this.target.y-this.y);
            if (relative_position.length() < this.auto_aim_range) {
                relative_position.setLength(this.auto_aim_stength);
                this.velocity.add(relative_position);
                this.velocity.setLength(prev_length);
            }
        }
    }
    check_collision(entities){
        for (let entity of entities) {
            if (this.scene.physics.world.overlap(this, entity) && !this.pierced_enemies.includes(entity)) {
                this.deal_damage(entity);
                return true;
            }
        }
        return false;
    }
    deal_damage(entity) {
        entity.health -= this.damage;
        this.pierced_enemies.push(entity);
        this.pierce_count -= 1;
        for (let i=0;i<3;i++) {
            this.scene.particles.push(new GooBlood(this.scene, entity.x, entity.y,
                this.velocity.length()*0.4,this.velocity.angle()*180/Math.PI));
        }
        if (this.inflict_effect != null) {
            entity.effects.add_effect(this.inflict_effect.name, this.inflict_effect.amplifier, this.inflict_effect.duration,);
        }
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.pierce_count<0);
    }
}

class CannonBall extends Projectile {
    constructor(scene, x, y, texture, speed, angle, team, properties, entity_properties) {
        super(scene, x, y, texture, speed, angle, team, properties, entity_properties);
    }
}
class Bullet extends Projectile {
    constructor(scene, x, y, texture, speed, angle, team, properties, entity_properties) {
        entity_properties.rotate_to_direction = true;
        super(scene, x, y, texture, speed, angle, team, properties, entity_properties);
    }
}
class FireProjectile extends Projectile {
    constructor(scene, x, y, texture, speed, angle, team, properties, entity_properties) {
        entity_properties.rotate_to_direction = true;
        entity_properties.initial_scale = 0.4;
        properties.inflict_effect = {name:"Burning",amplifier:2,duration:1.5}
        super(scene, x, y, texture, speed, angle, team, properties, entity_properties);
    }
}

export {CannonBall, Bullet, FireProjectile };