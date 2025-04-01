import * as Phaser from 'phaser';
import {CannonBall, Bullet, FireProjectile, EffectAOE } from './projectile.js';
import {defined, get_removed, get_tower_subclass} from './utiles.js';
import Effects from './effects.js';
import LineAttack from './line_attack.js';
import ProjectileShooter from './projectile_shooter.js';

class Tower extends ProjectileShooter {
    // range is in pixels
    // fire_rate is shots per seconds
    static tower_id_tracker = 0;
    constructor(scene, x, y, tower_type, player_id, projectile_class, tower_stats={level:1},
                {base_scale=1, gun_scale=1, gun_center=[0.2, 0.5], health=100} = {}, properties = {}) {
        for (let stat in tower_stats) {
            properties[stat] = tower_stats[stat];
        }
        let tower_subclass = get_tower_subclass(tower_type);
        super(scene, x, y, tower_subclass+'Tower_base_'+tower_stats.level, projectile_class, properties);
        this.setDepth(1);

        this.base_scale = base_scale;

        // create gun
        this.gun = new Phaser.Physics.Arcade.Sprite(scene, x, y, tower_type + '_gun');
        scene.add.existing(this.gun);
        scene.physics.add.existing(this.gun);
        this.gun.setDepth(1.5);

        // create range highlighter
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(2, 0xff0000);
        this.graphics.strokeCircle(this.x,this.y,this.range);
        this.graphics.setVisible(false)

        ////// variables //////
        // gun rendering
        this.gun_scale = gun_scale*(tower_stats.level/10+0.9);
        this.gun_center = gun_center;
        this.gun.setOrigin(this.gun_center[0], this.gun_center[1]);
        this.setScale(1);

        // basic tower info
        this.tower_type = tower_type;
        this.playerid = player_id;
        this.tower_stats = tower_stats;

        this.enabled = true;
        this.health = health;
        this.max_health = health;
        this.nearby_players = [];

        // effects info
        this.effects = new Effects(scene);


        // id
        this.tower_id = Tower.tower_id_tracker;
        Tower.tower_id_tracker += 1;
    }
    game_tick(delta_time, enemies) {
        super.game_tick(delta_time);
        if (this.enabled){
            this.shoot_cooldown -= delta_time;
            this.time_since_attacking += delta_time;

            if (get_removed(this.target)) {
                this.check_target(enemies);
            }
            this.rotate_gun(delta_time);
            this.attack_enemies(enemies, this.effects);

            // this.check_nearby_player(players);

            this.effects.game_tick(delta_time, this);
        }
    }
    add_nearby_player(player) {
        if (!this.nearby_players.includes(player)) {
            this.nearby_players.push(player)
            if (this.nearby_players.length > 0) {
                this.graphics.setVisible(true)
            }
        }
    }
    remove_nearby_player(player) {
        if (this.nearby_players.includes(player)) {
            this.nearby_players.splice(this.nearby_players.indexOf(player), 1)
            // this.nearby_players.remove(player)
            if (this.nearby_players.length === 0) {
                this.graphics.setVisible(false)
            }
        }
    }
    upgrade(tower_stats) {
        let new_tower = create_tower(this.tower_type, this.scene, this.x, this.y, this.playerid, tower_stats);
        this.scene.towers[this.tower_id] = new_tower;
        new_tower.tower_id = this.tower_id;
        this.destroy();
    }
    set_weapon_direction(angle) {
        this.gun.setAngle(angle);
        return this;
    }
    get_weapon_direction() {
        return this.gun.angle;
    }
    get_projectile_texture_name() {
        return this.tower_type.concat('_projectile');
    }
    get_dead() {
        return (this.health<=0)
    }
    take_damage(damage) {
        this.health -= damage;
    }
    get_kill_credit(enemy) {
        if (defined(this.scene)) {
            this.scene.players[this.playerid].get_kill_credit(enemy);
        }
    }
    set_pos(x, y) {
        this.setPosition(x, y);
        this.gun.setPosition(x, y);
    }
    set_as_ui_display() {
        this.setAlpha(0);
        this.gun.setOrigin(0.5, 0.5);
        this.gun.setAngle(-45);
    }
    destroy(fromScene) {
        this.graphics.destroy();
        this.gun.destroy();
        super.destroy(fromScene);
    }
    disable_tower(){
        this.enabled = false;
    }
    enable_tower(){
        this.enabled = true;
    }
    get_overlap_other_towers() {
        for (let tower of Object.values(this.scene.towers)) {
            if (this.scene.physics.overlap(this, tower)) {
                return true
            }
        }
        return false
    }
    setScale(x, y = undefined) {
        if (!defined(y)) {
            y = x;
        }
        this.gun.setScale(
            x * this.base_scale * this.gun_scale,
            y * this.base_scale * this.gun_scale);
        super.setScale(
            x * this.base_scale, y * this.base_scale);
        return this
    }
}

class CannonTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, CannonBall, tower_stats,
            {range:80, fire_distance:100, projectile_no_drag_distance:0, projectile_auto_aim_strength:10,
                fire_rate:2, projectile_spawn_location:0.5});
    }
}

class LaserTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, Bullet, tower_stats,
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
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, Bullet, tower_stats,
            {gun_scale:1.2}, {range:400, fire_distance:400,
             projectile_no_drag_distance:300, damage:5, fire_rate:0.5 });
    }
}

class FlamethrowerTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, FireProjectile, tower_stats,
            {gun_scale:0.5}, {range:200, fire_distance:200, projectile_no_drag_distance:50,
            damage:0.5, fire_rate:20, fire_spread:10, projectile_auto_aim_strength:0,pierce_count:1,
            projectile_min_speed:1, projectile_spawn_location:1.2});
    }
}

class BallistaTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, Bullet, tower_stats,
            {gun_scale:1.5}, {range:300, fire_distance:300, projectile_no_drag_distance:200,
            damage:3, fire_rate:3, fire_velocity:20,projectile_auto_aim_strength:0});
    }
}
// tesla tower/inferno style tower?

class WeakeningTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={}) {
        super(scene, x, y, tower_type, player_id, CannonBall, tower_stats,
            {});
    }
}

class SlowingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={effect_amplifier:0.5}) {
        super(scene, x, y, tower_type, player_id, EffectAOE, tower_stats, {gun_center:[0.5,0.5]}, {fire_rate:10});
        this.effect_amplifier = tower_stats.effect_amplifier;
    }
    shoot() {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'Tower', {source:this, name:"Slow", amplifier:this.effect_amplifier, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun() {
        this.ready_to_shoot = true;
    }
}

class HealingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={effect_amplifier:10}) {
        super(scene, x, y, tower_type, player_id, EffectAOE, tower_stats, {gun_center:[0.5,0.5]}, {fire_rate:10,});
        this.effect_amplifier = tower_stats.effect_amplifier;
    }
    shoot() {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'EffectTower', {source:this, name:"Healing", amplifier:this.effect_amplifier, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun() {
        this.ready_to_shoot = true;
    }
}

class BuffingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id, tower_stats={effect_amplifier:1.5}) {
        super(scene, x, y, tower_type, player_id, EffectAOE, tower_stats, {gun_center:[0.5,0.5]}, {fire_rate:10});
        this.effect_amplifier = tower_stats.effect_amplifier;
    }
    shoot() {
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, 'EffectTower', {source:this, name:"Fast", amplifier:this.effect_amplifier, duration:0.11}, this.range, this.body.halfWidth));
    }
    rotate_gun() {
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

function create_tower(tower_type, scene, x, y, player_id, tower_stats={level:1}){
    let new_tower = null;
    if (tower_type in tower_map) {
        new_tower = new tower_map[tower_type](scene, x, y, tower_type, player_id, tower_stats);
    }
    return new_tower;
}

export {CannonTower, LaserTower, SniperTower, FlamethrowerTower, BallistaTower,
    WeakeningTower, SlowingTower, HealingTower, BuffingTower, create_tower};