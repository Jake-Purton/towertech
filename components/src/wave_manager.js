import Wave from './wave.js';
import BossWave from './wave_boss.js';
import WaveBar from './wave_bar.js';
import {clamp, random_choice} from './utiles.js';

const bosses = ['gooacid','goobullet','goobuilder']

export default class WaveManager
{
    static game = null;
    current_wave = null;
    waveData = {};
    waveTemplateData = {};
    wave_index = -1;
    waveSeed = -1;

    constructor(game)
    {
        this.current_wave = null;
        // Each entry in waveData would contain:
        // The wave type, length, spawn delay, enemy string array, enemy weights, and number of enemies in the wave.
        this.waveData = {};
        // waveTemplateData is a prototype of a wave.
        // It contains the same data as waveData (excluding the type), except with a "number of unique enemies" value too.
        this.waveTemplateData = {};
        this.wave_index = -1;
        this.waves_started = false;
        //this.waveSeed = -1;


        let difficulties = {
            Easy:1,
            Medium:1.6,
            Hard:2.6}
        let diff = localStorage.getItem("gameDifficulty")
        this.base_difficulty = difficulties[diff];

        this.game = game;

        this.wave_bar = new WaveBar(
                    this.game, 'wave_progress_bar_back', 'wave_progress_bar',
                    400, 100, 50, 100);
        
        this.wave_bar.set_health(10,10)
    }

    load_waves(parsedJson)
    {

        if (this.waveData != {})
        {
            this.reset_waves();
        }

        // do stuff
        // basically: unparsed json goes in, array of wave data comes out.
        // if there already are wave things, then clear the memory. or maybe throw an exception.


        this.waveData = parsedJson.waves;
        this.waveTemplateData = parsedJson.waveTemplate;
    }
    start_waves() {
        if (!this.waves_started) {
            this.next_wave();
            this.waves_started = true;
        }
    }
    generate_wave(difficulty)
    {
        // number of enemies increases by 5 with each wave.
        let numEnemies = this.waveTemplateData.enemyCount + 5 * (this.wave_index - this.waveData.length);
        let length = this.waveTemplateData.length + 5 * (this.wave_index - this.waveData.length) * this.waveTemplateData.spawnDelay

        let spawnDelay = this.waveTemplateData.spawnDelay/(clamp(this.wave_index-this.waveData.length,1,Infinity))+0.5

        // Copy pointers to the allEnemies and allWeights arrays
        let allEnemies = this.waveTemplateData.enemyList;
        let allWeights = this.waveTemplateData.enemyWeights;

        // Initialise the enemy & weight lists
        let enemyList = [];
        let enemyWeights = [];

        let title_suffix = ""
        let is_boss_wave = false;
        if ((this.wave_index+1) % 5 === 0){
            enemyList.splice(0,0,random_choice(bosses))
            enemyWeights.push(1)
            title_suffix = " - Boss Wave"
            is_boss_wave = true
        }


        // Iterate through the enemy list.
        for(let i = 0; i < allEnemies.length; i++)
        {
            // Determine the probability that each value should be added to the array,
            let probability = 1.0 / (allEnemies.length - i);
            // And generate a random number with Math.random().
            let randomVal = Math.random();

            // If this value is less than or equal to the probability,
            if (randomVal <= probability)
            {
                // Add the enemy and its weight to the array.
                enemyList.push(allEnemies[i]);
                enemyWeights.push(allWeights[i]);

                // If the array is now full,
                if (enemyList.length >= this.waveTemplateData.maxCount)
                {
                    // break from it.
                    break;
                }
            }
        }
        let new_wave;
        if (is_boss_wave) {
            new_wave = new BossWave(this.game, length, spawnDelay,
                enemyList, enemyWeights, numEnemies, difficulty,
                "Wave "+(this.wave_index+1)+title_suffix, "Literally Everything"
            )
        } else {
            new_wave = new Wave(this.game, length, spawnDelay,
                enemyList, enemyWeights, numEnemies, difficulty,
                "Wave "+(this.wave_index+1)+title_suffix, "Literally Everything"
            )
        }
        return new_wave;



    }

    game_tick(deltaTime)
    {
        if (this.current_wave !== null) {
            let data = this.current_wave.game_tick(deltaTime)
            let enemies_left = data[0] / data[1]
            if (enemies_left > 0) {
                this.wave_bar.set_health(data[0], data[1])
            } else if (data[2] > 0) {
                this.wave_bar.set_text("");
                this.wave_bar.set_health(data[3] - data[2], data[3])
            } else {
                this.next_wave();
                return true
            }
        }
        return false
    }

    next_wave()
    {
        // increment the wave index.
        this.wave_index ++;

        // increases difficulty by number of players every wave
        let difficulty = (((this.wave_index + 1) ** 1.8)/3 + 0.5) * (Object.keys(this.game.players).length+1) * this.base_difficulty;

        let newWave = null;
        if (this.wave_index < this.waveData.length)
        {
            // go to the next wave.
            // do stuff :D
            let wave = this.waveData[this.wave_index];
            switch(wave.type)
            {
                case "wave":
                    newWave = new Wave(this.game, wave.length, wave.spawnDelay, wave.enemyList,
                        wave.enemyWeights, wave.enemyCount, difficulty, wave.title, wave.sub_title);
                    break;
                case "boss":
                    newWave = new BossWave(this.game, wave.length, wave.spawnDelay, wave.enemyList,
                        wave.enemyWeights, wave.enemyCount, difficulty, wave.title, wave.sub_title);
                    break;
                    // break;
                default:
                    alert("Invalid wave type"+wave.type+".");
                    break;
            }
        }
        else
        {
            // if there is none (wave_index > the number of waves),
            // then generate a new wave - using the wave index as the difficulty.
            newWave = this.generate_wave(difficulty)
        }
        // set the new wave.
        this.current_wave = newWave;

        this.wave_bar.set_text(this.current_wave.title_text)

    }

    reset_waves()
    {
        // this will clear all of the wave manager's wave-data memory.
        // also sets the current wave to null, and stuff.

        this.current_wave = null;
        this.waveData = [];
        this.waveTemplateData = [];
        this.wave_index = -1;
        this.waveSeed = -1;

    }


}
