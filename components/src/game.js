import * as Phaser from 'phaser';
import Player from './player.js';
import {random_choice } from './utiles.js';
import Level from "./level.js";

export default class Game extends Phaser.Scene{
    constructor(output_data_func, init_server_func){
        super('GameScene');

        // game object containers
        this.players = {};
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];
        this.dropped_items = [];

        // constants
        this.target_fps = 60;
        this.output_data = output_data_func;
        this.init_server = init_server_func;

        // gameplay info
        this.score = 0;
        this.health = 1;

    }
    preload() {
        //// player part images
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('robot_body','/game_images/player_sprites/bodies/robot_body.png');

        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('robot_leg','/game_images/player_sprites/legs/robot_leg.png')
        this.load.image('striped_leg','/game_images/player_sprites/legs/striped_leg.png')
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');

        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');
        this.load.image('pistol_weapon','/game_images/player_sprites/weapons/pistol.png');

        //// background
        this.load.image('background','/game_images/background.png');

        //// particle images
        this.load.image('goo_blood','/game_images/particles/gooblood.png');
        this.load.image('fire_particle','/game_images/particles/Fire.png');
        this.load.image('heart_particle','/game_images/particles/Heart.png');
        this.load.image('speed_particle','/game_images/particles/Speed.png');
        this.load.image('slow_particle','/game_images/particles/Slow.png');
        this.load.image('laser_particle','/game_images/particles/Laser_Dust.png');

        //// Load tower images
        this.load.image('CannonTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('CannonTower_gun','/game_images/towers/CannonTower_gun.png');
        this.load.image('CannonTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('LaserTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('LaserTower_gun','/game_images/towers/LaserTower_gun.png');
        this.load.image('LaserTower_projectile','/game_images/projectiles/LaserTower_projectile.png');

        this.load.image('SniperTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SniperTower_gun','/game_images/towers/SniperTower_gun.png');
        this.load.image('SniperTower_projectile','/game_images/projectiles/SniperTower_projectile.png');

        this.load.image('FlamethrowerTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('FlamethrowerTower_gun','/game_images/towers/FlamethrowerTower_gun.png');
        this.load.image('FlamethrowerTower_projectile','/game_images/projectiles/FlamethrowerTower_projectile.png');

        this.load.image('BallistaTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BallistaTower_gun','/game_images/towers/BallistaTower_gun.png');
        this.load.image('BallistaTower_projectile','/game_images/projectiles/BallistaTower_projectile.png');

        this.load.image('HealingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('HealingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('HealingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('BuffingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('BuffingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('BuffingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        this.load.image('SlowingTower_base','/game_images/towers/CannonTower_base.png');
        this.load.image('SlowingTower_gun','/game_images/towers/HealingTower_gun.png');
        this.load.image('SlowingTower_projectile','/game_images/projectiles/CannonTower_projectile.png');

        // enemies
        this.load.image('goosniper_projectile','/game_images/projectiles/goosniper_projectile.png');
        this.load.image('gooslinger_projectile','/game_images/projectiles/gooslinger_projectile.png');
        this.load.spritesheet('goolime','/game_images/enemy_sprites/enemy/goolime.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goosniper','/game_images/enemy_sprites/enemy/goosniper.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goosplits','/game_images/enemy_sprites/enemy/goosplits.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goober','/game_images/enemy_sprites/enemy/goober.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooslinger','/game_images/enemy_sprites/enemy/gooslinger.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooshifter','/game_images/enemy_sprites/enemy/gooshifter.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goobomber','/game_images/enemy_sprites/enemy/goobomber.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goosplitter','/game_images/enemy_sprites/enemy/goosplitter.png', {frameWidth:32, frameHeight:48});
    }
    create() {
        this.init_server();

        // animations
        this.anims.create({
            key: 'goolime_walk',
            frames: this.anims.generateFrameNumbers('goolime', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosniper_walk',
            frames: this.anims.generateFrameNumbers('goosniper', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosplits_walk',
            frames: this.anims.generateFrameNumbers('goosplits', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goober_walk',
            frames: this.anims.generateFrameNumbers('goober', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gooshifter_walk',
            frames: this.anims.generateFrameNumbers('gooshifter', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gooslinger_walk',
            frames: this.anims.generateFrameNumbers('gooslinger', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goobomber_walk',
            frames: this.anims.generateFrameNumbers('goobomber', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'goosplitter_walk',
            frames: this.anims.generateFrameNumbers('goosplitter', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        // game objects
        this.players['TempPlayerId'] =  new Player(this, 100, 100, 'TempPlayerId');

        // create Level (map info and enemy path)
        this.level = new Level(this, 'main', this.scale.width, this.scale.height);

        // input
        this.kprs = this.input.keyboard.createCursorKeys();

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        // change delta to be a value close to one that accounts for fps change
        // e.g. if fps is 30, and meant to 60 it will set delta to 2 so everything is doubled
        delta = (delta*this.target_fps)/1000;

        /// handle players
        this.dummy_input();
        let all_dead = true;
        for (let player of Object.values(this.players)) {
            player.game_tick(delta, this.enemies);
            if (player.get_dead()) {
                player.die();
            } else {
                all_dead = false;
            }
        }
        if (all_dead && Object.values(this.players).length>0) {
            this.end_game();
        }

        /// handle towers
        for (let tower of this.towers){
            tower.game_tick(delta, this.enemies, this.players);
        }

        /// handle dropped items
        let remove_list = [];
        for (let dropped_item of this.dropped_items) {
            dropped_item.game_tick(delta, this.players);
            if (dropped_item.get_dead()) {
                remove_list.push(dropped_item);
            }
        }
        this.dropped_items = this.dropped_items.filter(item => !remove_list.includes(item));
        for (let object of remove_list) {
            object.destroy();
        }

        /// handle projectiles
        remove_list = [];
        for (let projectile of this.projectiles) {
            projectile.game_tick(delta, this.enemies, this.towers, this.players);
            if (projectile.get_dead()){
                remove_list.push(projectile);
            }
        }
        this.projectiles = this.projectiles.filter(item => !remove_list.includes(item));
        for (let projectile of remove_list){
            projectile.destroy();
        }

        /// handle particles
        remove_list = [];
        for (let particle of this.particles) {
            particle.game_tick(delta);
            if (particle.get_dead()){
                remove_list.push(particle);
            }
        }
        this.particles = this.particles.filter(item => !remove_list.includes(item));
        for (let particle of remove_list){
            particle.destroy();
        }

        /// handle enemies
        remove_list = [];
        for (let enemy of this.enemies){
            enemy.game_tick(delta, this.players, this.towers);
            if (enemy.get_finished_path()) {
                remove_list.push(enemy);
                this.health -= 1; // temporary
            } else if (enemy.get_dead()){
                remove_list.push(enemy);
                enemy.die();
            }
        }
        // delete all enemies that were added to remove_list
        this.enemies = this.enemies.filter(item => !remove_list.includes(item));
        for (let enemy of remove_list){
            enemy.destroy();
        }

        // level(wave) management
        this.level.game_tick(delta);

        // check game over
        if (this.health <= 0) {
            this.end_game();
        }
    }
    end_game() {
        console.log('GAME OVER');
    }

    take_input(input){
        switch (input.type) {
            case 'Constructor':
                if (!(input.PlayerID in this.players)){
                    this.players[input.PlayerID] = new Player(this, 100*Object.keys(this.players).length, 100, input.PlayerID);
                    // this.output_data(input.PlayerID, {type:'Player_Constructor_Acknowledgement'});
                }
                break;
            case 'Key_Input':
                this.players[input.PlayerID].key_input(input);
                break;
            case 'Attack_Input':
                this.players[input.PlayerID].attack_input(input);
                break;
            case 'Joystick_Input':
                this.players[input.PlayerID].joystick_input(input);
                break;
            case 'Create_Tower':
                this.players[input.PlayerID].new_tower_input(input);
                break;
            case 'Equip_Part':
                this.players[input.PlayerID].equip_part(input.item_name);
                break;
            case 'Print':
                console.log('MESSAGE FROM CONTROLLER <'+input.PlayerID+'> = '+input.text);
                break;
        }
    }

    dummy_input(){
        // dummy method that attempts to recreate how inputs would be taken
        if (this.kprs.up.isDown){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Up', Direction:'Down'});
        }
        if (this.kprs.down.isDown){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Down', Direction:'Down'});
        }
        if (this.kprs.right.isDown){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Right', Direction:'Down'});
        }
        if (this.kprs.left.isDown){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Left', Direction:'Down'});
        }
        if (this.kprs.up.isUp){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Up', Direction:'Up'});
        }
        if (this.kprs.down.isUp){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Down', Direction:'Up'});
        }
        if (this.kprs.right.isUp){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Right', Direction:'Up'});
        }
        if (this.kprs.left.isUp){
            this.take_input({PlayerID: 'TempPlayerId', type:'Key_Input', Key: 'Left', Direction:'Up'});
        }
        if (this.kprs.space.isDown) {
            this.take_input({PlayerID: 'TempPlayerId', type:'Create_Tower', Direction: 'Down', Tower: 'LaserTower', Tower_Stats:{cost:0}})
        }
        if (this.kprs.space.isUp) {
            this.take_input({PlayerID: 'TempPlayerId', type:'Create_Tower', Direction: 'Up', Tower: 'LaserTower'})
        }
        if (this.kprs.shift.isDown) {
            this.take_input({PlayerID: 'TempPlayerId', type:'Attack_Input', Direction:'Down', Auto_Target:true, Angle:140});
        }
        if (this.kprs.shift.isUp) {
            this.take_input({PlayerID: 'TempPlayerId', type:'Attack_Input', Direction:'Up', Auto_Target:true});
        }
    }
}