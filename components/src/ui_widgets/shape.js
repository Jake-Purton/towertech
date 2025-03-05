import * as Phaser from 'phaser';

class Rectangle extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, width, height, fill, {rounded_corners=0, z_index=0}={}) {
        super(scene);
        scene.add.existing(this);

        this.fillStyle(fill);
        this.fillRoundedRect(x, y, width, height, rounded_corners);
        this.setDepth(z_index);
    }
}

export {Rectangle};