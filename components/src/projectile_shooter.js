import * as Phaser from "phaser";
import {get_removed, modulo, random_gauss} from "./utiles.js";
const Vec = Phaser.Math.Vector2;

export default class ProjectileShooter extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, projectile_class,
                {range=100, fire_rate=3, damage=1, pierce_count=0,
                    fire_distance=100, projectile_min_speed=0.5, projectile_no_drag_distance=80,
                    projectile_auto_aim_range=1000, projectile_auto_aim_strength=1,
                    fire_spread=0, fire_distance_spread=10, fire_velocity=10,
                    max_turn_speed=10, passive_turn_speed=0.5,
                    target_type='Closest', stay_on_same_target=false,
                    projectile_spawn_location=0.8,
                } = {}) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // basic info
        this.projectile_class = projectile_class;

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
        this.projectile_spawn_location = projectile_spawn_location; // the position on the gun where a projectile is created from, float 0 to 1
        this.passive_turn_speed = passive_turn_speed;

        // gun targeting
        this.target = null;
        this.max_turn_speed = max_turn_speed; // measured in degrees
        this.target_type = target_type; // can be one of "Closest", "Furthest", "Front", "Back", "MostHealth", "LeastHealth"
        this.stay_on_same_target = stay_on_same_target; // if true will keep attacking same target even if new target appears, e.g. a new closest target
    }
    game_tick(delta_time) {
        this.shoot_cooldown -= delta_time/this.scene.target_fps;
        this.time_since_attacking += delta_time/this.scene.target_fps;
    }
    check_target(enemies) {
        if (!this.stay_on_same_target || get_removed(this.target) || get_removed(this.target.scene)) {
            this.locate_target(enemies);
        } else {
            if (this.get_relative_pos(this.target).length()>this.range){
                this.target = null;
            }
        }
    }
    locate_target(enemies) {
        this.target = null;
        if (enemies.length > 0) {
            switch (this.target_type) {
                case "Front":
                    this.target = enemies[0];
                    break;
                case "Back":
                    this.target = enemies[enemies.length - 1];
                    break;
                default:
                    let best_val = null;
                    this.target = null;
                    for (let enemy of enemies) {
                        let val = this.evaluate_enemy(enemy);
                        if ((val > best_val || best_val === null) && this.get_relative_pos(enemy).length() < this.range) {
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
    attack_enemies(enemies, effects) {
        if (this.ready_to_shoot && this.shoot_cooldown<0) {
            this.shoot(effects);
            this.shoot_cooldown = this.shoot_cooldown_value/effects.get_speed_multiplier();
            this.check_target(enemies);
            this.time_since_attacking = 0;
            return true;
        }
        return false;
    }
    shoot(effects) {
        // create a new projectile object and add it to projectiles list
        let angle = random_gauss(this.get_weapon_direction(), this.fire_spread, this.fire_spread*3);
        let fire_distance = random_gauss(this.fire_distance, this.fire_distance_spread);
        let damage = this.damage * effects.get_damage_multiplier();
        let speed = this.fire_velocity * effects.get_speed_multiplier();
        let shoot_pos = this.get_projectile_source_position();

        this.scene.projectiles.push(new this.projectile_class(
            this.scene, shoot_pos.x, shoot_pos.y, this.get_projectile_texture_name(), speed, angle, 'Tower',
            {damage:damage, target:this.target, source:this.get_projectile_source(), auto_aim_range:this.projectile_auto_aim_range,
                auto_aim_strength:this.projectile_auto_aim_strength,pierce_count:this.pierce_count},
            {target_distance:fire_distance, speed_min_to_kill:this.projectile_min_speed,
                no_drag_distance:this.projectile_no_drag_distance}));
    }
    get_projectile_source_position() {
        return new Vec(this.x + this.width*this.projectile_spawn_location*Math.cos(this.get_weapon_direction()/180*Math.PI),
            this.y + this.width*this.projectile_spawn_location*Math.sin(this.get_weapon_direction()/180*Math.PI))
    }
    get_projectile_source() {
        return this
    }
    rotate_gun(delta_time) {
        this.ready_to_shoot = false;
        if (!get_removed(this.target)) {
            // get angle towards target
            let target_angle = this.get_relative_pos(this.target).angle()*180/Math.PI;
            let current_angle = this.get_weapon_direction();

            // rotate gun - ye i dont understand this code either i kinda eyeballed the maths
            // rotates a maximum of this.max_turn_speed per tick
            let diff = target_angle-current_angle
            let dis = modulo(diff, 360);
            if (dis > 180) {
                dis = 360-dis;
            }
            if (dis < this.max_turn_speed*delta_time) {
                this.set_weapon_direction(target_angle);
                this.ready_to_shoot = true;
            } else {
                let flip;
                if (diff < 0) {
                    flip = -1
                } else {
                    flip = 1
                }
                if (diff % 360 < 180) {
                    this.set_weapon_direction(current_angle + this.max_turn_speed * delta_time * flip)
                } else {
                    this.set_weapon_direction(current_angle - this.max_turn_speed * delta_time * flip)
                }
            }
            // Rotates gun slowly when not attacking
        } else if (this.time_since_attacking > 1.5) {
            this.set_weapon_direction(this.get_weapon_direction() + this.passive_turn_speed);
        }
    }
    get_projectile_texture_name() {return ''}
    set_weapon_direction(angle) {}
    get_weapon_direction() {return 0;}
    // returns the relative position from this to the passed enemy
    get_relative_pos(enemy) {
        return new Vec(enemy.x-this.x, enemy.y-this.y);
    }
}