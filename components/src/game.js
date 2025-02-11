import * as Phaser from 'phaser';
import Player from './player.js';
import { spawn_enemy } from './enemies/enemy/enemy.js';
import {Cannon } from './tower.js';

export default class Game extends Phaser.Scene{
    constructor(){
        super('GameScene');

        // game object containers
        this.players = new Map([]);
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];

        // constants
        this.target_fps = 60;

        // game data
        this.enemy_path = this.load_path([[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]);
        this.wave_data = {"spawn_delay":1, "next_spawn":1, "enemies":{'goolime':5,'goober':5,'goosplitter':5,'gooshifter':5,'goosplits':5,'gooslinger':5,'goosniper':5}};
    }
    preload() {
        this.load.image('default_body','/game_images/player_sprites/bodies/default_body.png');
        this.load.image('default_leg','/game_images/player_sprites/legs/default_leg.png');
        this.load.image('wheel','/game_images/player_sprites/legs/wheel.png');
        this.load.image('default_weapon','/game_images/player_sprites/weapons/default_weapon.png');
        this.load.image('tower','/game_images/tower.png');
        this.load.image('tower_gun','/game_images/cannon_head.png');
        this.load.image('cannon_ball','/game_images/cannon_ball.png');
        this.load.spritesheet('goolime','/game_images/enemy_sprites/enemy/goolime.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goosniper','/game_images/enemy_sprites/enemy/goosniper.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goosplits','/game_images/enemy_sprites/enemy/goosplits.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goober','/game_images/enemy_sprites/enemy/goober.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooslinger','/game_images/enemy_sprites/enemy/gooslinger.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('gooshifter','/game_images/enemy_sprites/enemy/gooshifter.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goobomber','/game_images/enemy_sprites/enemy/goobomber.png', {frameWidth:32, frameHeight:48});
        this.load.spritesheet('goosplitter','/game_images/enemy_sprites/enemy/goosplitter.png', {frameWidth:32, frameHeight:48});
        this.load.image('goo_blood','/game_images/gooblood.png');
    }
    create() {
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
        this.players.set('TempPlayerID', new Player(this, 100, 100, 'TempPlayerID'));

        // input
        this.kprs = this.input.keyboard.createCursorKeys();

        // random numbers
        this.RNG = new Phaser.Math.RandomDataGenerator();

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        // change delta to be a value close to one that accounts for fps change
        // e.g. if fps is 30, and meant to 60 it will set delta to 2 so everything is doubled
        delta = (delta*this.target_fps)/1000;


        /// handle players
        this.dummy_input();
        for (let [_, player] of this.players) {
            player.game_tick(delta);
        }

        /// handle towers
        for (let tower of this.towers){
            tower.game_tick(delta, this.enemies);
        }

        /// handle projectiles
        let remove_list = [];
        for (let projectile of this.projectiles) {
            projectile.game_tick(delta, this.enemies, this.players, this.towers);
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
            if (enemy.get_dead()){
                remove_list.push(enemy);
            }
        }
        // delete all enemies that were added to remove_list
        this.enemies = this.enemies.filter(item => !remove_list.includes(item));
        for (let enemy of remove_list){
            enemy.destroy();
        }

        // wave management
        this.wave_data.next_spawn-=delta/this.target_fps;
        if (this.wave_data.next_spawn < 0){
            this.wave_data.next_spawn = this.wave_data.spawn_delay
            // randomly select enemy type
            let enemy_names = Object.keys(this.wave_data.enemies);
            let index = 0;
            let count = 0;
            let new_enemy = null;
            do {
                index = Phaser.Math.Between(0,enemy_names.length-1);
                count+=1;
            } while (this.wave_data.enemies[enemy_names[index]]<=0 && count<20);
            // create enemy
            if (count<10) {
                this.wave_data.enemies[enemy_names[index]] -= 1;
                new_enemy = spawn_enemy(this, -50, -50, enemy_names[index],this.enemy_path)
                this.enemies.push(new_enemy);
            }
        }
    }

    take_input(input){
        if (this.players.has(input.get('PlayerID'))){
            let player = this.players.get(input.get('PlayerID'));
            // check if input is placing a tower or movement
            if (input.get('Key') === 'PLACE_TOWER'){
                let new_tower = player.create_tower(input.get('Tower'), input.get('Direction'));
                if (new_tower !== null){
                    this.towers.push(new_tower);
                }
            } else {
                player.input_key(input.get('Key'), input.get('Direction'));
            }
        }
    }

    load_path(points){
        let path = new Phaser.Curves.Path(points[0][0], points[0][1]);
        for (let i=1;i<points.length;i++) {
            path.lineTo(points[i][0],points[i][1]);
        }
        return path
    }

    dummy_input(){
        // dummy method that attempts to recreate how inputs would be taken
        if (this.kprs.up.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','UP'],['Direction','Down']]))
        }
        if (this.kprs.down.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','DOWN'],['Direction','Down']]))
        }
        if (this.kprs.right.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','RIGHT'],['Direction','Down']]))
        }
        if (this.kprs.left.isDown){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','LEFT'],['Direction','Down']]))
        }

        if (this.kprs.up.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','UP'],['Direction','Up']]))
        }
        if (this.kprs.down.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','DOWN'],['Direction','Up']]))
        }
        if (this.kprs.right.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','RIGHT'],['Direction','Up']]))
        }
        if (this.kprs.left.isUp){
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','LEFT'],['Direction','Up']]))
        }
        if (this.kprs.space.isDown) {
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','PLACE_TOWER'],['Direction','Down'],['Tower','Cannon']]))
        }
        if (this.kprs.space.isUp) {
            this.take_input(new Map([['PlayerID', 'TempPlayerID'],
                ['Key','PLACE_TOWER'],['Direction','Up'],['Tower','Cannon']]))
        }
    }
}