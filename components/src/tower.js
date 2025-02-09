import * as Phaser from 'phaser';
import {CannonBall, Bullet, FireProjectile } from './projectile.js'
import {random_gauss, modulo, get_removed } from './utiles.js'
import Effects from './effects.js';
const Vec = Phaser.Math.Vector2;

class Tower extends Phaser.Physics.Arcade.Sprite {
    // range is in pixels
    // fire_rate is shots per seconds
    constructor(scene, x, y, tower_type, player_id, projectile_class,
                {range=100, fire_rate=3, damage=1, pierce_count=0,
                    fire_distance=100, projectile_min_speed=0.5, projectile_no_drag_distance=80,
                    projectile_auto_aim_range=1000, projectile_auto_aim_strength=1,
                    fire_spread=0, fire_distance_spread=10, fire_velocity=10,
                    gun_scale=1, gun_center=[0.2, 0.5], base_scale=1,
                    max_turn_speed=10, passive_turn_speed=0.5,
                    target_type='Closest', stay_on_same_target=false,
                } = {}) {
        super(scene, x, y, tower_type + '_base');
        scene.add.existing(this);
        scene.physics.add.existing(this);

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
        this.projectile_class = projectile_class;
        this.playerid = player_id;

        // shooting info
        this.range = range;
        this.shoot_cooldown_value = 1 / fire_rate;
        this.damage = damage;
        this.pierce_count = pierce_count;
        this.fire_spread = fire_spread;

        // projectile info
        this.fire_distance = fire_distance;
        this.fire_distance_spread = fire_distance_spread;
        this.fire_velocity = fire_velocity;
        this.projectile_min_speed = projectile_min_speed;
        this.projectile_no_drag_distance = projectile_no_drag_distance;
        this.projectile_auto_aim_range = projectile_auto_aim_range;
        this.projectile_auto_aim_strength = projectile_auto_aim_strength;

        // shoot managing
        this.ready_to_shoot = false;
        this.shoot_cooldown = 0;
        this.time_since_attacking = 0;
        this.passive_turn_speed = passive_turn_speed;

        // gun targeting
        this.target = null;
        this.max_turn_speed = max_turn_speed; // measured in degrees
        this.target_type = target_type; // can be one of "Closest", "Furthest", "Front", "Back", "MostHealth", "LeastHealth"
        this.stay_on_same_target = stay_on_same_target; // if true will keep attacking same target even if new target appears, e.g. a new closest target

        // nearby player info
        this.nearby_radius = 35;
        this.nearby_player = null;

        // effects info
        this.effects = new Effects(scene);

    }
    game_tick(delta_time, enemies, players) {
        this.shoot_cooldown -= delta_time/this.scene.target_fps;
        this.time_since_attacking += delta_time/this.scene.target_fps;

        if (get_removed(this.target)) {
            this.check_target(enemies);
        }
        this.rotate_gun(delta_time);
        this.attack_enemies(enemies);

        this.check_nearby_player(players);

        this.effects.game_tick(delta_time, this);
    }
    check_nearby_player(players) {
        let new_nearby_player = null;
        for (let [_, player] of players) {
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
        this.scene.output_data(new_nearby_player.player_id,'This player is now in range of a tower');
        this.graphics.strokeCircle(this.x,this.y,this.range);
    }

    remove_nearby_player() {
        this.scene.output_data(this.nearby_player.player_id,'This player is no longer in range of a tower');
        this.nearby_player.has_nearby_tower = false;
        this.nearby_player = null;
        this.graphics.clear();
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
        if (enemies.length>0) {
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
                        if ((val > best_val || best_val === null) && this.get_relative_pos(enemy).length()<this.range) {
                            best_val = val;
                            this.target = enemy;
                        }
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
                return enemy.health*100000-this.get_relative_pos(enemy).length();
            case "LeastHealth":
                return -enemy.health*10000-this.get_relative_pos(enemy).length()
        }

    }

    attack_enemies(enemies) {
        if (this.ready_to_shoot && this.shoot_cooldown<0) {
            this.shoot();
            this.check_target(enemies);
            this.time_since_attacking = 0;
        }
    }
    shoot() {
        this.shoot_cooldown = this.shoot_cooldown_value;
        // create a new projectile object and add it to projectiles list
        let angle = random_gauss(this.gun.angle, this.fire_spread, this.fire_spread*3);
        let fire_distance = random_gauss(this.fire_distance, this.fire_distance_spread);
        let damage = this.damage * this.effects.get_damage_multiplier();
        let speed = this.fire_velocity * this.effects.get_speed_multiplier();
        this.scene.projectiles.push(new this.projectile_class(
            this.scene, this.x, this.y, this.tower_type.concat('_projectile'), speed, angle, 'Tower',
            {damage:damage, target:this.target, auto_aim_range:this.projectile_auto_aim_range,
                auto_aim_strength:this.projectile_auto_aim_strength,pierce_count:this.pierce_count},
            {target_distance:fire_distance, speed_min_to_kill:this.projectile_min_speed,
                no_drag_distance:this.projectile_no_drag_distance}));
    }

    rotate_gun(delta_time) {
        this.ready_to_shoot = false;
        if (!get_removed(this.target)) {
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
                this.ready_to_shoot = true;
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
        // Rotates gun slowly when not attacking
        } else if (this.time_since_attacking > 1.5) {
            this.gun.setAngle(this.gun.angle + this.passive_turn_speed);
        }
    }

    // returns the relative position from this to the passed enemy
    get_relative_pos(enemy) {
        return new Vec(enemy.x-this.x, enemy.y-this.y);
    }
}

class CannonTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall,
            {range:80, fire_distance:100, projectile_no_drag_distance:0,
                fire_rate:2});
    }
}

class LaserTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1, range:150, fire_distance:150, projectile_no_drag_distance:120,
            damage:0.5, fire_rate:20,pierce_count:100, projectile_auto_aim_strength:0,
            projectile_min_speed:1, fire_velocity:20});
    }
}

class SniperTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1.2, range:400, fire_distance:400, projectile_no_drag_distance:300,
            damage:5, fire_rate:0.5 });
    }
}

class FlamethrowerTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, FireProjectile,
            {gun_scale:0.5, range:200, fire_distance:200, projectile_no_drag_distance:50,
            damage:0.5, fire_rate:20, fire_spread:10, projectile_auto_aim_strength:0,pierce_count:3,
            projectile_min_speed:1});
    }
}

class BallistaTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, Bullet,
            {gun_scale:1.5, range:300, fire_distance:300, projectile_no_drag_distance:200,
            damage:3, fire_rate:3, pierce_count:1, fire_velocity:20,projectile_auto_aim_strength:0});
    }
}
// tesla tower/inferno style tower?

class WeakeningTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, {});
    }
}

class SlowingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, {});
    }
}

class HealingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, {});
    }
}

class BuffingTower extends Tower{
    constructor(scene, x, y, tower_type, player_id) {
        super(scene, x, y, tower_type, player_id, CannonBall, {});
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