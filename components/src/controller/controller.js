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

        // constants
        this.tower_data = {
            "CannonTower":{title:"Cannon", cost:5},
            "LaserTower":{title:"Laser", cost:20},
            "SniperTower":{title:"Sniper", cost:20},
            "FlamethrowerTower":{title:"Flamer", cost:20},
            "BallistaTower":{title:"Ballista", cost:20},
            "WeakeningTower":{title:"Weakener", cost:20},
            "SlowingTower":{title:"Slower", cost:20},

        };

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
        this.load.image('button1','/game_images/UI/button.png');
        this.load.image('button2','/game_images/UI/button2.png');
        this.load.image('button','/game_images/UI/Basic button.png');
        this.load.image('selector_button','/game_images/UI/selector_button.png');

        this.load.image('joystick_base','/game_images/UI/joystick_base4.png');
        this.load.image('joystick_head','/game_images/UI/joystick_head2.png');

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

        //
        // new Button(this, 700, 120, {text:'Tower',height:90,width:150,
        //     release_command:() => this.move_menu('CreateTower')})
        //
        // let towers = ['CannonTower','SniperTower','BallistaTower','LaserTower','FlamethrowerTower',
        // 'HealingTower','SlowingTower','BuffingTower'];
        //
        // let tower_button;
        // for (let i=0;i<towers.length;i++) {
        //     tower_button = new Button(this,140+modulo(i,3)*260,280+Math.floor(i/3)*80,
        //         {texture:'button2',text:towers[i].replace('Tower',''),width:240,height:60,
        //          press_command:() => this.make_tower(towers[i],'Down'),
        //          release_command:() => this.make_tower(towers[i],'Up')})
        // }
        //
        // new Joystick(this, 150, 650, {holding_command:this.joystick_holding, release_command:this.joystick_release});
    }
    // delta is the delta_time value, it is the milliseconds since last frame
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
                console.log('player has '+this.coins+' coins.')
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
        if (typeof(this.ui_objects) !== 'undefined') {
            for (let obj of this.ui_objects) {
                obj.destroy();
            }
        }

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

            // top tab buttons
            new Button(this, 240, 10, {text:'Main', center:false, width:104, height:40, press_command:()=>this.move_sub_menu("Main",this.sub_menu_container)}),
            new Button(this, 350, 10, {text:'Player', center:false, width:104, height:40, press_command:()=>this.move_sub_menu("Player",this.sub_menu_container)}),
            new Button(this, 460, 10, {text:'Tower', center:false, width:104, height:40, press_command:()=>this.move_sub_menu("Tower",this.sub_menu_container)}),
        ]
        this.move_sub_menu("Main",this.sub_menu_container);
    }

    move_sub_menu = (menu, container_rect) => {
        for (let obj of this.sub_menu_ui_objects) {
            obj.destroy();
        }
        switch (menu) {
            case "Player":
                break;
            case "Tower":
                this.create_tower_menu(container_rect);
                break;
            default:
                this.create_main_menu(container_rect);
                break;
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
                press_command:()=>this.create_tower_buy_menu(towers[i],container_rect)},
                {sector_x:container_rect.x, sector_width:container_rect.width,
                max_scroll:(towers.length*60+10)-container_rect.width,
                displayed_class:towers[i]}));
        }
    }
    create_tower_buy_menu(tower_type, container_rect) {
        if (typeof(this.tower_buy_ui_objects) !== 'undefined') {
            for (let obj of this.tower_buy_ui_objects) {
                obj.destroy();
            }
        }
        let tower_info = this.tower_data[tower_type]
        this.tower_buy_ui_objects = [
            new Text(this, container_rect.x+10, container_rect.y+80,
                tower_info.title, {center:false, text_style:{fontFamily:"Tahoma",color:RGBtoHEX([30,30,30]),fontSize:25}}),
        ]
    }

    button_pressed = (button) => {
        this.output_data({type:'Key_Input', Key: button, Direction: 'Down'});
    }
    button_released = (button) => {
        this.output_data({type:'Key_Input', Key: button, Direction: 'Up'});
    }
    make_tower = (tower, direction) => {
        this.output_data({type:'Create_Tower', Tower: tower, Direction: direction})
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