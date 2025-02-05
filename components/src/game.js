import * as Phaser from 'phaser';
import Player from './player.js';
import Enemy from './enemy.js';
import {Cannon } from './tower.js';
import Wave from './wave.js'

export default class Game extends Phaser.Scene{
    static target_fps = 60.0;

    constructor(){
        super('GameScene');

        // game object containers
        this.players = new Map([]);
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.enemies = [];


        // constants

        // game data
        this.enemy_path = this.load_path([[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]);
        //this.wave_data = {"spawn_delay":1, "next_spawn":1, "enemies":{'goolime':25,'goober':5}};

        this.current_wave = null;

    }
    preload() {
        this.load.image('body','/game_images/body_image.png');
        this.load.image('leg','/game_images/leg.png');
        this.load.image('arm','/game_images/arm.png');
        this.load.image('tower','/game_images/tower.png');
        this.load.image('tower_gun','/game_images/cannon_head.png');
        this.load.image('cannon_ball','/game_images/cannon_ball.png');
        this.load.spritesheet('goolime','/game_images/goolime.png', {frameWidth:30, frameHeight:13});
        this.load.spritesheet('goober','/game_images/goober.png', {frameWidth:32, frameHeight:48});
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
            key: 'goober_walk',
            frames: this.anims.generateFrameNumbers('goober', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        // game objects
        this.players.set('TempPlayerID', new Player(this, 100, 100, 'TempPlayerID'));


        //game, length, spawnDelay, enemyArray, enemyWeights, numEnemies
        this.current_wave = new Wave(this, 240, 2, ["goober", "goolime"], [5, 20], 40);

        // input
        this.kprs = this.input.keyboard.createCursorKeys();

        // random numbers
        this.RNG = new Phaser.Math.RandomDataGenerator();

    }
    // delta is the delta_time value, it is the milliseconds since last frame
    update(time, delta) {
        // change delta to be a value close to one that accounts for fps change
        // e.g. if fps is 30, and meant to 60 it will set delta to 2 so everything is doubled
        delta = (delta*Game.target_fps)/1000;

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
            projectile.game_tick(delta, this.enemies, this.towers);
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
            enemy.game_tick(delta);
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
        this.current_wave.game_tick(delta);
        /*this.wave_data.next_spawn-=delta/Game.target_fps;
        if (this.wave_data.next_spawn < 0){
            this.wave_data.next_spawn = this.wave_data.spawn_delay
            // randomly select enemy type
            let enemy_names = Object.keys(this.wave_data.enemies);
            let index = 0;
            let count = 0;
            do {
                index = Phaser.Math.Between(0,enemy_names.length-1);
                count+=1;
            } while (this.wave_data.enemies[enemy_names[index]]<=0 && count<20);
            // create enemy
            if (count<10) {
                this.wave_data.enemies[enemy_names[index]] -= 1;
                this.enemies.push(new Enemy(this, -50, -50, enemy_names[index], this.enemy_path));
            }
        }*/
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
