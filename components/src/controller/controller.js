import * as Phaser from 'phaser';
import {RGBtoHEX } from '../utiles.js';
import Text from '../ui_widgets/text.js';
import Button from '../ui_widgets/button.js';
import Joystick from '../ui_widgets/joystick.js';
import AttackButton from "../ui_widgets/attack_button.js";
import SelectorButton from "../ui_widgets/selector_button.js";
import {Rectangle} from "../ui_widgets/shape.js";
import Player from '../player.js';


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
        this.player_inventory = {'default_body':{type:'body'}};

        // constants
        this.tower_data = {
            "CannonTower":{title:"Cannon", description:"its a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "LaserTower":{title:"Laser", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "SniperTower":{title:"Sniper", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "FlamethrowerTower":{title:"Flamer", description:"its not a cannon", level_stats:[
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                    {cost:5, damage:1, fire_rate:2, range:80},
                ]},
            "BallistaTower":{title:"Ballista", description:"its not a cannon", level_stats:[
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
            "default_body":{title:"Default Body", description:"this is some text", level_stats:[
                    {}

                ]},
            }
    }
    preload() {
        // player images
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');

        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png')
        this.load.image('striped_leg','/game_images/player_sprites/legs/striped_leg.png')
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');

        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');
        this.load.image('pistol_weapon','/game_images/player_sprites/weapons/pistol.png');

        // ui images
        this.load.image('button','/game_images/UI/tab_button.png');
        this.load.image('parts_button_50px','/game_images/UI/parts_button_50px.png');
        this.load.image('parts_button_95px','/game_images/UI/parts_button_95px.png');
        this.load.image('parts_button_70px','/game_images/UI/parts_button_70px.png');
        this.load.image('parts_button_65px','/game_images/UI/parts_button_65px.png');
        this.load.image('selector_button','/game_images/UI/selector_button.png');

        this.load.image('joystick_base','/game_images/UI/joystick_base.png');
        this.load.image('joystick_head','/game_images/UI/joystick_head.png');

        this.load.image('attack_button','/game_images/UI/attack_base.png');
        this.load.image('attack_button_head','/game_images/UI/attack_head.png');

        //// Load tower images
        this.load.image('CannonTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');

        this.load.image('LaserTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');

        this.load.image('SniperTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');

        this.load.image('FlamethrowerTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');

        this.load.image('BallistaTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');

        this.load.image('HealingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');

        this.load.image('BuffingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BuffingTower_gun','/game_images/towers/HealingTower_gun.png');

        this.load.image('SlowingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SlowingTower_gun','/game_images/towers/HealingTower_gun.png');

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
            this.output_data({type: 'Constructor'});
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
                break;
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
        this.print(this.screen_width+"-"+this.screen_height);
        this.destroy_ui_list(this.ui_objects);

        this.sub_menu_ui_objects = [];
        this.sub_menu_container = {x:240, y:56, width:this.screen_width-480, height:this.screen_height-66}
        this.background_color = RGBtoHEX([32, 44, 49]);

        this.ui_objects = [
            // background and segmentation
            new Rectangle(this, 0, 0, this.screen_width, this.screen_height, RGBtoHEX([32, 44, 49])),

            // 3 main tab rects
            new Rectangle(this, 10, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
            new Rectangle(this, this.screen_width-230, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), {rounded_corners:10, z_index:3}),
            new Rectangle(this, this.sub_menu_container.x, this.sub_menu_container.y,
                this.sub_menu_container.width, this.sub_menu_container.height, RGBtoHEX([49, 60, 74]), {rounded_corners:10}),


            // rects to hide selector buttons
            new Rectangle(this, 230, 0, 10, this.screen_height, this.background_color, {z_index:2}),
            new Rectangle(this, this.screen_width-240, 0, 10, this.screen_height, this.background_color, {z_index:2}),

            new Joystick(this, 120, this.screen_height-120, {base_size:200,
                holding_command:this.joystick_holding, release_command:this.joystick_release}).setDepth(4),
            new AttackButton(this, this.screen_width-120, this.screen_height-120, {width:200, height:200,
                joystick_base:'attack_button', joystick_head:'attack_button_head',
                holding_command:this.attack_pressed, release_command:this.attack_released}).setDepth(4),
            ]
        let select_buttons = [
            // top tab buttons
            new Button(this, 240, 10, {text:'Main', center:false, width:104, height:40, select_tint: RGBtoHEX([160,160,160]),
                press_command:()=>this.move_sub_menu("Main",this.sub_menu_container)}),
            new Button(this, 350, 10, {text:'Player', center:false, width:104, height:40, select_tint: RGBtoHEX([160,160,160]),
                press_command:()=>this.move_sub_menu("Player",this.sub_menu_container)}),
            new Button(this, 460, 10, {text:'Tower', center:false, width:104, height:40, select_tint: RGBtoHEX([160,160,160]),
                press_command:()=>this.move_sub_menu("Tower",this.sub_menu_container)}),
        ]
        for (let item of select_buttons) {
            item.set_select_group(select_buttons);
            this.ui_objects.push(item);
        }

        this.coins_ui_text = new Text(this, 20, 20, 'Coins: '+this.player_coins, {center:false}).setDepth(4);
        this.ui_objects.push(this.coins_ui_text);

        this.prev_sub_menu = "None"
        this.move_sub_menu("Main",this.sub_menu_container);
    }

    move_sub_menu = (menu, container_rect) => {
        if (menu !== this.prev_sub_menu) {
            this.prev_sub_menu = menu;
            this.destroy_ui_list(this.sub_menu_ui_objects);
            this.destroy_ui_list(this.tower_buy_ui_objects);
            this.destroy_ui_list(this.player_parts_ui_objects);
            this.destroy_ui_list(this.browse_parts_ui_objects);
            switch (menu) {
                case "Player":
                    this.create_player_parts_menu(container_rect);
                    break;
                case "Tower":
                    this.create_tower_menu(container_rect);
                    this.sub_menu_ui_objects[0].button_down({id:1});
                    this.sub_menu_ui_objects[0].button_up({id:1});
                    break;
                default:
                    this.create_main_menu(container_rect);
                    break;
            }
        }
    }
    create_main_menu(container_rect) {
        this.sub_menu_ui_objects = [new Player(this, container_rect.x+container_rect.width/2, container_rect.y+60, 'UI_PLAYER_DISPLAY')];

        this.sub_menu_ui_objects[0].setScale(3);
    }
    create_tower_menu(container_rect) {
        this.sub_menu_ui_objects = [];
        let towers = ["CannonTower", "LaserTower", "SniperTower", "FlamethrowerTower", "BallistaTower", "WeakeningTower", "SlowingTower", "BuffingTower"];
        for (let i=0;i<towers.length;i++) {
            this.sub_menu_ui_objects.push(new SelectorButton(this,
                container_rect.x+i*60+10, container_rect.y+10,
                {text:'',width:50, height:50, center:false, texture:'selector_button',
                press_command:()=>this.create_tower_buy_menu(towers[i],container_rect),
                select_tint:RGBtoHEX([200,200,200])},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                max_scroll:(towers.length*60+10)-container_rect.width,
                displayed_item:towers[i]}));
        }
        for (let item of this.sub_menu_ui_objects) {
            item.set_select_group(this.sub_menu_ui_objects);
        }
    }
    create_tower_buy_menu(tower_type, container_rect) {
        this.destroy_ui_list(this.tower_buy_ui_objects);
        let tower_info = this.tower_data[tower_type];
        let level_info = tower_info.level_stats[0];
        let description_string = tower_info.description+"\nDamage: "+level_info.damage+"\nFire Rate: "+level_info.fire_rate+"\nRange: "+level_info.range;
        this.tower_buy_ui_objects = [
            new Text(this, container_rect.x+container_rect.width/2, container_rect.y+84,
                tower_info.title, {center:true, text_style:{fontFamily:"Tahoma",color:'#111111',fontSize:30,fontStyle:"bold"}}),
            new Text(this, container_rect.x+10, container_rect.y+100, description_string, {center:false}),
            new Button(this, container_rect.x+container_rect.width/2, container_rect.y+container_rect.height-30,
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
        }
        for (let item of this.player_parts_ui_objects) {
            item.set_select_group(this.player_parts_ui_objects);
        }
    }
    create_browse_parts_menu(container_rect, filter=null) {
        this.destroy_ui_list(this.browse_parts_ui_objects);
        this.browse_parts_ui_objects = []
        let items = Object.keys(this.player_inventory).filter(
            (item) => (this.player_inventory[item].type === filter || filter === null || filter === 'all'));

        for (let i=0;i<items.length;i++) {
            this.browse_parts_ui_objects.push(new SelectorButton(this,
                container_rect.x+i*60+10, container_rect.y+60,
                {text:'',width:50, height:50, center:false, texture:'selector_button',
                    press_command:()=>this.create_specific_part_menu(items[i], container_rect),
                    select_tint:RGBtoHEX([200,200,200])},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                    max_scroll:(items.length*60+10)-container_rect.width,
                    displayed_item:items[i], display_type:"part"}));
        }
        for (let item of this.browse_parts_ui_objects) {
            item.set_select_group(this.browse_parts_ui_objects);
        }
    }
    create_specific_part_menu(item_name, container_rect) {
        this.destroy_ui_list(this.specific_part_ui_objects);
        // let tower_info = this.tower_data[tower_type];
        // let level_info = tower_info.level_stats[0];
        // let description_string = tower_info.description+"\nDamage: "+level_info.damage+"\nFire Rate: "+level_info.fire_rate+"\nRange: "+level_info.range;
        this.specific_part_ui_objects = [
            new Text(this, container_rect.x+container_rect.width/2, container_rect.y+84,
                item_name, {center:true, text_style:{fontFamily:"Tahoma",color:'#111111',fontSize:30,fontStyle:"bold"}}),
            new Text(this, container_rect.x+10, container_rect.y+100, description_string, {center:false}),
            new Button(this, container_rect.x+container_rect.width/2, container_rect.y+container_rect.height-30,
                {text:"Buy - "+level_info.cost, width:104, height:40,
                    press_command: ()=>this.make_tower(tower_type, "Down", level_info),
                    release_command: ()=>this.make_tower(tower_type, "Up", level_info)
                }),
        ]
    }


    destroy_ui_list(ui_list) {
        if (typeof(ui_list) !== 'undefined') {
            for (let obj of ui_list) {
                obj.destroy();
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
    joystick_holding = (x,y) => {
        this.output_data({type:'Joystick_Input', x:x, y:y, Direction: 'Down'})
    }
    joystick_release = () => {
        this.output_data({type:'Joystick_Input', Direction: 'Up'})
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