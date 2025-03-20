import * as Phaser from 'phaser';
import {get_tower_subclass, RGBtoHEX} from '../utiles.js';
import Text from '../ui_widgets/text.js';
import Button from '../ui_widgets/button.js';
import Joystick from '../ui_widgets/joystick.js';
import AttackButton from "../ui_widgets/attack_button.js";
import SelectorButton from "../ui_widgets/selector_button.js";
import {Rectangle} from "../ui_widgets/shape.js";
import Player from '../player.js';
import {defined} from "../utiles.js";
import {create_tower} from "../tower.js";


export default class Controller extends Phaser.Scene{
    constructor(scene_info){
        super('GameController');

        // constants
        this.output_data = scene_info.output_data_func;
        this.mobile_device = scene_info.mobile_device;
        this.max_screen_width = scene_info.max_screen_width;
        this.max_screen_height = scene_info.max_screen_height;

        // variables
        this.player_created = false;
        this.ui_active = false;

        this.player_coins = 0;
        this.player_health = 30;
        this.player_max_health = 30
        this.player_inventory = {};
        this.nearby_tower_id = null;

        this.current_selected_sub_menu = "Player";
        this.current_selected_tower = "CannonTower";
        this.current_selected_part_type = "All";
        this.current_selected_part = {};
        this.prompt_delayed_calls = 0;

        // constants
        this.tower_data = {
            "CannonTower":{title:"Cannon", description:"It's a cannon.", level_stats:[
                    {level:1, cost:5, damage:4, fire_rate:2, range:180, fire_distance:180, projectile_auto_aim_strength:10},
                    {level:2, cost:10, damage:7, fire_rate:2.2, range:200, fire_distance:200, projectile_auto_aim_strength:10},
                    {level:3, cost:15, damage:11, fire_rate:2.5, range:220, fire_distance:220, projectile_auto_aim_strength:10},
                ]},
            "SniperTower":{title:"Sniper", description:"Huge damage per shot in a large range.", level_stats:[
                    {level:1, cost:10, damage:20, fire_rate:0.5, range:320, fire_distance:320, projectile_auto_aim_strength:10},
                    {level:2, cost:15, damage:30, fire_rate:0.8, range:380, fire_distance:380, projectile_auto_aim_strength:10},
                    {level:3, cost:25, damage:40, fire_rate:1.4, range:440, fire_distance:440, projectile_auto_aim_strength:10},
                ]},
            "BallistaTower":{title:"Ballista", description:"Taken from the walls of Jerusalem.", level_stats:[
                    {level:1, cost:20, damage:6, fire_rate:1.5, range:220, fire_distance:220, pierce_count:3},
                    {level:2, cost:30, damage:12, fire_rate:2, range:250, fire_distance:250, pierce_count:5},
                    {level:3, cost:40, damage:20, fire_rate:2.5, range:280, fire_distance:280, pierce_count:8},
                ]},
            "LaserTower":{title:"Laser", description:"Take that, Caveman!", level_stats:[
                    {level:1, cost:25, damage:3, fire_rate:10, range:200, fire_distance:200},
                    {level:2, cost:40, damage:6, fire_rate:10, range:240, fire_distance:240},
                    {level:3, cost:60, damage:10, fire_rate:10, range:280, fire_distance:280},
                ]},
            "FlamethrowerTower":{title:"Flamer", description:"How's the taste of roasted goobers?", level_stats:[
                    {level:1, cost:40, damage:3, fire_rate:8, range:160, fire_distance:160},
                    {level:2, cost:50, damage:5, fire_rate:10, range:200, fire_distance:200},
                    {level:3, cost:60, damage:8, fire_rate:12, range:240, fire_distance:240},
                ]},
            "HealingTower":{title:"Healer", description:"Heal your body and soul.", level_stats:[
                    {level:1, cost:10, effect_amplifier:6, range:120},
                    {level:2, cost:20, effect_amplifier:12, range:160},
                    {level:3, cost:30, effect_amplifier:20, range:200},
                ]},
            "WeakeningTower":{title:"Weakener", description:"Steal the will of goobers.", level_stats:[
                    {level:1, cost:10, effect_amplifier:0.8, range:120},
                    {level:2, cost:15, effect_amplifier:0.8, range:160},
                    {level:3, cost:20, effect_amplifier:0.8, range:200},
                ]},
            "SlowingTower":{title:"Slower", description:"The air thickens, as if reality itself slows down.", level_stats:[
                    {level:1, cost:15, effect_amplifier:0.8,range:120},
                    {level:2, cost:20, effect_amplifier:0.65, range:160},
                    {level:3, cost:25, effect_amplifier:0.5, range:200},
                ]},
            "BuffingTower":{title:"Buffing", description:"Embrace the power and fight without fear!", level_stats:[
                    {level:1, cost:20, effect_amplifier:1.2, range:120},
                    {level:2, cost:40, effect_amplifier:1.4, range:160},
                    {level:3, cost:80, effect_amplifier:1.6, range:180},
                ]},
            }
        this.parts_data = {
            "robot_body":{title:"Robot Body", description:"A standard robotic frame that gets the job done without extras.", level_stats:[
                    {health:10, speed:5},
                    {health:15, speed:7, upgrade_cost:3, upgrade_number:1},
                    {health:20, speed:10, upgrade_cost:6, upgrade_number:2},
                ]},
            "lightweight_frame":{title:"Lightweight Frame", description:"A lightweight frame built for speed at the cost of durability.", level_stats:[
                    {health:8, speed:12},
                    {health:13, speed:15, upgrade_cost:6, upgrade_number:3},
                    {health:18, speed:18, upgrade_cost:10, upgrade_number:3},
                ]},
            "tank_frame":{title:"Tank Frame", description:"A heavily armored frame designed to absorb damage and protect the player.", level_stats:[
                    {health:20, speed:2},
                    {health:35, speed:3, upgrade_cost:8, upgrade_number:3},
                    {health:50, speed:4, upgrade_cost:12, upgrade_number:3},
                ]},
            "energy_core_frame":{title:"Energy Core Frame", description:"A futuristic frame that enhances buff durations but leaves the user vulnerable to burst attacks.", level_stats:[
                    {health:10, speed:6},
                    {health:16, speed:8, upgrade_cost:6, upgrade_number:3},
                    {health:24, speed:10, upgrade_cost:20, upgrade_number:3},
                ]},
            "titan_core":{title:"Titan Core", description:"An impenetrable core that grants immense defense but severely limits movement.", level_stats:[
                    {health:25, speed:5},
                    {health:40, speed:6, upgrade_cost:20, upgrade_number:1},
                    {health:60, speed:7, upgrade_cost:40, upgrade_number:2},
                ]},

            "robot_leg":{title:"Robot Legs", description:"A basic set of robotic legs, simple and reliable.", level_stats:[
                    {health:7, speed:8},
                    {health:12, speed:10, upgrade_cost:1, upgrade_number:1},
                    {health:17, speed:12, upgrade_cost:3, upgrade_number:2},
                ]},
            "armored_walker":{title:"Armoured Walker", description:"Heavy armor plating makes these legs a walking fortress.", level_stats:[
                    {health:14, speed:6},
                    {health:25, speed:7, upgrade_cost:8, upgrade_number:3},
                    {health:40, speed:8, upgrade_cost:12, upgrade_number:3},
                ]},
            "spider_leg":{title:"Spider Legs", description:"Spider Legs offer balanced boosts in speed and health, letting you crawl effortlessly through the battlefield.", level_stats:[
                    {health:10, speed:10},
                    {health:18, speed:13, upgrade_cost:10, upgrade_number:3},
                    {health:25, speed:16, upgrade_cost:15, upgrade_number:3},
                ]},
            "phantom_step":{title:"Phantom Step", description:"A mysterious set of legs that allows players to phase out of danger momentarily, but mistiming can leave them exposed.", level_stats:[
                    {health:12, speed:9},
                    {health:16, speed:12, upgrade_cost:15, upgrade_number:1},
                    {health:20, speed:16, upgrade_cost:20, upgrade_number:2},
                ]},

            "speedster_wheel":{title:"Speedster Wheel", description:"High-speed wheels for those who want to outrun enemies but risk losing control.", level_stats:[
                    {health:7, speed:14},
                    {health:9, speed:20, upgrade_cost:4, upgrade_number:3},
                    {health:11, speed:25, upgrade_cost:8, upgrade_number:3},
                ]},
            "floating_wheel":{title:"Floating Wheel", description:"Hovering movement lets you glide over obstacles but makes you an easy airborne target.", level_stats:[
                    {health:3, speed:14},
                    {health:5, speed:15, upgrade_cost:4, upgrade_number:3},
                    {health:7, speed:18, upgrade_cost:8, upgrade_number:3},
                ]},
            "tank_treads":{title:"Tank Treads", description:"Heavy-duty treads that offer durability at the cost of speed.", level_stats:[
                    {health:20, speed:3},
                    {health:35, speed:4, upgrade_cost:8, upgrade_number:3},
                    {health:50, speed:5, upgrade_cost:12, upgrade_number:3},
                ]},

            "pistol_weapon":{title:"Pistol Weapon", description:"A simple firearm for consistent, low-damage attacks. ", level_stats:[
                    {damage:3, fire_rate:3, fire_distance:100},
                    {damage:5, fire_rate:4, fire_distance:130, upgrade_cost:2, upgrade_number:1},
                    {damage:8, fire_rate:5, fire_distance:160, upgrade_cost:5, upgrade_number:2},
                ]},
            "plasma_blaster":{title:"Plasma Blaster", description:"A rapid-fire plasma weapon with slight knockback, ideal for keeping enemies at bay.", level_stats:[
                    {damage:6, fire_rate:5, fire_distance:150},
                    {damage:8, fire_rate:6, fire_distance:180, upgrade_cost:8, upgrade_number:3},
                    {damage:10, fire_rate:8, fire_distance:210, upgrade_cost:12, upgrade_number:3},
                ]},
            "rocket_launcher":{title:"Rocket Launcher", description:"A devastating explosive launcher that clears groups of enemies but struggles against agile targets.", level_stats:[
                    {damage:50, fire_rate:1, fire_distance:300, projectile_auto_aim_strength:10},
                    {damage:80, fire_rate:1.4, fire_distance:350, upgrade_cost:15, upgrade_number:3, projectile_auto_aim_strength:10},
                    {damage:120, fire_rate:2, fire_distance:400, upgrade_cost:20, upgrade_number:3, projectile_auto_aim_strength:10},
                ]},
            "tesla_rifle":{title:"Tesla Rifle", description:"A high-powered laser that delivers pinpoint accuracy but requires precise aim and resource management.", level_stats:[
                    {damage:6, fire_rate:10, fire_distance:240},
                    {damage:12, fire_rate:10, fire_distance:300, upgrade_cost:10, upgrade_number:3},
                    {damage:25, fire_rate:10, fire_distance:360, upgrade_cost:15, upgrade_number:3},
                ]},
            "laser_cannon":{title:"Laser Cannon", description:"Fires arcs of lightning that bounce between enemies, making it great for groups but weak on lone threats.", level_stats:[
                    {damage:6, fire_rate:10, fire_distance:200},
                    {damage:12, fire_rate:10, fire_distance:250, upgrade_cost:20, upgrade_number:3},
                    {damage:20, fire_rate:10, fire_distance:300, upgrade_cost:25, upgrade_number:3},
                ]},
            "sword_of_void":{title:"Sword of Void", description:"A void-infused blade capable of tearing through bosses, but ineffective against enemies that multiply.", level_stats:[
                    {damage:40, fire_rate:3, fire_distance:200},
                    {damage:55, fire_rate:3, fire_distance:250, upgrade_cost:30, upgrade_number:1},
                    {damage:70, fire_rate:3, fire_distance:300, upgrade_cost:40, upgrade_number:2},
                ]},
            }
    }
    preload() {
        // player images
        // body
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');
        this.load.image('lightweight_frame','/game_images/player_sprites/bodies/lightweight_frame.png');
        this.load.image('tank_frame','/game_images/player_sprites/bodies/tank_armor.png');
        this.load.image('energy_core_frame','/game_images/player_sprites/bodies/energy_core_frame.png');
        this.load.image('titan_core','/game_images/player_sprites/bodies/titan_core.png');

        // legs
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('armored_walker','/game_images/player_sprites/legs/armored_walker.png');
        this.load.image('spider_leg','/game_images/player_sprites/legs/spider_leg.png');
        this.load.image('phantom_step','/game_images/player_sprites/legs/phantom_step.png');

        // wheels
        this.load.image('speedster_wheel','/game_images/player_sprites/legs/speedster_wheel.png');
        this.load.image('floating_wheel','/game_images/player_sprites/legs/floating_wheel.png');
        this.load.image('tank_treads','/game_images/player_sprites/legs/tank_treads.png');

        // weapons
        this.load.image('pistol_weapon','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('plasma_blaster','/game_images/player_sprites/weapons/plasma_blaster.png');
        this.load.image('rocket_launcher','/game_images/player_sprites/weapons/rocket_launcher.png');
        this.load.image('tesla_rifle','/game_images/player_sprites/weapons/tesla_rifle.png');
        this.load.image('laser_cannon','/game_images/player_sprites/weapons/laser_cannon.png');
        this.load.image('sword_of_void','/game_images/player_sprites/weapons/sword_of_void.png');

        // ui images
        this.load.image('button','/game_images/UI/tab_button.png');
        this.load.image('parts_button_50px','/game_images/UI/parts_button_50px.png');
        this.load.image('parts_button_95px','/game_images/UI/parts_button_95px.png');
        this.load.image('parts_button_70px','/game_images/UI/parts_button_70px.png');
        this.load.image('parts_button_65px','/game_images/UI/parts_button_65px.png');
        this.load.image('selector_button','/game_images/UI/selector_button.png');
        this.load.image('equip_button','/game_images/UI/equip_button.png');
        this.load.image('player_health_bar','/game_images/UI/player_health_bar.png');

        this.load.image('joystick_base','/game_images/UI/joystick_base.png');
        this.load.image('joystick_head','/game_images/UI/joystick_head.png');

        this.load.image('attack_button','/game_images/UI/attack_base.png');
        this.load.image('attack_button_head','/game_images/UI/attack_head.png');

        //// Load tower images
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');
        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');
        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');
        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');

        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('BuffingTower_gun','/game_images/towers/BuffingTower_gun.png');
        this.load.image('SlowingTower_gun','/game_images/towers/SlowingTower_gun.png');

        this.load.image('EffectTower_base_1','/game_images/towers/EffectTower_base_1.png');
        this.load.image('EffectTower_base_2','/game_images/towers/EffectTower_base_2.png');
        this.load.image('EffectTower_base_3','/game_images/towers/EffectTower_base_3.png');
        this.load.image('AttackTower_base_1','/game_images/towers/AttackTower_base_1.png');
        this.load.image('AttackTower_base_2','/game_images/towers/AttackTower_base_2.png');
        this.load.image('AttackTower_base_3','/game_images/towers/AttackTower_base_3.png');

    }
    create() {
        // this.scale.setGameSize(window.innerWidth, window.innerHeight);
        
        if (this.mobile_device) {
            this.resized();
            this.init_fullscreen();
        } else {
            window.addEventListener('resize', () => {
                // this.scale.setGameSize(window.innerWidth, window.innerHeight);
                this.create_ui();
            });
            this.create_ui();
            this.ui_active = true;
            this.input.keyboard.on('keydown', this.key_pressed, this);
            this.input.keyboard.on('keyup', this.key_pressed, this);
        }
    }

    update() {
        if (!this.player_created) {
            // tell server to create a player
            this.player_username = localStorage.getItem('player_username')
            this.output_data({type: 'Constructor', username: this.player_username});
            this.player_created = true;
        }
    }

    take_input(input) {
        switch (input.type) {
            case 'Player_Constructor_Acknowledgement':
                this.player_created = true;
                break;
            case 'Set_Coins':
                this.player_coins = input.coins;
                if (this.ui_active) {
                    this.coins_ui_text.setText('Coins: '+this.player_coins);
                }
                break;
            case 'Set_Inventory':
                this.player_inventory = input.inventory;
                if (this.current_selected_sub_menu === "Player" && this.ui_active) {
                    this.create_ui();
                }
                break;
            case 'Set_Health':
                this.player_health = input.health;
                this.player_max_health = input.max_health;
                if (defined(this.health_ui_text)) {
                    this.health_ui_text.setText('Health: '+Math.round(this.player_health)+'/'+this.player_max_health);
                    this.health_ui_bar.setCrop(0,0,this.health_ui_bar.width*this.player_health/this.player_max_health, this.health_ui_bar.height);
                }
                break;
            case 'Force_Equip':
                if (Object.keys(this.parts_data).includes(input.item_name)) {
                    this.equip_part(input.item_name, this.parts_data[input.item_name].level_stats[this.player_inventory[input.item_name].level-1]);
                } else {
                    console.log('no part data found when equipping item: ', input)
                }
                break
            case 'Tower_In_Range':
                this.nearby_tower_id = input.tower_id;
                this.nearby_tower_type = input.tower_type;
                this.nearby_tower_stats = input.tower_stats;
                if (this.current_selected_sub_menu === "Upgrade" && this.ui_active) {
                    this.create_ui();
                }
                break
            case 'Tower_Out_Of_Range':
                this.nearby_tower_id = null;
                if (this.current_selected_sub_menu === "Upgrade" && this.ui_active) {
                    this.create_ui();
                }
                break
            case 'Ping_Request':
                this.output_data({type:'Ping_Response',
                    request_timestamp:input.request_timestamp,
                    response_timestamp:new Date().getTime()});
                break;
            case 'Prompt_User':
                this.create_prompt_text(input.prompt);
                break;
            default:
                console.log('unused input received: ',input)
        }
    }
    init_fullscreen = () => {
        if (this.orientation_text) {
            this.orientation_text.destroy();
            this.orientation_text = null;
        }

        this.input.once('pointerup',() => {
            this.apply_fullscreen()
        }, this)

        this.orientation_text = this.add.text(window.innerWidth/2, window.innerHeight/2,
            'Please change\nto Landscape', {
            fontSize: 35,
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(2000);
        this.orientation_text.setVisible(false);

        window.addEventListener('resize', () => this.handleOrientation());
        window.addEventListener('orientationchange', () => this.handleOrientation());

        this.handleOrientation();
    }

    handleOrientation = () => {
        // this.print(new Date().toTimeString()+' INNER width/height - '+window.innerWidth+'/'+window.innerHeight)
        setTimeout(() => {

            const isPortrait = window.innerHeight > window.innerWidth;

            if (isPortrait) {
                this.destroy_ui();
                if (this.scale.fullscreen || true) {
                    this.scale.stopFullscreen()
                }
                this.input.off('pointerup');

                if (this.orientation_text) {
                    this.orientation_text.setPosition(window.innerWidth/2, window.innerHeight/2);
                    this.orientation_text.setVisible(true);
                    this.orientation_text.setDepth(2000);
                }
            } else {
                if (this.orientation_text) {
                    this.orientation_text.setVisible(false);
                }
                if (!this.scale.fullscreen || true) {
                    this.input.once('pointerup', () => {
                        this.apply_fullscreen()
                    }, this)
                }
                this.create_ui();
            }

            this.resized();
        }, 50);
    }
    apply_fullscreen() {
        if (!this.scale.isFullscreen) {
            try {
                this.scale.startFullscreen();
            } catch {}
        }
    }

    destroy_ui = (destroy_all=true) => {
        this.ui_active = !destroy_all;
        if (destroy_all) {
            this.destroy_ui_list(this.ui_objects);
        }
        this.destroy_ui_list(this.tower_menu_ui_objects);
        this.destroy_ui_list(this.tower_buy_ui_objects);
        this.destroy_ui_list(this.upgrade_menu_ui_objects);
        this.destroy_ui_list(this.player_parts_ui_objects);
        this.destroy_ui_list(this.browse_parts_ui_objects);
        this.destroy_ui_list(this.specific_part_ui_objects);
    }

    resized = () => {
        const computeScreenSize = () => {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        };

        this.exactScreenSize = computeScreenSize();
    }

    create_ui = () => {
        this.resized();

        // this.screen_width = Math.min(this.exactScreenSize.width, this.max_screen_width);
        // this.screen_height = Math.min(this.exactScreenSize.height, this.max_screen_height);

        if (window.innerWidth > window.innerHeight) {
            this.screen_width = Math.min(window.innerWidth, this.max_screen_width);
            this.screen_height = Math.min(window.innerHeight, this.max_screen_height);
        } else {
            this.screen_width = Math.min(window.innerHeight, this.max_screen_width);
            this.screen_height = Math.min(window.innerWidth, this.max_screen_height);
        }


        // this.print(new Date().toTimeString()+' screen width/height - '+this.screen_width+'/'+this.screen_height)

        this.destroy_ui_list(this.ui_objects);

        this.sub_menu_ui_objects = [];
        const TOP_MARGIN = 10//this.mobile_device ? 50 : 10;
        this.sub_menu_container = {
            x: 240, 
            y: TOP_MARGIN + 46,
            width: this.screen_width-480, 
            height: this.screen_height-(TOP_MARGIN + 56)
        }

        this.background_color = RGBtoHEX([32, 44, 49]);

        this.ui_objects = [
            // background and segmentation
            new Rectangle(this, 0, 0, this.screen_width, this.screen_height, RGBtoHEX([32, 44, 49]), {z_index:-10}),

            // 3 main tab rects
            new Rectangle(this, 10, TOP_MARGIN, 220, this.screen_height-(TOP_MARGIN + 10), RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
            new Rectangle(this, this.screen_width-230, TOP_MARGIN, 220, this.screen_height-(TOP_MARGIN + 10), RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
            new Rectangle(this, this.sub_menu_container.x, this.sub_menu_container.y,
                this.sub_menu_container.width, this.sub_menu_container.height, RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:-1}),

            // rects to hide selector buttons
            new Rectangle(this, -10, 0, 250, this.screen_height, this.background_color, {z_index:2}),
            new Rectangle(this, this.screen_width-240, 0, 250, this.screen_height, this.background_color, {z_index:2}),

            // main joystick and attack button
            new Joystick(this, 120, this.screen_height-120, {base_size:200,
                holding_command:this.joystick_holding, release_command:this.joystick_release}).setDepth(4),
            new AttackButton(this, this.screen_width-120, this.screen_height-120, {width:200, height:200,
                joystick_base:'attack_button', joystick_head:'attack_button_head',
                holding_command:this.attack_pressed, release_command:this.attack_released}).setDepth(4),

            // Player Health bar
            new Rectangle(this, this.screen_width-220, 60, 200, 30, RGBtoHEX([20,10,10]),{rounded_corners:4}).setDepth(5),
            ]
        // money text
        this.coins_ui_text = new Text(this, 115, 40, 'Coins: '+this.player_coins, {center:true}).setDepth(4)
        this.ui_objects.push(this.coins_ui_text);

        // Player Health
        this.health_ui_text = new Text(this, this.screen_width-115, 40, 'Health: '+Math.round(this.player_health)+'/'+this.player_max_health, {center:true}).setDepth(6);
        this.health_ui_bar = this.add.sprite(this.screen_width-218, 62, 'player_health_bar').setDepth(7).setDisplayOrigin(0,0);
        this.health_ui_bar.setCrop(0,0,this.health_ui_bar.width*this.player_health/this.player_max_health, this.health_ui_bar.height)
        this.ui_objects.push(this.health_ui_text, this.health_ui_bar);

        // top tab buttons
        let tab_buttons = {'Player':'Player', 'Tower':'Tower', 'Upgrade':'Modify'};
        let select_buttons = [];
        for (let i=0;i<Object.values(tab_buttons).length;i++) {
            select_buttons.push(new Button(this, this.sub_menu_container.x+this.sub_menu_container.width/2-162+110*i, TOP_MARGIN, {
                text:Object.values(tab_buttons)[i], center:false, width:104, height:40, select_tint: RGBtoHEX([160,160,160]),
                press_command:()=>this.move_sub_menu(Object.keys(tab_buttons)[i],this.sub_menu_container)}).setDepth(4))
            if (Object.keys(tab_buttons)[i] === this.current_selected_sub_menu) {
                select_buttons[select_buttons.length-1].force_button_press();
            }
        }
        this.prev_sub_menu = "None"
        for (let item of select_buttons) {
            item.set_select_group(select_buttons);
            this.ui_objects.push(item);
        }
        this.ui_active = true;
    }

    move_sub_menu = (menu, container_rect) => {
        this.prev_sub_menu = menu;
        this.current_selected_sub_menu = menu;
        this.destroy_ui(false);
        switch (menu) {
            case "Player":
                this.create_player_parts_menu(container_rect);
                break;
            case "Tower":
                this.create_tower_menu(container_rect);
                break;
            case "Upgrade":
                this.create_tower_upgrade_menu(container_rect);
                break;
            default:
                this.create_player_parts_menu(container_rect);
                break;
        }
    }
    create_main_menu(container_rect) {
        let get_part = (inventory, type) => {
            for (let i=0;i<Object.keys(inventory).length;i++) {
                if (Object.values(inventory)[i].type === type && Object.values(inventory)[i].equipped) {
                    return Object.keys(inventory)[i];
                }
            }
        }
        this.sub_menu_ui_objects = [
            new Player(this, container_rect.x+container_rect.width/2, container_rect.y+140, 'UI_PLAYER_DISPLAY',
                {username: this.player_username, body: get_part(this.player_inventory, 'body'),
                 leg: get_part(this.player_inventory, 'leg'), weapon: get_part(this.player_inventory, 'weapon')}
            )
        ];

        this.sub_menu_ui_objects[0].setScale(3);
    }
    create_tower_menu(container_rect) {
        let towers = ["CannonTower", "SniperTower", "HealingTower", "BallistaTower", "BuffingTower", "LaserTower", "SlowingTower", "FlamethrowerTower"];
        this.tower_menu_ui_objects = [];
        for (let i=0;i<towers.length;i++) {
            this.tower_menu_ui_objects.push(new SelectorButton(this,
                container_rect.x+i*60+10, container_rect.y+10,
                {text:'',width:50, height:50, center:false, texture:'selector_button',
                press_command:()=>this.create_tower_buy_menu(towers[i],container_rect),
                select_tint:RGBtoHEX([200,200,200])},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                max_scroll:(towers.length*60+10)-container_rect.width,
                displayed_item:towers[i]}));
            if (this.current_selected_tower === towers[i]) {
                this.tower_menu_ui_objects[this.tower_menu_ui_objects.length-1].force_button_press();
            }
        }
        for (let item of this.tower_menu_ui_objects) {
            item.set_select_group(this.tower_menu_ui_objects);
        }
    }
    create_tower_buy_menu(tower_type, container_rect) {
        this.current_selected_tower = tower_type;
        this.destroy_ui_list(this.tower_buy_ui_objects);
        let tower_info = this.tower_data[tower_type];
        let level_info = tower_info.level_stats[0];
        let description_string = tower_info.description
        let stats_string = this.get_tower_stats_string(level_info, null, tower_type);
        this.tower_buy_ui_objects = [
            new Rectangle(this, container_rect.x+10, container_rect.y+70, container_rect.width-20, container_rect.height-80, RGBtoHEX([96,103,109]),{rounded_corners:5}),
            new Rectangle(this, container_rect.x+15, container_rect.y+75, container_rect.width-30, container_rect.height-90, RGBtoHEX([78,87,97]),{rounded_corners:5}),

            new Text(this, container_rect.x+22, container_rect.y+77,
                tower_info.title, {center:false, text_style:{fontFamily:"Tahoma",color:'#111111',fontSize:28,fontStyle:"bold"}}),

            new Text(this, container_rect.x+container_rect.width*0.4, container_rect.y+82, description_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:22,wordWrap:{width:container_rect.width*0.6-10}}}),
            new Text(this, container_rect.x+20, container_rect.y+110, stats_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:17,wordWrap:{width:container_rect.width/2-40}}}),

            new Button(this, container_rect.x+container_rect.width/2, container_rect.y+container_rect.height-40,
                {text:"Buy - "+level_info.cost, width:140, height:40, texture:'equip_button',
                    press_command: ()=>this.make_tower(tower_type, "Down", level_info),
                    release_command: ()=>this.make_tower(tower_type, "Up", level_info)
                }),
        ]
    }
    create_tower_upgrade_menu(container_rect) {
        this.upgrade_menu_ui_objects = [
            new Text(this, container_rect.x+container_rect.width/2, container_rect.y+25,
                "Upgrade Towers", {text_style:{fontFamily:'Tahoma',color:'#111111', fontSize:30, align:"center",fontStyle:"bold"}}),
        ]
        if (this.nearby_tower_id === null) {
            this.upgrade_menu_ui_objects.push(
                new Text(this, container_rect.x+container_rect.width/2, container_rect.y+144,
                    "You are not near any towers", {text_style:{fontFamily:'Tahoma',color:'#111111', fontSize:25, align:"center"}}))
        } else {
            let tower_info = this.tower_data[this.nearby_tower_type];
            let tower_stats = this.nearby_tower_stats;
            let maxed = (this.nearby_tower_stats.level === tower_info.level_stats.length)
            let next_level_info = null;
            let upgrade_text = "Maxed";
            let upgrade_enabled = false;
            if (!maxed) {
                next_level_info = tower_info.level_stats[this.nearby_tower_stats.level];
                upgrade_text = "Upgrade-"+next_level_info.cost;
                upgrade_enabled = true;
            }
            let sell_value = this.get_sell_value(tower_info.level_stats, this.nearby_tower_stats.level)
            let stats_string = this.get_tower_stats_string(tower_stats, next_level_info, this.nearby_tower_type);
            let display_weapon_angle = 135;
            if (get_tower_subclass(this.nearby_tower_type) == "Effect") {
                display_weapon_angle = 0;
            }

            this.upgrade_menu_ui_objects = this.upgrade_menu_ui_objects.concat([
                new Rectangle(this, container_rect.x+10, container_rect.y+55, container_rect.width-20, container_rect.height-65, RGBtoHEX([96,103,109]),{rounded_corners:5}),
                new Rectangle(this, container_rect.x+15, container_rect.y+60, container_rect.width-30, container_rect.height-75, RGBtoHEX([78,87,97]),{rounded_corners:5}),

                new Text(this, container_rect.x+20, container_rect.y+66,
                    'Level '+this.nearby_tower_stats.level+" "+tower_info.title,
                    {center:false, text_style: {fontFamily:"Tahoma",color:'#111111',fontSize:25,fontStyle:"bold"}}),

                create_tower(this.nearby_tower_type, this,
                    container_rect.x+container_rect.width-59,container_rect.y+105,
                    "UI_PLAYER_DISPLAY",this.nearby_tower_stats).setScale(2).set_weapon_direction(display_weapon_angle),

                new Button(this, container_rect.x+20, container_rect.y+container_rect.height-60,
                    {text:"Sell-"+sell_value, width:140, height:40, texture:'equip_button', center:false,
                        text_style:{fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:22},
                        press_command: ()=>this.sell_tower(this.nearby_tower_id, sell_value, "Down"),
                  }),
                new Button(this, container_rect.x+container_rect.width-160, container_rect.y+container_rect.height-60,
                    {text:upgrade_text, width:140, height:40, texture:'equip_button', center:false,
                        text_style:{fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:22},
                        press_command: ()=>this.upgrade_tower(this.nearby_tower_id, this.nearby_tower_type, next_level_info, "Down"),
                  }).set_enabled(upgrade_enabled),
            ])
            let description_object = new Text(this, container_rect.x+20, container_rect.y+96, tower_info.description, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:22,wordWrap:{width:container_rect.width-130}}})
            this.upgrade_menu_ui_objects.push(description_object)
            this.upgrade_menu_ui_objects.push(
                new Text(this, container_rect.x+20, container_rect.y+96+description_object.displayHeight,
                    stats_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:17,wordWrap:{width:container_rect.width-40}}}),
            )
        }
    }
    get_tower_stats_string(tower_stats, next_level=null, tower_type) {
        let listed_stats = {'damage':'DPS', 'pierce_count':'Piercing', 'effect_amplifier':"Healing/sec", 'range':'Range'};
        let stats_string = ""
        for (let stat of Object.keys(listed_stats)) {
            if (defined(tower_stats[stat])) {
                if (tower_type === "SlowingTower" && stat === "effect_amplifier") {
                    stats_string += 'Speed: -'+Math.round((1-tower_stats[stat])*100)+'%';
                    if (next_level !== null) {
                        stats_string += ' -> -'+Math.round((1-next_level[stat])*100)+'%'
                    }
                } else if (tower_type === "BuffingTower" && stat === "effect_amplifier") {
                    stats_string += 'Attack Speed: +'+Math.round((tower_stats[stat]-1)*100)+'%';
                    if (next_level !== null) {
                        stats_string += ' -> +'+Math.round((next_level[stat]-1)*100)+'%'
                    }
                } else if (stat === "damage") {
                    stats_string += listed_stats[stat] + ': ' + Math.round(tower_stats[stat]*tower_stats["fire_rate"]);
                    if (next_level !== null) {
                        stats_string += ' -> ' + Math.round(next_level[stat]*next_level["fire_rate"])
                    }
                } else{
                    stats_string += listed_stats[stat] + ': ' + tower_stats[stat];
                    if (next_level !== null) {
                        stats_string += ' -> ' + next_level[stat]
                    }
                }
                stats_string += '\n'
            }
        }
        return stats_string;
    }
    get_sell_value(level_stats, level) {
        let value = 0;
        for (let i = 0;i<level;i++) {
            value += level_stats[i].cost;
        }
        return Math.round(value*0.5);
    }

    create_player_parts_menu(container_rect) {
        this.player_parts_ui_objects = []
        let parts = {
            all:{name:'All', width:50}, weapon:{name:'Weapon', width:95},
            body:{name:'Body', width:70}, leg:{name:'Legs', width:65}};
        let x_pos = 10;
        let item_w;
        let menu_preloaded = false;
        for (let i=0;i<4;i++) {
            item_w = Object.values(parts)[i].width
            this.player_parts_ui_objects.push(
                new Button(this, container_rect.x+x_pos, container_rect.y+10, {
                    texture:'parts_button_'+item_w+'px', text:Object.values(parts)[i].name,
                    center:false, width:item_w, height:35,
                    select_tint: RGBtoHEX([180,180,180]),
                    text_style:{fontFamily: 'Tahoma', fontSize: 20, fontStyle: 'bold', color: '#222'},
                    press_command: ()=>this.create_browse_parts_menu(container_rect, Object.keys(parts)[i])}))
            x_pos += item_w+8;
            if (Object.keys(parts)[i] === this.current_selected_part_type) {
                this.player_parts_ui_objects[this.player_parts_ui_objects.length-1].force_button_press();
                menu_preloaded = true;
            }
        }
        for (let item of this.player_parts_ui_objects) {
            item.set_select_group(this.player_parts_ui_objects);
        }
        if (!menu_preloaded) {
            this.player_parts_ui_objects[0].force_button_press();
        }
    }
    create_browse_parts_menu(container_rect, filter=null) {
        this.current_selected_part_type = filter;
        this.destroy_ui_list(this.browse_parts_ui_objects);
        this.browse_parts_ui_objects = []
        let menu_preloaded = false;
        let items = Object.keys(this.player_inventory).filter(
            (item) => (this.player_inventory[item].type === filter || filter === null || filter === 'all'));
        for (let i=0;i<items.length;i++) {
            let num = this.player_inventory[items[i]].count;
            let display_text = num+'/0';
            let display_text_col = '#bbb';
            if (this.player_inventory[items[i]].level < this.parts_data[items[i]].level_stats.length) {
                let upgrade_number = this.parts_data[items[i]].level_stats[this.player_inventory[items[i]].level].upgrade_number;
                display_text = num+"/"+upgrade_number;
                if (num>=upgrade_number) {
                    display_text_col = '#34cc00';
                }
            }
            this.browse_parts_ui_objects.push(new SelectorButton(this,
                container_rect.x+i*60+10, container_rect.y+55,
                {text:'',width:50, height:50, center:false, texture:'selector_button',
                    press_command:()=>this.create_specific_part_menu(items[i], container_rect),
                    select_tint:RGBtoHEX([200,200,200])},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                    max_scroll:(items.length*60+10)-container_rect.width,
                    displayed_item:items[i], display_type:"part",
                    display_text:display_text, display_text_col:display_text_col}));
            if (items[i] === this.current_selected_part[this.current_selected_part_type]) {
                this.browse_parts_ui_objects[this.browse_parts_ui_objects.length-1].force_button_press();
                menu_preloaded = true;
            }
        }
        for (let item of this.browse_parts_ui_objects) {
            item.set_select_group(this.browse_parts_ui_objects);
        }
        if (this.browse_parts_ui_objects.length === 0) {
            this.destroy_ui_list(this.specific_part_ui_objects);
            this.specific_part_ui_objects = [
                new Text(this, container_rect.x+container_rect.width/2, container_rect.y+144,
                    "You have no parts\nof this type.", {text_style:{fontFamily:'Tahoma',color:'#111111', fontSize:25, align:"center"}})]
        } else if (!menu_preloaded) {
            this.browse_parts_ui_objects[0].force_button_press();
        }
    }
    create_specific_part_menu(item_name, container_rect) {
        this.current_selected_part[this.current_selected_part_type] = item_name;
        this.destroy_ui_list(this.specific_part_ui_objects);
        let part_info = this.parts_data[item_name];

        let item_stats = this.parts_data[item_name].level_stats[this.player_inventory[item_name].level-1];

        let description_string = part_info.description;
        let listed_stats = {'health':'Health', 'speed':'Speed', 'damage':'Damage', 'fire_distance':'Range'};
        let stats_string = ""
        for (let stat of Object.keys(listed_stats)) {
            if (defined(item_stats[stat])) {
                if (stat === "damage") {
                    stats_string += 'DPS: '+Math.round(item_stats[stat]*item_stats["fire_rate"])+'\n';
                } else {
                    stats_string += listed_stats[stat]+': '+item_stats[stat]+'\n';
                }
            }
        }
        let button_text;
        if (this.player_inventory[item_name].equipped) {
            button_text = "Equipped";
        } else {
            button_text = "Equip";
        }
        let upgrade_text = 'Maxed';
        let upgraded_stats;
        let upgrade_enabled = false;
        if (this.player_inventory[item_name].level<this.parts_data[item_name].level_stats.length) {
            upgraded_stats = this.parts_data[item_name].level_stats[this.player_inventory[item_name].level]
            upgrade_text = 'Upgrade-'+upgraded_stats.upgrade_cost;
            upgrade_enabled = true;
        }

        this.specific_part_ui_objects = [
            new Rectangle(this, container_rect.x+10, container_rect.y+115, container_rect.width-20, container_rect.height-125, RGBtoHEX([96,103,109]),{rounded_corners:5}),
            new Rectangle(this, container_rect.x+15, container_rect.y+120, container_rect.width-30, container_rect.height-135, RGBtoHEX([78,87,97]),{rounded_corners:5}),

            new Text(this, container_rect.x+20, container_rect.y+120, part_info.title,
                {center:false, text_style: {fontFamily:"Tahoma",color:'#111111',fontSize:25,fontStyle:"bold"}}),
            new Text(this, container_rect.x+20, container_rect.y+150, 'Level '+this.player_inventory[item_name].level,
                {center:false, text_style: {fontFamily:"Tahoma",color:'#0a0a0a',fontSize:22,fontStyle:"bold"}}),

            new Text(this, container_rect.x+container_rect.width*0.4, container_rect.y+155, description_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:17,wordWrap:{width:container_rect.width*0.6-10}}}),

            new Text(this, container_rect.x+20, container_rect.y+180, stats_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:17,wordWrap:{width:container_rect.width/2-40}}}),

            new Button(this, container_rect.x+20, container_rect.y+container_rect.height-60,
                {text:button_text, width:140, height:40, texture:'equip_button', center:false,
                    text_style:{fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:22},
                    press_command: ()=>this.equip_part(item_name, item_stats)}),

            new Button(this, container_rect.x+container_rect.width-160, container_rect.y+container_rect.height-60,
                {text:upgrade_text, width:140, height:40, texture:'equip_button', center:false,
                    text_style:{fontFamily:'Tahoma', fontStyle:'bold', color:'#333', fontSize:22},
                    press_command: ()=>this.upgrade_part(item_name, upgraded_stats)}).set_enabled(upgrade_enabled),

        ]
    }
    create_prompt_text(text) {
        if (defined(this.prompt_text_obj)) {
            this.prompt_text_obj.destroy();
            this.prompt_backing_rect.destroy();
        }
        this.prompt_text_obj = this.add.text(this.screen_width/2, this.screen_height/2, text,
            {fontSize: 20, fontFamily:"Tahoma", fontStyle:"bold",align:"center",
                color:'#b11', wordWrap:{width:200}})
        this.prompt_backing_rect = new Rectangle(
            this, this.prompt_text_obj.x-10-this.prompt_text_obj.width/2,
            this.prompt_text_obj.y-10-this.prompt_text_obj.height/2,
            this.prompt_text_obj.width+20, this.prompt_text_obj.height+20,
            RGBtoHEX([30,10,10]),{rounded_corners:10}).setDepth(10)
        this.prompt_text_obj.setOrigin(0.5,0.5).setDepth(10.1);
        this.prompt_delayed_calls += 1;
        this.time.delayedCall(3000, () => {
            this.prompt_delayed_calls -= 1;
            if (this.prompt_delayed_calls === 0) {
                this.prompt_text_obj.destroy()
                this.prompt_backing_rect.destroy()
            }
        }, [], this);
    }

    destroy_ui_list(ui_list) {
        if (typeof(ui_list) !== 'undefined') {
            for (let obj of ui_list) {
                obj.destroy();
            }
            while (ui_list.length>0) {
                ui_list.pop();
            }
        }
    }

    key_pressed = (event) => {
        const press = (button, type) => {
            let direction = "Down";
            if (type === 'keyup') {
                direction = "Up"
            }
            this.output_data({type:'Key_Input', Key: button, Direction: direction});
        }
        switch (event.key) {
            case "w" :
            case "ArrowUp":
                press("Up", event.type);
                break;
            case "s" :
            case "ArrowDown":
                press("Down", event.type);
                break;
            case "a" :
            case "ArrowLeft":
                press("Left", event.type);
                break;
            case "d" :
            case "ArrowRight":
                press("Right", event.type);
                break;
            case " ":
                if (event.type === "keydown") {
                    this.attack_pressed(true);
                } else {
                    this.attack_released();
                }
                break;
        }
    }
    make_tower = (tower, direction, tower_stats) => {
        this.output_data({type:'Create_Tower', Tower: tower, Direction: direction, Tower_Stats:tower_stats})
    }
    upgrade_tower = (tower_id, tower_type, tower_stats, direction) => {
        this.output_data({type:'Upgrade_Tower', tower_id: tower_id, tower_type: tower_type, tower_stats: tower_stats, Direction: direction});
    }
    sell_tower = (tower_id, sell_value, direction) => {
        this.output_data({type:'Sell_Tower', tower_id: tower_id, sell_value:sell_value, Direction: direction});
    }
    equip_part = (item_name, item_stats) => {
        this.output_data({type:'Equip_Part', item_name: item_name, item_stats: item_stats});
    }
    upgrade_part = (item_name, item_stats) => {
        this.output_data({type:'Upgrade_Part', item_name:item_name, item_stats: item_stats})
    }
    joystick_holding = (x,y) => {
        this.output_data({type:'Joystick_Input', x:x, y:y, Direction: 'Down'});
    }
    joystick_release = () => {
        this.output_data({type:'Joystick_Input', Direction: 'Up'});
    }
    print = (text) => {
        this.output_data({type:'Print', text: text});
    }
    attack_pressed = (auto_target, angle=90) => {
        this.output_data({type:'Attack_Input', Direction:'Down', Auto_Target:auto_target, Angle:angle});
    }
    attack_released = () => {
        this.output_data({type:'Attack_Input', Direction:'Up'});
    }

}