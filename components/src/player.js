import * as Phaser from 'phaser';
import {create_tower } from './tower.js';
import {RobotBody, LightweightFrame, TankFrame, EnergyCoreFrame, TitanCore} from './components/body.js';
import {RobotLeg, ArmoredWalker, SpiderLeg, PhantomStep} from './components/leg.js';
import {SpeedsterWheel, FloatingWheel, TankTreads } from './components/wheel.js';
import {
    PistolWeapon,
    PlasmaBlaster,
    RocketLauncher,
    TeslaRifle,
    LaserCannon,
    SwordOfVoid
} from './components/weapon.js';
import Effects from './effects.js';
import {get_item_type, defined, RGBtoHEX, clamp, random_range} from "./utiles.js";
import {PartStatsManager} from "./components/part_stat_manager.js";
import {Rectangle} from "./ui_widgets/shape.js";
import HealthBar from "./health_bar.js";
import {PlayerDamagedParticle} from "./particle.js";

const Vec = Phaser.Math.Vector2;

const part_converter = {
    'robot_leg':RobotLeg,
    'armored_walker':ArmoredWalker,
    'spider_leg':SpiderLeg,
    'phantom_step':PhantomStep,

    'speedster_wheel':SpeedsterWheel,
    'floating_wheel':FloatingWheel,
    'tank_treads':TankTreads,

    'robot_body':RobotBody,
    'lightweight_frame':LightweightFrame,
    'tank_frame':TankFrame,
    'energy_core_frame':EnergyCoreFrame,
    'titan_core':TitanCore,

    'pistol_weapon':PistolWeapon,
    'plasma_blaster': PlasmaBlaster,
    'rocket_launcher': RocketLauncher,
    'tesla_rifle': TeslaRifle,
    'laser_cannon': LaserCannon,
    'sword_of_void':SwordOfVoid,
}

