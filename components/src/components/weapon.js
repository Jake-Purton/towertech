import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import {CannonBall, Rocket, PlasmaShot, EffectAOE} from '../projectile.js';
import {modulo } from '../utiles.js';
import ProjectileShooter from '../projectile_shooter.js';
import {PartStats} from './part_stat_manager.js';

class Weapon extends ProjectileShooter {
    constructor(scene, texture, projectile_class, {x_offset=0, y_offset=0, hold_distance=16, length=20,
            stats} = {}, properties){
        properties.max_turn_speed = 200;
        properties.passive_turn_speed = 0;
        stats.range = 1000;
        super(scene, 0, 0, texture, projectile_class, properties);
        this.stats = new PartStats(stats);

        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.hold_distance = hold_distance;

        this.weapon_direction = 0;
        if (typeof(stats.auto_fire) === 'undefined') { stats.auto_fire = true }
        this.auto_fire = stats.auto_fire;
        this.block_fire = false;
        this.auto_target = false;

        this.weapon_length = length;
        this.set_scale(1);

        this.set_weapon_direction(40);
    }
    set_scale(scale) {
        this.setScale(scale*this.weapon_length/this.width);
        this.set_weapon_direction(this.get_weapon_direction());
    }
    attack_button_down(delta_time, enemies, effects) {
        if (this.auto_target) {
            this.locate_target(enemies);
            this.rotate_gun(delta_time);
        } else {
            this.ready_to_shoot = true;
        }
        if (!this.block_fire && this.attack_enemies(enemies, effects) && !this.auto_fire) {
            this.block_fire = true;
        }
    }
    attack_button_up() {
        this.block_fire = false
    }

    // angle in degrees
    set_weapon_direction(angle) {
        this.weapon_direction = angle;
        if (modulo(angle, 360) > 90 && modulo(angle, 360) < 270) {
            this.setScale(this.scaleX,-this.scaleX);
        } else {
            this.setScale(this.scaleX);
        }
        this.setAngle(angle);
        this.setPosition(this.x_offset+this.scaleX*this.hold_distance*Math.cos(angle/180*Math.PI),
                         this.y_offset+this.scaleX*this.hold_distance*Math.sin(angle/180*Math.PI));
    }
    get_weapon_direction() {
        return this.weapon_direction;
    }
    get_projectile_texture_name() {
        return 'CannonTower_projectile';
    }
    get_relative_pos(enemy) {
        return new Vec(enemy.x-this.parentContainer.x, enemy.y-this.parentContainer.y);
    }
    get_projectile_source_position() {
        return new Vec(this.parentContainer.x + this.displayWidth*this.projectile_spawn_location*Math.cos(this.get_weapon_direction()/180*Math.PI),
            this.parentContainer.y + this.displayWidth*this.projectile_spawn_location*Math.sin(this.get_weapon_direction()/180*Math.PI))
    }
    get_projectile_source() {
        return this.parentContainer;
    }
}
class PistolWeapon extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'pistol_weapon', CannonBall, {stats:stats, length:20}, stats);
    }
}
class PlasmaBlaster extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'plasma_blaster', PlasmaShot, {stats:stats, length:30, hold_distance:40}, stats);
    }
    get_projectile_texture_name() {
        return "plasma_blaster_projectile"
    }
}
class RocketLauncher extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'rocket_launcher', Rocket, {stats:stats, length:50, hold_distance:30}, stats);
    }
    get_projectile_texture_name() {
        return "rocket_projectile"
    }
}
class TeslaRifle extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'tesla_rifle', CannonBall, {stats:stats, length:30, hold_distance:60}, stats);
    }
}
class LaserCannon extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'laser_cannon', CannonBall, {stats:stats, length:40, hold_distance:60}, stats);
    }
}
class SwordOfVoid extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'sword_of_void', EffectAOE, {stats:stats, length:40, hold_distance:60}, stats);

        this.sword_animation_length = 0.3
    }
    game_tick(delta_time) {
        super.game_tick(delta_time);
        this.sword_animation_timer -= delta_time/this.scene.target_fps;
        this.animate_sword()
    }
    animate_sword() {
        if (this.sword_animation_timer > 0) {
            let progress = this.sword_animation_timer/this.sword_animation_length;
            let angle_diff = (progress**0.5-0.5)*140
            this.setOrigin(0.1,0.9);
            this.setAngle(this.get_weapon_direction()+angle_diff)
        } else {
            this.setOrigin(0.5,0.5);
            this.set_weapon_direction(this.get_weapon_direction())
        }
    }
    shoot(effects) {
        this.shots_fired += 1;

        let damage = this.damage * effects.get_damage_multiplier();
        let shoot_pos = this.get_projectile_source_position();
        this.sword_animation_timer = this.sword_animation_length;

        this.scene.projectiles.push(new this.projectile_class(
            this.scene, shoot_pos.x, shoot_pos.y, 'Tower', null, this.body.halfWidth*1.5, this.body.halfWidth,
            {damage: damage, time_to_live:0.1, source: this.get_projectile_source()},
            {time_to_live:0.3}
        ))
    }
}

export {PistolWeapon, PlasmaBlaster, RocketLauncher, TeslaRifle, LaserCannon, SwordOfVoid };