import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;

export default class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, type, path) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.path = path;
        this.path_t = 0; // value moves from 0 to 1 when moving along path
        this.play(type+'_walk')
    }
    game_tick(delta_time, players){
        // Moves enemy round path
        // returns true if the enemy has got to the end of the path
        this.path_t += (delta_time * this.move_speed)/this.path.getLength();
        this.path_t = Phaser.Math.Clamp(this.path_t,0,1);
        let position = this.path.getPoint(this.path_t);
        this.setPosition(position.x, position.y);
        return this.path_t >= 1;
    }
    get_dead(){
        return (this.path_t >= 1 || this.health<=0)
    }
    find_near_player(players){
        let nearest_player = null;
        let distance = Infinity;
        for (let [_, player] of players){
            let new_distance = this.relative_position(player).length();
            if (new_distance < distance){
                nearest_player = player;
            }
        }
        return nearest_player;
    }
    relative_position(object){
        return new Vec(object.x - this.x, object.y - this.y);
    }
}