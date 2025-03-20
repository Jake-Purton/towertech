import * as Phaser from 'phaser';

export default class PlayerInfoDisplay extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y, []);
        this.scene.add.existing(this);

        this.setDepth(200)
        // font used is because it is monospace, so each row lines up
        this.list_text = new Phaser.GameObjects.Text(scene, -5, 5, '',
            {fontFamily:"Courier",color:'#111111',fontSize:25, fontStyle:"bold"})
        this.list_text.setOrigin(1, 0);
        this.update_list_text()
        this.add(this.list_text)
    }
    update_list_text() {
        let data_table = [];
        for (let player of Object.values(this.scene.players)) {
            let hp_display;
            let ping_display;
            if (!player.dead && player.health > 0) {
                hp_display = Math.round(player.health)+"/"+player.max_health+ 'hp';
            } else {
                hp_display = "DEAD"
            }
            if (player.ping < 2000) {
                ping_display = player.ping+'ms'
            } else {
                ping_display = 'Disconnected'
            }
            data_table.push([
                player.username, hp_display, "$"+player.coins, ping_display
            ])
        }
        let text = ""
        if (data_table.length > 0) {
            let word_lengths = []
            for (let column=0;column<data_table[0].length;column++) {
                let len = 0;
                for (let row=0;row<data_table.length;row++) {
                    if (data_table[row][column].length > len) {
                        len = data_table[row][column].length
                    }
                }
                word_lengths.push(len);
            }
            for (let row=0;row<data_table.length;row++) {
                for (let column=0;column<data_table[0].length;column++) {
                    text += data_table[row][column]+" ".repeat(word_lengths[column]-data_table[row][column].length)
                    if (row !== data_table[0].length-1) {
                        text += " "
                    }
                }
                text += "\n"
            }
        }
        this.list_text.setText(text)
    }
}