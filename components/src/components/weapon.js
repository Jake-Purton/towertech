import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import {CannonBall, Bullet, FireProjectile, EffectAOE } from '../projectile.js';
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
            this.setScale(1,-1);
        } else {
            this.setScale(1,1);
        }
        this.setAngle(angle);
        this.setPosition(this.x_offset+this.hold_distance*Math.cos(angle/180*Math.PI),
                         this.y_offset+this.hold_distance*Math.sin(angle/180*Math.PI));
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
        return new Vec(this.parentContainer.x + this.width*this.projectile_spawn_location*Math.cos(this.get_weapon_direction()/180*Math.PI),
            this.parentContainer.y + this.width*this.projectile_spawn_location*Math.sin(this.get_weapon_direction()/180*Math.PI))
    }
    get_projectile_source() {
        return this.parentContainer;
    }
}
class PistolWeapon extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'pistol_weapon', CannonBall, {stats:stats}, stats);
    }
}
class PlasmaBlaster extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'plasma_blaster', CannonBall, {stats:stats}, stats);
    }
}
class RocketLauncher extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'rocket_launcher', CannonBall, {stats:stats}, stats);
    }
}
class TeslaRifle extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'tesla_rifle', CannonBall, {stats:stats}, stats);
    }
}
class LaserCannon extends Weapon{
    constructor(scene, stats={}) {
        super(scene, 'laser_cannon', CannonBall, {stats:stats}, stats);
    }
}

export {PistolWeapon, PlasmaBlaster, RocketLauncher, TeslaRifle, LaserCannon };