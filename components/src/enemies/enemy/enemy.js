import * as Phaser from 'phaser';
import Goober from './goober.js';
import Goolime from './goolime.js';
import Goobouncer from './goobouncer.js';
import Gooslinger from './gooslinger.js';
import Gooshifter from './gooshifter.js';
import Goosniper from './goosniper.js';
import Goosplitter from './goosplitter.js';
import Goosplits from './goosplits.js';
import Goocrab from './goocrab.js';
import Goocaster from './goocaster.js';
import Gootower from './gootower.js';
import Goobuilder from '../boss/goobuilder.js';
import Gooacid from '../boss/gooacid.js';
import Goobullet from '../boss/goobullet.js';
const Vec = Phaser.Math.Vector2;

const enemy_map = {
    'goober':Goober,
    'goolime':Goolime,
    'gooslinger':Gooslinger,
    'goobouncer':Goobouncer,
    'gooshifter':Gooshifter,
    'goosniper':Goosniper,
    'goosplitter':Goosplitter,
    'goosplits':Goosplits,
    'goocaster':Goocaster,
    'goocrab':Goocrab,
    'gootower':Gootower,
    'goobuilder':Goobuilder,
    'gooacid':Gooacid,
    'goobullet':Goobullet
};

export function spawn_enemy(scene, x, y, type, path, porperties){
    let new_enemy = null;
    if (type in enemy_map){
        new_enemy = new enemy_map[type](scene, x, y, path, porperties)
    }
    return new_enemy;
}