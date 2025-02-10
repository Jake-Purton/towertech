import * as Phaser from 'phaser';

class LineAttack extends Phaser.Physics.Arcade.Sprite {
    static unique_id = 0
    constructor(scene, source, target, texture) {
        LineAttack.unique_id+=1

        this.render_texture = new Phaser.GameObjects.RenderTexture(scene,0,0,100,10);

        this.render_texture.saveTexture('LineAttackImage_'+toString(LineAttack.unique_id);)


        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.base_texture = new Phaser.GameObjects.Image(scene, 0, 0, texture);
    }
    get_position() {

    }
    get_texture() {

    }
}