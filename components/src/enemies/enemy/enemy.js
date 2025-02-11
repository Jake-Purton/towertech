import * as Phaser from 'phaser';
import Goober from './goober.js';
import Goolime from './goolime.js';
import Goobomber from './goobomber.js';
import Gooslinger from './gooslinger.js';
import Gooshifter from './gooshifter.js';
import Goosniper from './goosniper.js';
import Goosplitter from './goosplitter.js';
import Goosplits from './goosplits.js';
const Vec = Phaser.Math.Vector2;

const enemy_map = {
    'goober':Goober,
    'goolime':Goolime,
    'gooslinger':Gooslinger,
    'goobomber':Goobomber,
    'gooshifter':Gooshifter,
    'goosniper':Goosniper,
    'goosplitter':Goosplitter,
    'goosplits':Goosplits
};

export function spawn_enemy(scene, x, y, type, path){
    let new_enemy = null;
    if (type in enemy_map){
        new_enemy = new enemy_map[type](scene, x, y, path)
    }
    return new_enemy;
}