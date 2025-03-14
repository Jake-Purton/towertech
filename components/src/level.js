import * as Phaser from 'phaser';
import WaveManager from "./wave_manager.js";
const Vec = Phaser.Math.Vector2;

export default class Level extends Phaser.Physics.Arcade.Sprite {
    static map_data = {
        // 'original': {map_texture: '', enemy_path:[[0,100],[200,150],[400,50],[600,200],[500,450],[200,200],[0,400]]},
        'main': {map_texture:'background', width:800, height:800, enemy_path:[[0,0.47],[0.425,0.47],[0.425,0.545],[0.14,0.545],[0.14,0.81],[0.76,0.81],[0.76,0.42]]},
        'level 2': {map_texture:'background_2', width:1500, height:750, enemy_path:[
            [0.06,0],[0.06,0.344, 0.03],[0.23,0.344,0.03],[0.23,0.14,0.03],[0.44,0.14,0.03],[0.44,0.56,0.03],
            [0.11,0.56,0.03],[0.11,0.84,0.03],[0.61,0.84,0.03],[0.61,0.2,0.03],[0.73,0.2,0.03],[0.73,0.79,0.03],[0.88,0.79,0.03],[0.88,0.47]]},
        'level 3': {map_texture:'background_3', width:1500, height:750, enemy_path:[]}}

constructor(scene, map_name, screen_width, screen_height) {
        let info = Level.map_data[map_name];
        super(scene, 0, 0, info.map_texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.x_pos = 0;
        this.y_pos = 0;


        // adjust camera to make map fill screen
        // the main game is unchanged, it just zooms in and moves the camera around, so it fill correctly
        this.texture_width = info.width;
        this.texture_height = info.height;

        let texture_ratio = this.texture_width/this.texture_height;
        if (screen_width/screen_height > texture_ratio) {
            this.display_width = screen_height*texture_ratio;
            this.display_height = screen_height;
        } else {
            this.display_width = screen_width;
            this.display_height = screen_width/texture_ratio;
        }
        this.scene.cameras.main.setZoom(this.display_width/this.texture_width, this.display_height/this.texture_height);
        this.scene.cameras.main.setScroll((this.texture_width-this.display_width)/2,(this.texture_height-this.display_height)/2);
        this.scene.cameras.main.setViewport((screen_width-this.display_width)/2, (screen_height-this.display_height)/2, this.display_width, this.display_height);

        this.enemy_path = this.load_path(info.enemy_path);
        this.depth = -10;

        this.setScale(this.texture_width/this.width, this.texture_height/this.height);
        this.setPosition(this.texture_width/2, this.texture_height/2);

        // wave stuf
        this.current_wave = null;

        this.wave_manager = new WaveManager(this.scene);

        let test = '{"waves":[ {"type":"wave", "length":30, "spawnDelay":1, "enemyList":["goolime", "goober","gooshifter","gooslinger","goosniper","goosplitter","goocaster","goocrab","goobouncer","goobuilder","gooacid","goobullet"], "enemyWeights":[5,5,5,5,5,5,5,5,5,5,5,5], "enemyCount": 30} ],  "waveTemplate":{"length":20, "spawnDelay":1, "enemyList":["goolime", "goober"], "enemyWeights":[10, 5], "enemyCount": 5, "maxCount":1}}'
        let wave_data = {
            "waves":[
                {"type":"wave", "length":30, "spawnDelay":1,
                "enemyList":["goober", "goobouncer", "goocaster", "goocrab", "goolime", "gooshifter", "gooslinger", "goosniper", "goosplitter"],//, "goowalker", "goodropper", "goofly"],
                "enemyWeights":[5,5,5,5,5,5,5,5,5], "enemyCount": 30}
            ],
            "waveTemplate":{"length":20, "spawnDelay":1, "enemyList":["goolime", "goober"], "enemyWeights":[10, 5], "enemyCount": 5, "maxCount":1}}

        this.wave_manager.load_waves(wave_data)
    }
    game_tick(delta_time) {
        this.wave_manager.game_tick(delta_time);
    }
    load_path(points){
        let path = new Phaser.Curves.Path(
            this.x_pos + points[0][0]*this.texture_width,
            this.y_pos + points[0][1]*this.texture_height);
        for (let i=1;i<points.length;i++) {
            if (points[i].length === 2) {
                path.lineTo(
                    this.x_pos + points[i][0]*this.texture_width,
                    this.y_pos + points[i][1]*this.texture_height);
            } else {
                let prev = path.getEndPoint();
                let next = new Vec(points[i+1][0]*this.texture_width, points[i+1][1]*this.texture_height)
                let current = new Vec(points[i][0]*this.texture_width, points[i][1]*this.texture_height)
                let diff = current.clone().subtract(prev)
                points[i][2] *= this.texture_width
                diff.setLength(diff.length()-points[i][2])
                path.lineTo(
                    prev.x + diff.x,
                    prev.y + diff.y);
                diff = next.clone().subtract(current);
                diff.setLength(points[i][2]);
                let pos2 = current.clone().add(diff);
                path.quadraticBezierTo(pos2.x, pos2.y, current.x, current.y)
            }

        }

        ///// draws the path
        // let graphics = this.scene.add.graphics();
        // graphics.lineStyle(2, 0xffffff, 1);
        // path.draw(graphics);

        return path
    }
}