import * as Phaser from 'phaser';
import {CannonBall } from './projectile.js'
const Vec = Phaser.Math.Vector2;

class Tower extends Phaser.Physics.Arcade.Sprite {
    // range is in pixels
    // fire_rate is shots per seconds
    constructor(scene, x, y, tower_type, player_id, projectile_class=CannonBall, range=100, fire_rate=3) {
        super(scene, x, y, tower_type+'_base');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // create gun
        this.gun = new Phaser.Physics.Arcade.Sprite(scene, x, y, tower_type+'_gun');
        scene.add.existing(this.gun);
        scene.physics.add.existing(this.gun);

        // variables
        this.tower_type = tower_type;
        this.projectile_class = projectile_class;
        this.playerid = player_id;
        this.target = null;

        this.range = range;
        this.shoot_cooldown_value = 1/fire_rate;

        this.ready_to_shoot = false;
        this.shoot_cooldown = 0;
    }
    check_target(enemies) {
        if (this.target === null || typeof(this.target.scene) === "undefined") {
            this.locate_target(enemies);
        } else {
            if (this.get_relative_pos(this.target).length()>this.range){
                this.target = null;
            }
        }
    }
    locate_target(enemies) {
        let min_dis = this.range;
        this.target = null;
        for (let enemy of enemies) {
            let dis = this.get_relative_pos(enemy).length();
            if (dis < min_dis) {
                min_dis = dis;
                this.target = enemy;
            }
        }
    }
    attack_enemies(enemies) {
        if (this.ready_to_shoot && this.shoot_cooldown<0) {
            this.shoot();
        }
    }
    shoot() {
        this.shoot_cooldown = this.shoot_cooldown_value;
        // console.log(this.gun.angle);
        this.scene.projectiles.push(new this.projectile_class(this.scene, this.x, this.y, this.gun.angle, 'Tower', this.target));
    }

    rotate_gun() {
        this.ready_to_shoot = false;
        if (this.target!==null) {
            // get angle towards target
            let target_angle = this.get_relative_pos(this.target).angle();

            // rotate gun
            this.gun.setAngle(target_angle*180/Math.PI);
            this.ready_to_shoot = true;
        }
    }
    // returns a list of new projectiles
    game_tick(delta_time, enemies) {
        this.shoot_cooldown -= delta_time/60;

        this.check_target(enemies);
        this.rotate_gun();
        this.attack_enemies(enemies);
    }
    // returns the relative position from this to the passed enemy
    get_relative_pos(enemy) {
        return new Vec(enemy.body.x-this.body.x, enemy.body.y-this.body.y);
    }
}

class CannonTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, 2000, 2);
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