export default class Player extends Phaser.GameObjects.Container{
    constructor(scene, x, y, player_id, {body='robot_body', leg='robot_leg', weapon='pistol_weapon', username='Player'}={}){

        // create phaser stuff
        super(scene, x, y, []);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(4);

        // create username
        this.username = username;
        this.name_text = new Phaser.GameObjects.Text(scene, 0, -20, this.username,
            {fontFamily:'Tahoma',color:'#000000', fontSize:18, align:"center", padding:2,
            }).setOrigin(0.5, 0.5).setDepth(8);
        this.add(this.name_text);
        if (player_id !== "UI_PLAYER_DISPLAY") {
            this.name_backing = new Rectangle(scene,
                this.name_text.x-this.name_text.width/2, this.name_text.y-this.name_text.height/2+3,
                this.name_text.width, this.name_text.height-6, RGBtoHEX([255,255,255]),{z_index:7, alpha:0.2});
            this.add(this.name_backing);
        }

        this.health_bar = new HealthBar(
            scene, 'enemy_health_bar_back', 'enemy_health_bar',
            0, 0, 0, 30);
        this.add(this.health_bar)

        // game stats
        this.coins = 0;
        this.player_score = 0;
        this.towers_placed = 0;
        this.kill_count = 0;
        this.damage_dealt = 0;
        this.damage_taken = 0;
        this.health_healed = 0;
        this.coins_spent = 0;
        this.shots_fired = 0;
        this.death_count = 0;
        this.inventory = {};
      
        // constants
        this.speed = 0.4;
        this.knockback_resistance = 2;
        this.drag = 0.9;
        this.player_id = player_id;
        this.pickup_range = 20;

        // aliveness
        this.health = 30;
        this.max_health = this.health;
        this.passive_healing_timer = 1;
        this.passive_healing_hit_timer = 3;
        this.passive_healing_rate = 1;
        this.dead = false;


        // assign body parts
        this.part_stat_manager = new PartStatsManager();
        for (let item of [body, weapon, leg]) {
            this.add_to_inventory(item);
            if (this.player_id === 'UI_PLAYER_DISPLAY' || this.player_id === 'TempPlayerID') {
                this.equip_part(item);
            } else {
                this.scene.output_data(this.player_id, {type:'Force_Equip', item_name:item});
            }
        }

        // variables
        this.velocity = new Vec(0,0);
        this.key_inputs = {
            Up: 0,
            Down: 0,
            Left: 0,
            Right: 0,
            Attack: 0,
        }
        this.move_direction = new Vec(0,0);
        this.prev_tower_button_direction = 'Up';
        this.joystick_down = false;
        this.joystick_direction = new Vec(0,0);

        this.has_nearby_tower = false;
        this.nearby_tower_id = null;
        this.tower_nearby_radius = 35;

        // effects info
        this.effects = new Effects(scene);
        this.last_damage_source = null;

        // ping checker
        this.ping = 0;
        this.time_since_last_ping_request = 0;
        this.ping_request_timer = 0;
        this.ping_request_cooldown = 5;
        this.has_outgoing_ping_request = false;

        this.refresh_health_bar();

    }
    game_tick(delta_time, enemies){ //function run by game.js every game tick
        this.manage_ping(delta_time);
        if (!this.dead) {
            this.passive_healing_timer -= delta_time/this.scene.target_fps;
            if (this.passive_healing_timer < 0) {
                this.add_health(this.passive_healing_rate*delta_time/this.scene.target_fps);
            }

            // check nearby towers
            this.check_nearby_tower(this.scene.towers);

            // handle effects
            this.add_health(this.effects.get_effect("Healing", 0)*delta_time/this.scene.target_fps);
            this.take_damage(this.effects.get_effect("Burning", 0)*delta_time/this.scene.target_fps);
            this.effects.game_tick(delta_time, this);

            // physics + movement
            if (this.joystick_down) {
                this.move_direction = new Vec().copy(this.joystick_direction);
            } else {
                this.move_direction = new Vec(this.key_inputs.Right-this.key_inputs.Left,
                    this.key_inputs.Down-this.key_inputs.Up)
                this.move_direction.normalize();
            }

            this.move_direction.scale(this.speed * delta_time);

            if (this.username === "chris" || true) {
                this.velocity.add(this.move_direction);
                this.velocity.x *= this.drag**delta_time;
                this.velocity.y *= this.drag**delta_time;
            } else {
                this.velocity = this.move_direction.clone().setLength(this.move_direction.length()*5)
            }

            this.body.position.x += this.velocity.x*delta_time;
            this.body.position.y += this.velocity.y*delta_time;
            this.keep_in_map();

            // part management
            if (defined(this.leg_object)) {
                this.leg_object.movement_animation(this.velocity);
            }
            if (defined(this.body_object)) {
                this.body_object.movement_animation(this.velocity);
            }
            if (defined(this.weapon_object)) {
                if (this.key_inputs.Attack) {
                    this.weapon_object.attack_button_down(delta_time, enemies, this.effects);
                } else {
                    this.weapon_object.attack_button_up();
                }
                this.weapon_object.game_tick(delta_time);
            }
        }
    }
    set_body(body, stats={}) {
        this.remove(this.body_object,true);
        this.body_name = body;
        this.body_object = new part_converter[body](this.scene, stats);
        this.add(this.body_object);
        this.refresh_player_parts();
    }
    set_leg(leg, stats={}) {
        this.remove(this.leg_object,true);
        this.leg_name = leg;
        this.leg_object = new part_converter[leg](this.scene, stats);
        this.add(this.leg_object);
        this.refresh_player_parts();
    }
    set_weapon(weapon, stats={}) {
        let prev_angle
        if (typeof(this.weapon_object) !== "undefined") {
            prev_angle = this.weapon_object.get_weapon_direction();
        } else {
            prev_angle = 40;
        }
        this.remove(this.weapon_object,true);
        this.weapon_name = weapon;
        this.weapon_object = new part_converter[weapon](this.scene, stats);
        this.weapon_object.set_weapon_direction(prev_angle);
        this.add(this.weapon_object);
        this.refresh_player_parts();
    }
    refresh_player_parts(){
        if (defined(this.body_object) && defined(this.weapon_object) && defined(this.leg_object)) {
            this.bringToTop(this.weapon_object);
            this.sendToBack(this.leg_object);
            this.bringToTop(this.name_text);
            this.weapon_object.set_scale(this.body_object.get_scale_multiplier());
            this.leg_object.set_scale(this.body_object.get_scale_multiplier());
            this.body.setCircle(this.body_object.body_height/2,-this.body_object.body_height/2,-this.body_object.body_height/2);
            this.refresh_stats();
            this.refresh_health_bar();
        }
    }
    refresh_health_bar() {
        this.health_bar.set_health(this.health, this.max_health);

        this.bringToTop(this.health_bar);
        let health_bar_offset = 0;
        if (this.health_bar.visible) {
            health_bar_offset = this.health_bar.bar_back.displayHeight+5
        }
        if (defined(this.name_backing) && defined(this.body_object)) {
            this.health_bar.set_parent_width(this.body_object.displayWidth*1.5);
            this.health_bar.setPosition(0, -this.body_object.displayHeight/2-4-this.health_bar.bar_back.displayHeight/2)
            this.name_text.setPosition(0, -this.body_object.displayHeight/2-13-health_bar_offset);
            this.name_backing.setPosition(this.name_text.x, this.name_text.y+this.name_text.displayHeight-5)
        }
    }
    refresh_stats() {
        this.part_stat_manager.set_parts(this.leg_object, this.body_object, this.weapon_object);
        this.set_health(this.health, this.part_stat_manager.get_health())
        this.speed = this.part_stat_manager.get_speed();
        this.passive_healing_rate = this.part_stat_manager.get_passive_healing_rate();
    }

