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
import Goowalker from './goowalker.js';
import Goosprint from './goosprint.js';
import Goofly from './goofly.js';
import Goocharger from './goocharger.js';
import Goodropper from './goodropper.js';
import Goodrone from './goodrone.js';
import Gootank from '../miniboss/gootank.js';
import Goobuilder from '../boss/goobuilder.js';
import Gooacid from '../boss/gooacid.js';
import Goobullet from '../boss/goobullet.js';

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
    'goowalker':Goowalker,
    'goosprint':Goosprint,
    'goofly':Goofly,
    'gootank':Gootank,
    'goobuilder':Goobuilder,
    'gooacid':Gooacid,
    'goobullet':Goobullet,
    'goocharger':Goocharger,
    'goodropper':Goodropper,
    'goodrone':Goodrone
};

export function spawn_enemy(scene, x, y, type, path, difficulty, porperties){
    let new_enemy = null;
    if (type in enemy_map){
        new_enemy = new enemy_map[type](scene, x, y, path, difficulty, porperties)
    }
    return new_enemy;
}