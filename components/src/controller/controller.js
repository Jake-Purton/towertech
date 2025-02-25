import * as Phaser from 'phaser';
import {modulo } from '../utiles.js';
import Button from '../button.js';
import Joystick from '../joystick.js';


export default class Controller extends Phaser.Scene{
    constructor(scene_info){
        super('GameController');

        // constants
        this.output_data = scene_info.output_data_func;
        this.screen_width = scene_info.screen_width;
        this.screen_height = scene_info.screen_height;
        this.mobile_device = scene_info.mobile_device;

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

        this.load.image('joystick_base','/game_images/UI/joystick_base.png');
        this.load.image('joystick_head','/game_images/UI/joystick_head.png');
    }
    create() {

        window.addEventListener('resize', () => {this.resized()});
        // this.input.on('resize', this.resized, this);

        // this.print('portrait: '+this.portrait+' w:'+this.screen_width+' h:'+this.screen_height);

        if (this.mobile_device) {
            this.prompt_tap_text = this.add.text(this.screen_width/2, this.screen_height/2, 'Tap to Start');
            this.input.once('pointerup',function() {this.init_fullscreen()},this);
        } else {
            this.create_ui();
        }



        // make ui
        // let f1 = () => console.log('press');
        // let f2 = () => console.log('release');

        // this.thingy = new Button(this, 40, 40, {press_command:f1, release_command:f2});

        // new Button(this, 250, 120, {text:'Left',height:90,width:150,
        //     press_command:() => this.button_pressed('Left'),
        //     release_command:() => this.button_released('Left')})
        // new Button(this, 400, 65, {text:'UP',height:90,width:150,
        //     press_command:() => this.button_pressed('Up'),
        //     release_command:() => this.button_released('Up')})
        // new Button(this, 400, 175, {text:'Down',height:90,width:150,
        //     press_command:() => this.button_pressed('Down'),
        //     release_command:() => this.button_released('Down')})
        // new Button(this, 550, 120, {text:'Right',height:90,width:150,
        //     press_command:() => this.button_pressed('Right'),
        //     release_command:() => this.button_released('Right')})
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
        // console.log('player_created:', this.player_created);
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
                this.resized();
                this.create_ui();
            }
        )
        this.print('game started!')

    }
    resized = () => {
        this.screen_width = window.innerWidth;
        this.screen_height = window.innerHeight;
    }
    create_ui = () => {
        new Joystick(this, this.screen_width-130, this.screen_height-130, {holding_command:this.joystick_holding, release_command:this.joystick_release});
        new Button(this, 130, this.screen_height-130, {width: 200, height:200 ,text:'Attack',
                    texture:'joystick_base', press_command:this.attack_pressed, release_command:this.attack_released})
        new Button(this, 200, 100, {text:'make tower',width:300,height:100,press_command:() => this.make_tower('LaserTower','Down'),
            release_command:() => this.make_tower('LaserTower','Up')});
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
    attack_pressed = () => {
        this.output_data({type:'Attack_Input', Direction:'Down', Auto_Target:true});
    }
    attack_released = () => {
        this.output_data({type:'Attack_Input', Direction:'Up'});
    }

}