    get_dead() {
        return (this.health<=0)
    }
    die() {
        this.death_count += 1;
        this.dead = true;
        this.visible = false;
        this.health = 0;
        this.effects.clear_effects();
        this.set_coins(0);
    }
    respawn() {
        if (this.dead) {
            this.dead = false;
            this.visible = true;
            // this.health = this.max_health;
            this.set_health(this.max_health, this.max_health);
        }

    }
    take_damage(damage, speed, angle, knockback, source) {
        if (damage !== 0) {
            this.passive_healing_timer = this.passive_healing_hit_timer;
            this.add_health(-damage)
            this.make_hit_particles(Math.ceil(2*(damage**0.5-1)), speed, angle);
            this.velocity.add(new Vec().setToPolar(angle, knockback*this.knockback_resistance));
            if (source !== null) {
                this.last_damage_source = source;
            }
        }
    }
    make_hit_particles = (num_particles, speed=4, angle=null) => {
        speed = clamp(speed, 4, 100);
        while (num_particles > 0) {
            if (Math.random() < num_particles) {
                let particle_angle = angle;
                if (particle_angle == null) {
                    particle_angle = random_range(-Math.PI,Math.PI);
                }
                this.scene.particles.push(new PlayerDamagedParticle(this.scene, this.x, this.y,
                    speed, particle_angle * 180 / Math.PI));
            }
            num_particles -= 1;
        }
    }
    get_kill_credit(enemy) {
        if (!this.dead) {
            this.scene.score += enemy.coin_value;
            this.kill_count += 1;
            this.player_score += enemy.coin_value;
            for (let player of Object.values(this.scene.players)) {
                player.set_coins(player.coins+enemy.coin_value);
            }
        }
    }
    keep_in_map() {
        if (this.body.x < 0) {
            this.body.position.x = 0
        } else if (this.body.x+this.body.width > this.scene.level.displayWidth) {
            this.body.position.x = this.scene.level.displayWidth-this.body.width
        }
        if (this.body.y < 0) {
            this.body.position.y = 0
        } else if (this.body.y+this.body.height > this.scene.level.displayHeight) {
            this.body.position.y = this.scene.level.displayHeight-this.body.height
        }
    }
    manage_ping(delta_time) {
        this.ping_request_timer -= delta_time/this.scene.target_fps;
        this.time_since_last_ping_request += delta_time/this.scene.target_fps;
        if (this.ping_request_timer < 0 && !this.has_outgoing_ping_request) {
            this.ping_request_timer = this.ping_request_cooldown;

            this.has_outgoing_ping_request = true;
            this.time_since_last_ping_request = 0;
            this.scene.output_data(this.player_id, {type:'Ping_Request', request_timestamp:new Date().getTime()})
        } else if (this.has_outgoing_ping_request && this.time_since_last_ping_request*1000 > this.ping) {
            this.ping = Math.round(this.time_since_last_ping_request*1000);
            this.scene.level.player_info_display.update_list_text()
        }
    }
    receive_ping_reply(data) {
        this.has_outgoing_ping_request = false;
        this.ping = (new Date().getTime()) - data.request_timestamp;
        this.scene.level.player_info_display.update_list_text()
    }
    key_input(data) {
        if (data.Direction === 'Down') {
            this.key_inputs[data.Key] = 1;
        } else {
            this.key_inputs[data.Key] = 0;
        }
    }
    joystick_input(data) {
        if (data.Direction === 'Down') {
            this.joystick_down = true;
            this.joystick_direction.x = data.x;
            this.joystick_direction.y = data.y;
        } else {
            this.joystick_down = false;
        }
    }
    attack_input(data) {
        if (data.Direction === 'Down') {
            this.key_inputs.Attack = 1;
            if (data.Auto_Target === true) {
                this.weapon_object.auto_target = true;
            } else {
                this.weapon_object.auto_target = false;
                this.weapon_object.set_weapon_direction(data.Angle);
            }
        } else {
            this.key_inputs.Attack = 0;
        }
    }
    new_tower_input(data) {
        if (!this.dead) {
            let new_tower = null;
            if (data.Direction === 'Down' && this.prev_tower_button_direction === 'Up') {
                if (data.Tower_Stats.cost <= this.coins) {
                    if (!this.scene.level.check_path_collision(this.x, this.y, 30)) {
                        new_tower = create_tower(data.Tower, this.scene, this.x, this.y, this.player_id, data.Tower_Stats);
                        if (new_tower.get_overlap_other_towers()) {
                            new_tower.destroy()
                            new_tower = null
                            this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You can't place towers on top of each other!"})
                        } else {
                            // buy the tower
                            this.set_coins(this.coins - data.Tower_Stats.cost);
                            this.towers_placed += 1;
                        }
                    } else {
                        this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You can't place a tower on the path!"})
                    }
                } else {
                    this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You can't afford this tower!"})
                }
            }
            this.prev_tower_button_direction = data.Direction;
            if (new_tower != null) {
                this.scene.towers[new_tower.tower_id] = new_tower;
            }
        }
    }
    sell_tower_input(data) {
        for (let player of Object.values(this.scene.players)) {
            if (player.nearby_tower_id === data.tower_id) {
                player.remove_nearby_tower(this.scene.towers);
            }
        }
        this.scene.towers[data.tower_id].destroy()
        delete this.scene.towers[data.tower_id];
        this.set_coins(this.coins + data.sell_value);
    }
    upgrade_tower_input(data) {
        if (data.tower_stats.cost <= this.coins) {
            this.set_coins(this.coins - data.tower_stats.cost);
            this.scene.towers[data.tower_id].upgrade(data.tower_stats);
            for (let player of Object.values(this.scene.players)) {
                if (player.nearby_tower_id === data.tower_id) {
                    player.set_new_nearby_tower(data.tower_id, this.scene.towers);
                }
            }
        } else {
            this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You can't afford this upgrade!"})
        }
    }
    check_nearby_tower(towers) {
        let new_nearby_tower_id = null;
        let min_distance = this.tower_nearby_radius;
        for (let tower of Object.values(towers)) {
            let distance = new Vec(tower.x-this.x, tower.y-this.y);
            distance = distance.length();
            if (distance < min_distance) {
                new_nearby_tower_id = tower.tower_id;
                min_distance = distance;
            }
        }
        if (new_nearby_tower_id === null) {
            if (this.has_nearby_tower) {
                this.remove_nearby_tower(towers)
            }
        } else {
            if (this.has_nearby_tower) {
                if (this.nearby_tower_id !== new_nearby_tower_id) {
                    this.set_new_nearby_tower(new_nearby_tower_id, towers);
                }
            } else {
                this.set_new_nearby_tower(new_nearby_tower_id, towers);
            }
        }
    }
    set_new_nearby_tower(new_nearby_tower_id, towers) {
        if (this.nearby_tower_id !== null) {
            towers[this.nearby_tower_id].remove_nearby_player(this);
        }
        this.has_nearby_tower = true;
        this.nearby_tower_id = new_nearby_tower_id;
        if (this.nearby_tower_id !== null) {
            towers[this.nearby_tower_id].add_nearby_player(this);
            this.scene.output_data(this.player_id,
                {type:'Tower_In_Range', tower_id:this.nearby_tower_id,
                    tower_type: towers[this.nearby_tower_id].tower_type,
                    tower_stats: towers[this.nearby_tower_id].tower_stats});
        }
    }
    remove_nearby_tower(towers) {
        if (this.nearby_tower_id !== null) {
            towers[this.nearby_tower_id].remove_nearby_player(this);
            this.scene.output_data(this.player_id, {type:'Tower_Out_Of_Range', tower_id:this.nearby_tower_id});
        }
        this.has_nearby_tower = false;
        this.nearby_tower_id = null;
    }


