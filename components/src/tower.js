import * as Phaser from 'phaser';
import {CannonBall } from './projectile.js'
import {random_gauss, modulo, get_removed } from './utiles.js'
const Vec = Phaser.Math.Vector2;

class Tower extends Phaser.Physics.Arcade.Sprite {
    // range is in pixels
    // fire_rate is shots per seconds
    constructor(scene, x, y, tower_type, player_id, projectile_class,
                {range=100, fire_rate=3, damage=1, pierce_count=0,
                    fire_distance=100, projectile_min_speed=0.5, projectile_no_drag_distance=0,
                    fire_spread=0,
                    gun_scale=1, gun_center=[0.2, 0.5], base_scale=1,
                    max_turn_speed=360, target_type='Closest', stay_on_same_target=false,
                } = {}) {
        super(scene, x, y, tower_type+'_base');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.base_scale = base_scale;
        this.setScale(this.base_scale);

        // create gun
        this.gun = new Phaser.Physics.Arcade.Sprite(scene, x, y, tower_type+'_gun');
        scene.add.existing(this.gun);
        scene.physics.add.existing(this.gun);

        this.gun_scale = gun_scale;
        this.gun_center = gun_center;
        this.gun.setOrigin(this.gun_center[0], this.gun_center[1]);
        // this.gun.displayOriginX = this.gun_center[0];
        // this.gun.displayOriginY = this.gun_center[1];
        this.gun.setScale = this.gun_scale;

        // variables
        this.tower_type = tower_type;
        this.projectile_class = projectile_class;
        this.playerid = player_id;
        this.target = null;

        this.range = range;
        this.shoot_cooldown_value = 1/fire_rate;
        this.damage = damage;
        this.pierce_count = pierce_count;
        this.fire_spread = fire_spread;

        this.fire_distance = fire_distance;
        this.projectile_min_speed = projectile_min_speed;
        this.projectile_no_drag_distance = projectile_no_drag_distance;

        this.ready_to_shoot = false;
        this.shoot_cooldown = 0;

        this.max_turn_speed = max_turn_speed; // measured in degrees
        this.target_type = target_type; // can be one of "Closest", "Furthest", "Front", "Back", "MostHealth", "LeastHealth"
        this.stay_on_same_target = stay_on_same_target; // if true will keep attacking same target even if new target appears, e.g. a new closest target
    }
    game_tick(delta_time, enemies) {
        this.shoot_cooldown -= delta_time/this.scene.target_fps;

        if (get_removed(this.target)) {
            this.check_target(enemies);
        }
        this.rotate_gun(delta_time);
        this.attack_enemies(enemies);
    }
    check_target(enemies) {
        if (!this.stay_on_same_target || get_removed(this.target)) {
            this.locate_target(enemies);
        } else {
            if (this.get_relative_pos(this.target).length()>this.range){
                this.target = null;
            }
        }
    }
    locate_target(enemies) {
        this.target = null;
        switch (this.target_type){
            case "Front":
                this.target = enemies[0];
                break;
            case "Back":
                this.target = enemies[enemies.length-1];
                break;
            default:
                let best_val = null;
                this.target = null;
                for (let enemy of enemies) {
                    let val = this.evaluate_enemy(enemy);
                    if (val > best_val || best_val === null) {
                        best_val = val;
                        this.target = enemy;
                    }
                }
        }
    }
    // function used to work out what enemy to target
    evaluate_enemy(enemy) {
        // higher return means more likely to be chosen
        switch (this.target_type) {
            case "Closest":
                return -this.get_relative_pos(enemy).length()
            case "Furthest":
                return this.get_relative_pos(enemy).length()
            case "MostHealth":
                return enemy.health;
            case "LeastHealth":
                return -enemy.health
        }

    }

    attack_enemies(enemies) {
        if (this.ready_to_shoot && this.shoot_cooldown<0) {
            this.shoot();
            this.check_target(enemies);
        }
    }
    shoot() {
        this.shoot_cooldown = this.shoot_cooldown_value;
        // console.log(this.gun.angle);
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y,
            random_gauss(this.gun.angle, this.fire_spread), 'Tower', this.target));
    }

    rotate_gun(delta_time) {
        this.ready_to_shoot = false;
        if (this.target!==null) {
            // get angle towards target
            let target_angle = this.get_relative_pos(this.target).angle()*180/Math.PI;
            let current_angle = this.gun.angle;

            // rotate gun - ye i dont understand this code either i kinda eyeballed the maths
            // rotates a maximum of this.max_turn_speed per tick
            let diff = target_angle-current_angle
            let dis = modulo(diff, 360);
            if (dis > 180) {
                dis = 360-dis;
            }
            if (dis < this.max_turn_speed*delta_time) {
                this.gun.setAngle(target_angle);
            } else {
                let flip;
                if (diff < 0) {
                    flip = -1
                } else {
                    flip = 1
                }
                if (diff % 360 < 180) {
                    this.gun.setAngle(current_angle + this.max_turn_speed * delta_time * flip)
                } else {
                    this.gun.setAngle(current_angle - this.max_turn_speed * delta_time * flip)
                }
            }
            this.ready_to_shoot = true;
        }
    }

    // returns the relative position from this to the passed enemy
    get_relative_pos(enemy) {
        return new Vec(enemy.body.x-this.body.x, enemy.body.y-this.body.y);
    }
}

class CannonTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall,
            {range: 2000, fire_rate: 2});
    }
}

class LaserTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class SniperTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class FlamethrowerTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 20);
    }
}

class BallistaTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class WeakeningTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class SlowingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class HealingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
    }
}

class BuffingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
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