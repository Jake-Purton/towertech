import * as Phaser from 'phaser';
import {CannonBall, Bullet, FireProjectile, EffectAOE } from './projectile.js';
import {random_gauss, modulo, get_removed } from './utiles.js';
import Effects from './effects.js';
import LineAttack from './line_attack.js';
import ProjectileShooter from './projectile_shooter.js';
const Vec = Phaser.Math.Vector2;

class Tower extends ProjectileShooter {
    // range is in pixels
    // fire_rate is shots per seconds
    constructor(scene, x, y, tower_type, player_id, projectile_class,
                {base_scale=1, gun_scale=1, gun_center=[0.2, 0.5], health=100} = {}, properties) {
        super(scene, x, y, tower_type + '_base', projectile_class, properties);

        this.base_scale = base_scale;
        this.setScale(this.base_scale);

        // create gun
        this.gun = new Phaser.Physics.Arcade.Sprite(scene, x, y, tower_type + '_gun');
        scene.add.existing(this.gun);
        scene.physics.add.existing(this.gun);

        // create range highlighter
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xff0000);

        ////// variables //////
        // gun rendering
        this.gun_scale = gun_scale;
        this.gun_center = gun_center;
        this.gun.setOrigin(this.gun_center[0], this.gun_center[1]);
        this.gun.setScale(this.gun_scale);

        // basic tower info
        this.tower_type = tower_type;
        this.playerid = player_id;

        this.enabled = true;
        this.health = health;
        this.max_health = health;

        // effects info
        this.effects = new Effects(scene);

        // nearby player info
        this.nearby_radius = 35;
        this.nearby_player = null;
    }
    game_tick(delta_time, enemies, players) {
        super.game_tick(delta_time);
        if (this.enabled){
            this.shoot_cooldown -= delta_time/this.scene.target_fps;
            this.time_since_attacking += delta_time/this.scene.target_fps;

            if (get_removed(this.target)) {
                this.check_target(enemies);
            }
            this.rotate_gun(delta_time);
            this.attack_enemies(enemies, this.effects);

            this.check_nearby_player(players);

            this.effects.game_tick(delta_time, this);
        }
    }
    set_weapon_direction(angle) {
        this.gun.setAngle(angle);
    }
    get_weapon_direction() {
        return this.gun.angle;
    }
    get_projectile_texture_name() {
        return this.tower_type.concat('_projectile');
    }
    check_nearby_player(players) {
        let new_nearby_player = null;
        for (let player of Object.values(players)) {
            if (this.get_relative_pos(player).length()<this.nearby_radius) {
                new_nearby_player = player;
            }
        }
        if (this.nearby_player == null && new_nearby_player != null && !new_nearby_player.has_nearby_tower) {
            this.set_new_nearby_player(new_nearby_player);
        } else if (this.nearby_player != null && new_nearby_player == null) {
            this.remove_nearby_player();
        }
    }
    set_new_nearby_player(new_nearby_player) {
        this.nearby_player = new_nearby_player;
        this.nearby_player.has_nearby_tower = true;
        this.scene.output_data(new_nearby_player.player_id, {type:'Tower_In_Range'});
        this.graphics.strokeCircle(this.x,this.y,this.range);
    }
    remove_nearby_player() {
        this.scene.output_data(this.nearby_player.player_id, {type:'Tower_Out_Of_Range'});
        this.nearby_player.has_nearby_tower = false;
        this.nearby_player = null;
        this.graphics.clear();
    }
    get_dead() {
        return (this.health<=0)
    }
    take_damage(damage, speed, angle, source) {
        this.health -= damage;
    }
    get_kill_credit(enemy) {
        this.scene.players[this.playerid].get_kill_credit(enemy);
    }
    disable_tower(){
        this.enabled = false;
    }
    enable_tower(){
        this.enabled = true;
    }
}

class CannonTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall,
            {range:80, fire_distance:100, projectile_no_drag_distance:0,
                fire_rate:2, projectile_spawn_location:0.5});
    }
}

class LaserTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1}, {range:150, fire_distance:150, projectile_no_drag_distance:120,
            damage:0.1, fire_rate:10, pierce_count:100, projectile_auto_aim_strength:0,
            projectile_min_speed:1, fire_velocity:20});
        this.recent_laser = null;
        this.animation_position_tracker = 0;
        this.animation_speed = 6;
    }
    game_tick(delta_time, enemies, players) {
        super.game_tick(delta_time, enemies, players);
        if (!get_removed(this.recent_laser)) {
            this.animation_position_tracker = this.recent_laser.animation_position;
        }
    }
    shoot(effects) {
        if (this.check_shooting_blocked()) {
            let damage = this.damage * effects.get_damage_multiplier();
            let laser = new LineAttack(this.scene, this, this.target,
                this.tower_type.concat('_projectile'), damage, 0.11, this.animation_speed, this.animation_position_tracker)
            this.recent_laser = laser;
            this.scene.projectiles.push(laser);
        }
    }
    check_shooting_blocked() {
        let prev_target = this.target;
        this.check_target(this.scene.enemies);
        if (prev_target !== this.target) {
            this.shoot_cooldown = 0.1;
            this.target = prev_target;
            return false;
        }
        return true;
    }
}

class SniperTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1.2}, {range:400, fire_distance:400,
             projectile_no_drag_distance:300, damage:5, fire_rate:0.5 });
    }
}

class FlamethrowerTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, FireProjectile,
            {gun_scale:0.5}, {range:200, fire_distance:200, projectile_no_drag_distance:50,
            damage:0.5, fire_rate:20, fire_spread:10, projectile_auto_aim_strength:0,pierce_count:3,
            projectile_min_speed:1, projectile_spawn_location:1.2});
    }
}

class BallistaTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1.5}, {range:300, fire_distance:300, projectile_no_drag_distance:200,
            damage:3, fire_rate:3, pierce_count:1, fire_velocity:20,projectile_auto_aim_strength:0});
    }
}
// tesla tower/inferno style tower?

class WeakeningTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall,
            {});
    }
}

class SlowingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, EffectAOE, {gun_center:[0.5,0.5]}, {fire_rate:10});
    }
    shoot(effects) {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'Tower', {source:this, name:"Slow", amplifier:0.5, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun(delta_time) {
        this.ready_to_shoot = true;
    }
}

class HealingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, EffectAOE, {gun_center:[0.5,0.5]}, {fire_rate:10,});
    }
    shoot(effects) {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'Enemy', {source:this, name:"Healing", amplifier:10, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun(delta_time) {
        this.ready_to_shoot = true;
    }
}

class BuffingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, EffectAOE, {gun_center:[0.5,0.5]}, {fire_rate:10});
    }
    shoot(effects) {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'Enemy', {source:this, name:"Fast", amplifier:1.5, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun(delta_time) {
        this.ready_to_shoot = true;
    }
}

const tower_map = {
    'CannonTower':CannonTower,
    'LaserTower':LaserTower,
    'SniperTower':SniperTower,
    'FlamethrowerTower':FlamethrowerTower,
    'BallistaTower':BallistaTower,
    'WeakeningTower':WeakeningTower,
    'SlowingTower':SlowingTower,
    'HealingTower':HealingTower,
    'BuffingTower':BuffingTower};

function create_tower(tower_type, scene, x, y, player_id){
    let new_tower = null;
    if (tower_type in tower_map) {
        new_tower = new tower_map[tower_type](scene, x, y, tower_type, player_id);
    }
    return new_tower;
}

export {CannonTower, LaserTower, SniperTower, FlamethrowerTower, BallistaTower,
    WeakeningTower, SlowingTower, HealingTower, BuffingTower, create_tower };