    pickup_item(dropped_item) {
        this.add_to_inventory(dropped_item);
        this.items_picked_up += 1;
        // this.set_part(dropped_item.item_name, dropped_item.item_type);
    }
    set_part(item_name, item_type, stats={}) {
        switch (item_type) {
            case 'leg':
                this.set_leg(item_name, stats);
                break;
            case 'body':
                this.set_body(item_name, stats);
                break;
            case 'weapon':
                this.set_weapon(item_name, stats);
                break;
        }
    }
    set_coins(coins) {
        if (coins < this.coins) {
            this.coins_spent += this.coins-coins;
        }
        this.coins = coins;
        this.scene.output_data(this.player_id,{type: 'Set_Coins', coins: this.coins});
        this.scene.level.player_info_display.update_list_text()
    }
    set_health(health, max_health) {
        health = clamp(health, 0, max_health);
        if (health !== this.health || max_health !== this.max_health) {
            if (max_health === this.max_health) {
                if (health < this.health) {
                    this.damage_taken += this.health-health;
                } else {
                    this.health_healed += health-this.health;
                }
            }
            this.health = health;
            this.max_health = max_health;
            this.refresh_health_bar()
            if (this.player_id !== 'UI_PLAYER_DISPLAY') {
                this.scene.output_data(this.player_id, {
                    type: 'Set_Health',
                    health: this.health,
                    max_health: this.max_health
                });
                this.scene.level.player_info_display.update_list_text()
            }
        }
    }
    add_health(health_change) {
        this.set_health(this.health+health_change, this.max_health);
    }
    save_inventory() {
        if (this.player_id !== 'UI_PLAYER_DISPLAY') {
            this.scene.output_data(this.player_id, {type: 'Set_Inventory', inventory: this.inventory});
        }
    }
    add_to_inventory(item) {
        // item can be DroppedItem object, or a string of the item name
        if (typeof(item) === 'string') {
            item = {item_name:item, item_type: get_item_type(item)}
        }
        if (Object.keys(this.inventory).includes(item.item_name)) {
            this.inventory[item.item_name].count += 1;
        } else {
            this.inventory[item.item_name] = {count: 1, level:1, equipped: false, type: item.item_type};
        }
        this.save_inventory()
        if (this.player_id === "TempPlayerID") {
            this.equip_part(item.item_name, {health:1000, speed: 10, damage:1000, target_distance:300})
        }
    }
    equip_part(item_name, stats) {
        if (Object.keys(this.inventory).includes(item_name)) {
            this.set_part(item_name, this.inventory[item_name].type, stats);
            for (let key of Object.keys(this.inventory)) {
                if (this.inventory[key].type === this.inventory[item_name].type) {
                    this.inventory[key].equipped = false;
                }
            }
            this.inventory[item_name].equipped = true;
            this.save_inventory();
        }
    }
    upgrade_part(item_name, new_stats) {
        if (Object.keys(this.inventory).includes(item_name)) {
            if (this.inventory[item_name].count >= new_stats.upgrade_number) {
                if (this.coins >= new_stats.upgrade_cost) {
                    this.inventory[item_name].count -= new_stats.upgrade_number;
                    this.inventory[item_name].level += 1;
                    this.set_coins(this.coins - new_stats.upgrade_cost)
                    if (this.inventory[item_name].equipped) {
                        this.equip_part(item_name, new_stats);
                    } else {
                        this.save_inventory();
                    }
                } else {
                    this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You can't afford this upgrade!"})
                }
            } else {
                let diff = new_stats.upgrade_number - this.inventory[item_name].count
                let item_output = item_name.replace("_", " ")
                if (diff > 1) {
                    item_output += "'s"
                }
                this.scene.output_data(this.player_id,{type:'Prompt_User',prompt:"You need "+diff+" more "+item_output+" for this upgrade!"})
            }
        }
    }
    destroy(fromScene) {
        this.removeAll(true);
        super.destroy(fromScene);
    }
}