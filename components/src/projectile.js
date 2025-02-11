import * as Phaser from 'phaser';
import Entity from './entity.js';
import {GooBlood, FireParticle} from './particle.js';
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
        this.pierced_enemies = [];
    }
    game_tick(delta_time, enemies, towers, players) {

        // collision detection
        switch (this.team) {
            case "Tower":
                this.check_collision(enemies);
                break;
            case "Enemy":
                this.check_collision(towers);
                this.check_collision(players);
                break;
        }
        this.follow_target();
        this.physics_tick(delta_time);
        this.make_trail_particles(delta_time);
    }
    make_trail_particles(_) {}
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
        let iterable = entities;
        if (!Array.isArray(iterable)) {
            iterable = Object.values(iterable);
        }
        for (let entity of iterable) {
            if (this.scene.physics.world.overlap(this, entity) && !this.pierced_enemies.includes(entity)) {
                this.deal_damage(entity);
                return true;
            }
        }
        return false;
    }
    deal_damage(entity) {
        this.pierced_enemies.push(entity);
        this.pierce_count -= 1;
        entity.take_damage(this.damage, this.velocity.length(), this.velocity.angle());
        // this.make_hit_particles(entity);
        this.apply_inflict_effect(entity);
    }
    make_hit_particles(entity) {
        for (let i = 0; i < 3; i++) {
            this.scene.particles.push(new GooBlood(this.scene, entity.x, entity.y,
                this.velocity.length() * 0.4, this.velocity.angle() * 180 / Math.PI));
        }
    }
    apply_inflict_effect(entity) {
        if (this.inflict_effect != null) {
            entity.effects.add_effect(this.inflict_effect.name, this.inflict_effect.amplifier, this.inflict_effect.duration,);
        }
    }
    get_dead() {
        return (this.time_to_live<0 || this.velocity.length()<this.speed_min_to_kill || this.pierce_count<0  || this.alpha < this.alpha_min_to_kill || this.scale < this.scale_min_to_kill);
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
        properties.inflict_effect = {name:"Burning",amplifier:20,duration:1.5}
        super(scene, x, y, texture, speed, angle, team, properties,
            Object.assign(entity_properties, {rotate_to_direction:true, initial_scale:0.4, alpha_change:-1.5}));

        this.particle_cooldown = 0;
    }
    make_trail_particles(delta_time) {
        this.particle_cooldown -= delta_time/this.scene.target_fps;
        if (this.particle_cooldown < 0) {
            this.particle_cooldown = 0.2-this.alpha/10;
            this.scene.particles.push(new FireParticle(this.scene, this.x, this.y, 8));
        }
    }
}
class EffectAOE extends Projectile {
    constructor(scene, x, y, team, effect, radius, base_half_width) {
        super(scene, x, y, '', 0, 0, team,
            {inflict_effect:effect, pierce_count:1000, damage:0},
            {initial_alpha:0, time_to_live:1, drag:0});
        this.body.setCircle(radius);
        this.body.reset(this.x-radius+base_half_width,this.y-radius+base_half_width);
    }
    get_dead() {
        return (this.time_to_live<0);
    }
}

class GoosniperProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, speed_multiplier=1) {
        let base_speed = 20;
        super(scene, x, y, 'goosniper_projectile', base_speed*speed_multiplier, angle, 'Enemy',
            {target:target, auto_aim_strength:0});
    }
}
class GooslingerProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, speed_multiplier=1) {
        let base_speed = 10;
        super(scene, x, y, 'gooslinger_projectile', base_speed*speed_multiplier, angle, 'Enemy',
            {target:target, auto_aim_strength:0});
    }
}


export {CannonBall, Bullet, FireProjectile, EffectAOE, GoosniperProjectile, GooslingerProjectile };