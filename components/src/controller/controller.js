import * as Phaser from 'phaser';
import {RGBtoHEX } from '../utiles.js';
import Text from '../ui_widgets/text.js';
import Button from '../ui_widgets/button.js';
import Joystick from '../ui_widgets/joystick.js';
import AttackButton from "../ui_widgets/attack_button.js";
import {Rectangle} from "../ui_widgets/shape.js";


export default class Controller extends Phaser.Scene{
    constructor(scene_info){
        super('GameController');

        // constants
        this.output_data = scene_info.output_data_func;
        this.mobile_device = scene_info.mobile_device;
        this.max_screen_width = scene_info.max_screen_width;
        this.max_screen_height = scene_info.max_screen_height;

        //variables
        this.player_created = false;

        this.player_coins = 0;

    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');

        this.load.image('button','/game_images/UI/button.png');
        this.load.image('button2','/game_images/UI/button2.png');

        this.load.image('joystick_base','/game_images/UI/joystick_base4.png');
        this.load.image('joystick_head','/game_images/UI/joystick_head2.png');

        this.load.image('attack_button','/game_images/UI/attack_base.png');
        this.load.image('attack_button_head','/game_images/UI/attack_head.png');
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
        if (typeof(this.ui_objects) !== 'undefined') {
            for (let obj of this.ui_objects) {
                obj.destroy();
            }
        }
        this.ui_objects = [
            // background and segmentation
            new Rectangle(this, 0, 0, this.screen_width, this.screen_height, RGBtoHEX([32, 44, 49])),

            new Rectangle(this, 10, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), 10),
            new Rectangle(this, this.screen_width-230, 10, 220, this.screen_height-20, RGBtoHEX([49, 60, 74]), 10),
            new Rectangle(this, 240, 10, this.screen_width-480, this.screen_height-20, RGBtoHEX([49, 60, 74]), 10),

            new Joystick(this, this.screen_width-120, this.screen_height-120, {base_size:200, holding_command:this.joystick_holding, release_command:this.joystick_release}),

            new AttackButton(this, 120, this.screen_height-120, {width:200, height:200, joystick_base:'attack_button', joystick_head:'attack_button_head', holding_command:this.attack_pressed, release_command:this.attack_released}),

            // new Button(this, 130, this.screen_height-130, {width: 200, height:200 ,text:'Attack',
            //     texture:'joystick_base', press_command:this.attack_pressed, release_command:this.attack_released}),
            // new Button(this, 200, 100, {text:'make tower',width:300,height:100,press_command:() => this.make_tower('LaserTower','Down'),
            //     release_command:() => this.make_tower('LaserTower','Up')}),
            // this.create.text(10, 10, 'Money: 69420', {fontFamily:'Tahoma', fontStyle:'bold',color:'#333', fontSize:20}),
            // new Text(this, 10, 10, 'Money:234242342',{center:false}),
        ]
    }

    move_menu = (menu) => {
        this.scene.switch(menu);
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