import Phaser from "phaser";

const AliveGameObject = Base => class extends Base {
    // texture is either a texture or a list of game objects for when this is inherited by player, as player is a container not a sprite
    constructor(...args) {
        super(...args);
    }
}

export {AliveGameObject };