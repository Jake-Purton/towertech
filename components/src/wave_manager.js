import Wave from './wave.js';
import BossWave from './wave_boss.js';

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
        //this.waveSeed = -1;


        let difficulties = {
            Easy:0.6,
            Medium:1.6,
            Hard:2.6}
        let diff = localStorage.getItem("gameDifficulty")
        this.base_difficulty = difficulties[diff];

        this.game = game;
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

        this.next_wave();
    }

    generate_wave(difficulty)
    {
        // number of enemies increases by 5 with each wave.
        let numEnemies = this.waveTemplateData.enemyCount + 5 * (this.wave_index - this.waveData.length);
        let length = this.waveTemplateData.length + 5 * (this.wave_index - this.waveData.length) * this.waveTemplateData.spawnDelay


        // Copy pointers to the allEnemies and allWeights arrays
        let allEnemies = this.waveTemplateData.enemyList;
        let allWeights = this.waveTemplateData.enemyWeights;

        // Initialise the enemy & weight lists
        let enemyList = [];
        let enemyWeights = [];

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

        return new Wave(this.game, length, this.waveTemplateData.spawnDelay,
            enemyList, enemyWeights, numEnemies, difficulty,
            "Wave "+(this.wave_index+1), "Literally Everything"
        );



    }

    game_tick(deltaTime)
    {
        if (this.current_wave.game_tick(deltaTime)) {
            this.next_wave();
            return true
        }
        return false
    }

    next_wave()
    {
        // increment the wave index.
        this.wave_index ++;

        // increases difficulty by number of players every 5 waves
        let difficulty = (Math.floor((this.wave_index + 1) * 0.8) + 1) * (Object.keys(this.game.players).length+1) * this.base_difficulty;

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
