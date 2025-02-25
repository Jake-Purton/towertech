import * as Phaser from 'phaser';
import WaveManager from "./wave_manager.js";

export default class Level extends Phaser.Physics.Arcade.Sprite {
    static map_data = {
        // 'original': {map_texture: '', enemy_path:[[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]},
        'main': {map_texture:'background', enemy_path:[[0,0.47],[0.425,0.47],[0.425,0.545],[0.14,0.545],[0.14,0.81],[0.76,0.81],[0.76,0.42]]}}
    constructor(scene, map_name, x, y, width, height) {
        let info = Level.map_data[map_name];
        super(scene, x, y, info.map_texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.x_pos = x;
        this.y_pos = y;
        this.screen_width = width;
        this.screen_height = height;

        this.enemy_path = this.load_path(info.enemy_path);
        this.depth = -10;

        this.setScale(this.screen_width/this.width, this.screen_height/this.height);
        this.setPosition(this.x_pos+this.screen_width/2, this.y_pos+this.screen_height/2);

        // wave stuf
        this.current_wave = null;

        this.wave_manager = new WaveManager(this.scene);

        let test = '{"waves":[ {"type":"wave", "length":15, "spawnDelay":1, "enemyList":["goolime", "goober","gooshifter","gooslinger","goosniper","goosplitter"], "enemyWeights":[10, 5,5,5,5,5], "enemyCount": 5} ],  "waveTemplate":{"length":20, "spawnDelay":1, "enemyList":["goolime", "goober"], "enemyWeights":[10, 5], "enemyCount": 5, "maxCount":1}}'

        this.wave_manager.load_waves(test)
    }
    game_tick(delta_time) {
        this.wave_manager.game_tick(delta_time);
    }
    load_path(points){
        let path = new Phaser.Curves.Path(
            this.x_pos + points[0][0]*this.screen_width,
            this.y_pos + points[0][1]*this.screen_height);
        for (let i=1;i<points.length;i++) {
            path.lineTo(
                this.x_pos + points[i][0]*this.screen_width,
                this.y_pos + points[i][1]*this.screen_height);
        }
        return path
    }
}