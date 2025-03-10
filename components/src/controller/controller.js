import * as Phaser from 'phaser';
import {RGBtoHEX } from '../utiles.js';
import Text from '../ui_widgets/text.js';
import Button from '../ui_widgets/button.js';
import Joystick from '../ui_widgets/joystick.js';
import AttackButton from "../ui_widgets/attack_button.js";
import SelectorButton from "../ui_widgets/selector_button.js";
import {Rectangle} from "../ui_widgets/shape.js";
import Player from '../player.js';
import {defined} from "../utiles.js";


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

        this.player_coins = 0;
        this.player_health = 5;
        this.player_max_health = 5
        this.player_inventory = {};

        this.current_selected_sub_menu = "Main";
        this.current_selected_tower = "CannonTower";
        this.current_selected_part_type = "All";
        this.current_selected_part = {};

        // constants
        this.tower_data = {
            "CannonTower":{title:"Cannon", description:"its a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:180},
                    {cost:5, damage:1, fire_rate:2, range:180},
                    {cost:5, damage:1, fire_rate:2, range:180},
                ]},
            "LaserTower":{title:"Laser", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:10, range:180},
                    {cost:5, damage:1, fire_rate:10, range:180},
                    {cost:5, damage:1, fire_rate:10, range:180},
                ]},
            "SniperTower":{title:"Sniper", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:380},
                    {cost:5, damage:1, fire_rate:2, range:380},
                    {cost:5, damage:1, fire_rate:2, range:380},
                ]},
            "FlamethrowerTower":{title:"Flamer", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:280},
                    {cost:5, damage:1, fire_rate:2, range:280},
                    {cost:5, damage:1, fire_rate:2, range:280},
                ]},
            "BallistaTower":{title:"Ballista", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:180},
                    {cost:5, damage:1, fire_rate:2, range:180},
                    {cost:5, damage:1, fire_rate:2, range:280},
                ]},
            "HealingTower":{title:"Healer", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "WeakeningTower":{title:"Weakener", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "SlowingTower":{title:"Slower", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "BuffingTower":{title:"Buffing", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            }
        this.parts_data = {
            "robot_body":{title:"Robot Body", description:"A standard robotic frame that gets the job done without extras.", level_stats:[
                    {health:10, speed:5},
                    {health:12, speed:7, upgrade_cost:5, upgrade_number:3},
                    {health:15, speed:10, upgrade_cost:5, upgrade_number:3},
                ]},
            "lightweight_frame":{title:"Lightweight Frame", description:"A lightweight frame built for speed at the cost of durability.", level_stats:[
                    {health:5, speed:12},
                    {health:7, speed:15, upgrade_cost:5, upgrade_number:3},
                    {health:10, speed:18, upgrade_cost:5, upgrade_number:3},
                ]},
            "tank_frame":{title:"Tank Frame", description:"A heavily armored frame designed to absorb damage and protect the player.", level_stats:[
                    {health:20, speed:2},
                    {health:25, speed:3, upgrade_cost:5, upgrade_number:3},
                    {health:30, speed:4, upgrade_cost:5, upgrade_number:3},
                ]},
            "energy_core_frame":{title:"Energy Core Frame", description:"A futuristic frame that enhances buff durations but leaves the user vulnerable to burst attacks.", level_stats:[
                    {health:8, speed:6},
                    {health:12, speed:8, upgrade_cost:5, upgrade_number:3},
                    {health:16, speed:10, upgrade_cost:5, upgrade_number:3},
                ]},

            "robot_leg":{title:"Robot Legs", description:"A basic set of robotic legs, simple and reliable.", level_stats:[
                    {health:7, speed:8},
                    {health:9, speed:10, upgrade_cost:5, upgrade_number:3},
                    {health:11, speed:12, upgrade_cost:5, upgrade_number:3},
                ]},
            "striped_leg":{title:"Striped Legs", description:"icl i think we should remove these i dont like em", level_stats:[
                    {health:7, speed:8},
                    {health:9, speed:10, upgrade_cost:5, upgrade_number:3},
                    {health:11, speed:12, upgrade_cost:5, upgrade_number:3},
                ]},
            "armored_walker":{title:"Armoured Walker", description:"Heavy armor plating makes these legs a walking fortress.", level_stats:[
                    {health:10, speed:5},
                    {health:15, speed:6, upgrade_cost:5, upgrade_number:3},
                    {health:20, speed:7, upgrade_cost:5, upgrade_number:3},
                ]},
            "light_leg":{title:"Light Legs", description:"robotic legs for quick movement but limited durability.", level_stats:[
                    {health:-2, speed:14},
                    {health:-4, speed:18, upgrade_cost:5, upgrade_number:3},
                    {health:-6, speed:22, upgrade_cost:5, upgrade_number:3},
                ]},
            "spider_leg":{title:"Spider Legs", description:"abdullah u didnt do a description for this one", level_stats:[
                    {health:5, speed:10},
                    {health:8, speed:13, upgrade_cost:5, upgrade_number:3},
                    {health:10, speed:16, upgrade_cost:5, upgrade_number:3},
                ]},

            "basic_wheel":{title:"Basic Wheel", description:"A balanced, no-frills wheel option for stable performance.", level_stats:[
                    {health:5, speed:10},
                    {health:6, speed:12, upgrade_cost:5, upgrade_number:3},
                    {health:8, speed:14, upgrade_cost:5, upgrade_number:3},
                ]},
            "speedster_wheel":{title:"Speedster Wheel", description:"High-speed wheels for those who want to outrun enemies but risk losing control.", level_stats:[
                    {health:7, speed:8},
                    {health:9, speed:10, upgrade_cost:5, upgrade_number:3},
                    {health:11, speed:12, upgrade_cost:5, upgrade_number:3},
                ]},
            "floating_wheel":{title:"Floating Wheel", description:"Hovering movement lets you glide over obstacles but makes you an easy airborne target.", level_stats:[
                    {health:-3, speed:12},
                    {health:-5, speed:15, upgrade_cost:5, upgrade_number:3},
                    {health:-7, speed:18, upgrade_cost:5, upgrade_number:3},
                ]},
            "tank_treads":{title:"Tank Treads", description:"Heavy-duty treads that offer durability at the cost of speed.", level_stats:[
                    {health:12, speed:2},
                    {health:16, speed:3, upgrade_cost:5, upgrade_number:3},
                    {health:20, speed:4, upgrade_cost:5, upgrade_number:3},
                ]},

            "pistol_weapon":{title:"Pistol Weapon", description:"A simple firearm for consistent, low-damage attacks. ", level_stats:[
                    {damage:6, fire_rate:3, fire_distance:100},
                    {damage:8, fire_rate:4, fire_distance:130, upgrade_cost:5, upgrade_number:3},
                    {damage:10, fire_rate:5, fire_distance:160, upgrade_cost:5, upgrade_number:3},
                ]},
            "plasma_blaster":{title:"Plasma Blaster", description:"A rapid-fire plasma weapon with slight knockback, ideal for keeping enemies at bay but lacks power against tougher foes.", level_stats:[
                    {damage:8, fire_rate:5, fire_distance:150},
                    {damage:12, fire_rate:6, fire_distance:180, upgrade_cost:5, upgrade_number:3},
                    {damage:16, fire_rate:8, fire_distance:210, upgrade_cost:5, upgrade_number:3},
                ]},
            "rocket_launcher":{title:"Rocket Launcher", description:"A devastating explosive launcher that clears groups of enemies but struggles against agile targets.", level_stats:[
                    {damage:25, fire_rate:1, fire_distance:300},
                    {damage:30, fire_rate:1.5, fire_distance:350, upgrade_cost:5, upgrade_number:3},
                    {damage:35, fire_rate:2, fire_distance:400, upgrade_cost:5, upgrade_number:3},
                ]},
            "tesla_rifle":{title:"Tesla Rifle", description:"Fires arcs of lightning that bounce between enemies, making it great for groups but weak against lone threats.", level_stats:[
                    {damage:10, fire_rate:8, fire_distance:140},
                    {damage:13, fire_rate:10, fire_distance:190, upgrade_cost:5, upgrade_number:3},
                    {damage:16, fire_rate:14, fire_distance:250, upgrade_cost:5, upgrade_number:3},
                ]},
            "laser_cannon":{title:"Laser Cannon", description:"A high-powered laser that delivers pinpoint accuracy but requires precise aim and resource management.", level_stats:[
                    {damage:15, fire_rate:10, fire_distance:200},
                    {damage:18, fire_rate:10, fire_distance:250, upgrade_cost:5, upgrade_number:3},
                    {damage:22, fire_rate:10, fire_distance:300, upgrade_cost:5, upgrade_number:3},
                ]},
            }
    }
    preload() {
        // player images
        // body
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');
        this.load.image('lightweight_frame','/game_images/player_sprites/bodies/robot_body.png');
        this.load.image('tank_frame','/game_images/player_sprites/bodies/tank_armor.png');
        this.load.image('energy_core_frame','/game_images/player_sprites/bodies/robot_body.png');

        // legs
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('light_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('armored_walker','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('spider_leg','/game_images/player_sprites/legs/robot_leg.png');
        this.load.image('striped_leg','/game_images/player_sprites/legs/striped_leg.png');

        // wheels
        this.load.image('basic_wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('speedster_wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('floating_wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('tank_treads','/game_images/player_sprites/legs/wheel.png');

        // weapons
        this.load.image('pistol_weapon','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('plasma_blaster','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('rocket_launcher','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('tesla_rifle','/game_images/player_sprites/weapons/pistol.png');
        this.load.image('laser_cannon','/game_images/player_sprites/weapons/pistol.png');

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
        // this.load.image('CannonTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');

        // this.load.image('LaserTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');

        // this.load.image('SniperTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');

        // this.load.image('FlamethrowerTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');

        // this.load.image('BallistaTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');

        // this.load.image('HealingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');

        // this.load.image('BuffingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BuffingTower_gun','/game_images/towers/BuffingTower_gun.png');

        // this.load.image('SlowingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SlowingTower_gun','/game_images/towers/SlowingTower_gun.png');

    }
    create() {

        window.addEventListener('resize', () => {this.create_ui()});

        if (this.mobile_device) {
            this.prompt_tap_text = this.add.text(window.innerWidth/2, window.innerHeight/2, 'Tap to Start');
            this.input.once('pointerup',function() {this.init_fullscreen()},this);
        } else {
            this.create_ui();
        }
        // setup keyboard inputs
        this.input.keyboard.on('keydown', this.key_pressed, this);
        this.input.keyboard.on('keyup', this.key_pressed, this);
    }

    update(time, delta) {
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
                this.coins_ui_text.setText('Coins: '+this.player_coins);
                break;
            case 'Set_Inventory':
                this.player_inventory = input.inventory;
                if (this.current_selected_sub_menu === "Player") {
                    this.create_ui();
                }
                break;
            case 'Set_Health':
                this.player_health = input.health;
                this.player_max_health = input.max_health;
                if (defined(this.health_ui_text)) {
                    this.health_ui_text.setText('Health: '+Math.ceil(this.player_health*10)/10+'/'+this.player_max_health);
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
            default:
                console.log('unused input received: ',input)
        }
    }
    init_fullscreen = () => {
        this.prompt_tap_text.destroy();
        this.scale.startFullscreen();
        // the function screen.orientation.lock doesnt exist sometimes
        // change this so that it works on those devices
        screen.orientation.lock('landscape').then(
            () => {
                this.create_ui();
            }
        )
        this.print('game started!')

    }
    create_ui = () => {

        this.screen_width = Math.min(window.innerWidth, this.max_screen_width);
        this.screen_height = Math.min(window.innerHeight, this.max_screen_height);
        // this.print(this.screen_width+"-"+this.screen_height);
        this.destroy_ui_list(this.ui_objects);

        this.sub_menu_container = {x:240, y:56, width:this.screen_width-480, height:this.screen_height-66}
        this.background_color = RGBtoHEX([32, 44, 49]);

        this.ui_objects = [
            // background and segmentation
            new Rectangle(this, 0, 0, this.screen_width, this.screen_height, RGBtoHEX([32, 44, 49]), {z_index:-10}),

            // 3 main tab rects
            new Rectangle(this, 10, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
            new Rectangle(this, this.screen_width-230, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
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
        this.health_ui_text = new Text(this, this.screen_width-115, 40, 'Health: '+this.player_health+'/'+this.player_max_health, {center:true}).setDepth(6);
        this.health_ui_bar = this.add.sprite(this.screen_width-218, 62, 'player_health_bar').setDepth(7).setDisplayOrigin(0,0);
        this.ui_objects.push(this.health_ui_text, this.health_ui_bar);

        // top tab buttons
        let tab_buttons = ['Main', 'Player', 'Tower'];
        let select_buttons = [];
        for (let i=0;i<tab_buttons.length;i++) {
            select_buttons.push(new Button(this, this.sub_menu_container.x+this.sub_menu_container.width/2-162+110*i, 10, {
                text:tab_buttons[i], center:false, width:104, height:40, select_tint: RGBtoHEX([160,160,160]),
                press_command:()=>this.move_sub_menu(tab_buttons[i],this.sub_menu_container)}).setDepth(4))
            if (tab_buttons[i] === this.current_selected_sub_menu) {
                select_buttons[select_buttons.length-1].force_button_press();
            }
        }
        this.prev_sub_menu = "None"
        for (let item of select_buttons) {
            item.set_select_group(select_buttons);
            this.ui_objects.push(item);
        }
    }

    move_sub_menu = (menu, container_rect) => {
        if (menu !== this.prev_sub_menu) {
            this.prev_sub_menu = menu;
            this.current_selected_sub_menu = menu;
            this.destroy_ui_list(this.sub_menu_ui_objects);
            this.destroy_ui_list(this.tower_buy_ui_objects);
            this.destroy_ui_list(this.player_parts_ui_objects);
            this.destroy_ui_list(this.browse_parts_ui_objects);
            this.destroy_ui_list(this.specific_part_ui_objects);
            switch (menu) {
                case "Player":
                    this.create_player_parts_menu(container_rect);
                    break;
                case "Tower":
                    this.create_tower_menu(container_rect);
                    break;
                default:
                    this.create_main_menu(container_rect);
                    break;
            }
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
        let towers = ["CannonTower", "LaserTower", "SniperTower", "FlamethrowerTower", "BallistaTower", "HealingTower", "SlowingTower", "BuffingTower"];
        for (let i=0;i<towers.length;i++) {
            this.sub_menu_ui_objects.push(new SelectorButton(this,
                container_rect.x+i*60+10, container_rect.y+10,
                {text:'',width:50, height:50, center:false, texture:'selector_button',
                press_command:()=>this.create_tower_buy_menu(towers[i],container_rect),
                select_tint:RGBtoHEX([200,200,200])},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                max_scroll:(towers.length*60+10)-container_rect.width,
                displayed_item:towers[i]}));
            if (this.current_selected_tower === towers[i]) {
                this.sub_menu_ui_objects[this.sub_menu_ui_objects.length-1].force_button_press();
            }
        }
        for (let item of this.sub_menu_ui_objects) {
            item.set_select_group(this.sub_menu_ui_objects);
        }
    }
    create_tower_buy_menu(tower_type, container_rect) {
        this.current_selected_tower = tower_type;
        this.destroy_ui_list(this.tower_buy_ui_objects);
        let tower_info = this.tower_data[tower_type];
        let level_info = tower_info.level_stats[0];
        let description_string = tower_info.description+"\nDamage: "+level_info.damage+"\nFire Rate: "+level_info.fire_rate+"\nRange: "+level_info.range;
        this.tower_buy_ui_objects = [
            new Rectangle(this, container_rect.x+10, container_rect.y+70, container_rect.width-20, container_rect.height-80, RGBtoHEX([96,103,109]),{rounded_corners:5}),
            new Rectangle(this, container_rect.x+15, container_rect.y+75, container_rect.width-30, container_rect.height-90, RGBtoHEX([78,87,97]),{rounded_corners:5}),

            new Text(this, container_rect.x+20, container_rect.y+75,
                tower_info.title, {center:false, text_style:{fontFamily:"Tahoma",color:'#111111',fontSize:30,fontStyle:"bold"}}),
            new Text(this, container_rect.x+20, container_rect.y+110, description_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:25,wordWrap:{width:container_rect.width-40}}}),
            new Button(this, container_rect.x+container_rect.width/2, container_rect.y+container_rect.height-40,
                {text:"Buy - "+level_info.cost, width:104, height:40,
                    press_command: ()=>this.make_tower(tower_type, "Down", level_info),
                    release_command: ()=>this.make_tower(tower_type, "Up", level_info)
                }),
        ]
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
        let listed_stats = {'health':'Health', 'speed':'Speed', 'damage':'Damage', 'fire_rate':'Fire Rate', 'fire_distance':'Range'};
        for (let stat of Object.keys(listed_stats)) {
            if (defined(item_stats[stat])) {
                description_string += '\n'+listed_stats[stat]+': '+item_stats[stat];
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
            upgrade_text = 'Upgrade - '+upgraded_stats.upgrade_cost;
            upgrade_enabled = true;
        }

        this.specific_part_ui_objects = [
            new Rectangle(this, container_rect.x+10, container_rect.y+115, container_rect.width-20, container_rect.height-125, RGBtoHEX([96,103,109]),{rounded_corners:5}),
            new Rectangle(this, container_rect.x+15, container_rect.y+120, container_rect.width-30, container_rect.height-135, RGBtoHEX([78,87,97]),{rounded_corners:5}),

            new Text(this, container_rect.x+20, container_rect.y+120,
                'Level '+this.player_inventory[item_name].level+' '+part_info.title,
                {center:false, text_style: {fontFamily:"Tahoma",color:'#111111',fontSize:30,fontStyle:"bold"}}),
            new Text(this, container_rect.x+20, container_rect.y+155, description_string, {center:false, text_style:
                    {fontFamily:"Tahoma",color:'#111111',fontSize:20,wordWrap:{width:container_rect.width-40}}}),

            new Button(this, container_rect.x+20, container_rect.y+container_rect.height-60,
                {text:button_text, width:140, height:40, texture:'equip_button', center:false,
                    press_command: ()=>this.equip_part(item_name, item_stats)}),

            new Button(this, container_rect.x+container_rect.width-160, container_rect.y+container_rect.height-60,
                {text:upgrade_text, width:140, height:40, texture:'equip_button', center:false,
                    press_command: ()=>this.upgrade_part(item_name, upgraded_stats)}).set_enabled(upgrade_enabled),

        ]
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