import * as Phaser from 'phaser';
import Entity from './entity.js';
import {GooBlood, FireParticle, SmokeParticle} from './particle.js';
import {defined, random_range} from "./utiles.js";
const Vec = Phaser.Math.Vector2;

class Projectile extends Entity {
    // team variable can be one of "Enemy", "Player" or "Tower"
    // angle in degrees
    // source and target are game objects
    constructor(scene, x, y, texture, speed, angle, team,
                {target=null, source=null, auto_aim_strength=1, auto_aim_range=100,
                    pierce_count=0, damage=1, knockback=1, inflict_effect=null,
                    aoe=0,
                } = {}, entity_properties={}) {
        super(scene, x, y, texture, speed, angle, entity_properties);
        this.setDepth(5);

        //// variables
        this.team = team

        // attack info
        this.damage = damage;
        this.knockback = knockback;
        this.target = target;
        this.source = source;
        this.inflict_effect = inflict_effect; // in the form {name:"Burning",amplifier:2,duration:3}
        this.auto_aim_range = auto_aim_range;
        this.auto_aim_stength = auto_aim_strength;
        this.aoe = aoe;

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
    make_trail_particles() {}
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
            if (!entity.dead) {
                if (this.scene.physics.world.overlap(this, entity) && !this.pierced_enemies.includes(entity)) {
                    this.deal_damage(entity);
                    if (this.aoe !== 0) {
                        this.create_aoe()
                    }
                    return true;
                }
            }
        }
        return false;
    }
    create_aoe() {
        let aoe = new EffectAOE(
            this.scene, this.x, this.y, this.team,
            null, this.aoe, this.body.halfWidth, {damage:this.damage/2, time_to_live:0.05, source: this.source})
        this.scene.projectiles.push(aoe)
        for (let i=0;i<20;i++) {
            this.scene.particles.push(new SmokeParticle(this.scene, this.x, this.y, random_range(-1,1)*180))
        }
    }
    deal_damage(entity) {
        this.pierced_enemies.push(entity);
        this.pierce_count -= 1;
        if (this.source !== null && defined(this.source.damage_dealt)) {
            this.source.damage_dealt += 1;
        }
        entity.take_damage(this.damage, this.velocity.length(), this.velocity.angle(), this.knockback, this.source);
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
class Rocket extends Projectile {
    constructor(scene, x, y, texture, speed, angle, team, properties, entity_properties) {
        entity_properties.rotate_to_direction = true
        entity_properties.initial_scale = 0.3
        properties.aoe = 50;
        super(scene, x, y, texture, speed, angle, team, properties, entity_properties);
    }
}
class PlasmaShot extends Projectile {
    constructor(scene, x, y, texture, speed, angle, team, properties, entity_properties) {
        entity_properties.rotate_to_direction = true;
        entity_properties.initial_scale = 0.6
        super(scene, x, y, texture, speed, angle, team, properties, entity_properties);
    }
}

class EffectAOE extends Projectile {
    constructor(scene, x, y, team, effect, radius, base_half_width, {damage=0, time_to_live=1, source=null}={}) {
        super(scene, x, y, '', 0, 0, team,
            {inflict_effect:effect, pierce_count:1000, damage:damage, source:source},
            {initial_alpha:0, time_to_live:time_to_live, drag:0});
        this.body.setCircle(radius);
        this.body.reset(this.x-radius+base_half_width,this.y-radius+base_half_width);
    }
    get_dead() {
        return (this.time_to_live<0);
    }
}

class GoosniperProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=20, damage=4} = {}) {
        super(scene, x, y, 'goosniper_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:0, damage:damage},{target_distance:1000});
    }
}
class GooslingerProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=10, damage=2} = {}) {
        super(scene, x, y, 'gooslinger_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:0, damage:damage},{target_distance:300});
    }
}
class GoocasterProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=8, damage=5, auto_aim_strength=1} = {}) {
        super(scene, x, y, 'goocaster_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:auto_aim_strength, damage:damage},{target_distance:500});
    }
}
class GoobouncerProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=10, damage=1, auto_aim_strength=0} = {}) {
        super(scene, x, y, 'goobouncer_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:auto_aim_strength, damage:damage},{target_distance:200});
    }
}
class GootowerProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=10, damage=1, auto_aim_strength=0} = {}) {
        super(scene, x, y, 'gootower_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:auto_aim_strength, damage:damage},{target_distance:300});
    }
}
class GoobulletProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=3, damage=1, auto_aim_strength=0} = {}) {
        super(scene, x, y, 'goobullet_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:auto_aim_strength, damage:damage},{target_distance:1000,no_drag_distance:100000});
    }
}
class GoodroneProjectile extends Projectile {
    constructor(scene, x, y, angle, target=null, {speed=10, damage=1, auto_aim_strength=0} = {}) {
        super(scene, x, y, 'goodrone_projectile', speed, angle, 'Enemy',
            {target:target, auto_aim_strength:auto_aim_strength, damage:damage},{target_distance:1000,no_drag_distance:100000});
    }
}
class GooMeleeDamage extends Projectile {
    constructor(scene, x, y, target=null, damage=1, type) {
        super(scene, x, y, type, 0, 0, 'Enemy',
            {target:target, auto_aim_strength:0, damage:damage},{initial_alpha:0, target_distance:5, time_to_live:0.1});
    }
}

export {CannonBall, Bullet, Rocket, FireProjectile, EffectAOE, GoosniperProjectile, GooslingerProjectile,
        GooMeleeDamage, GoocasterProjectile, GoobouncerProjectile, GootowerProjectile, GoobulletProjectile,
        PlasmaShot,
        GoodroneProjectile};