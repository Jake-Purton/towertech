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
    game_tick(delta_time, players, towers){
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
                distance = new_distance;
                nearest_player = player;
            }
        }
        return nearest_player;
    }
    find_far_player(players){
        let furthest_player = null;
        let distance = 0;
        for (let [_, player] of players){
            let new_distance = this.relative_position(player).length();
            if (new_distance > distance){
                distance = new_distance;
                furthest_player = player;
            }
        }
        return furthest_player;
    }
    find_near_tower(towers){
        let nearest_tower = null;
        let distance = Infinity;
        for (let tower of towers){
            let new_distance = this.relative_position(tower).length();
            if (new_distance < distance){
                distance = new_distance;
                nearest_tower = tower;
            }
        }
        return nearest_tower;
    }
    find_far_tower(towers){
        let furthest_tower = null;
        let distance = 0;
        for (let tower of towers){
            let new_distance = this.relative_position(tower).length();
            if (new_distance > distance){
                distance = new_distance;
                furthest_tower = tower;
            }
        }
        return furthest_tower;
    }
    find_near_player_tower(players, towers){
        let player = this.find_near_player(players);
        let tower = this.find_near_tower(towers);
        if (tower === null){
            return player;
        }
        if (this.relative_position(player).length() < this.relative_position(tower).length()){
            return player;
        } else {
            return tower;
        }
    }
    find_far_player_tower(players, towers){
        let player = this.find_near_player(players);
        let tower = this.find_near_tower(towers);
        if (tower === null){
            return player;
        }
        if (this.relative_position(player).length() > this.relative_position(tower).length()){
            return player;
        } else {
            return tower;
        }
    }
    relative_position(object){
        return new Vec(object.x - this.x, object.y - this.y);
    }
}