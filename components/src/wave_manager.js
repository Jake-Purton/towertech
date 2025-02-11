import * as Phaser from 'phaser';
const Vec = Phaser.Math.Vector2;
import Game from './game.js';
import Enemy from './enemy.js'
import Wave from './wave.js'

export default class WaveManager
{
    static #game = null;
    constructor(game)
    {
        this.#currentWave = null;
        // Each entry in waveData would contain:
        // The wave type, length, spawn delay, enemy string array, enemy weights, and number of enemies in the wave.
        this.#waveData = [];
        // waveTemplateData is a prototype of a wave.
        // It contains the same data as waveData (excluding the type), except with a "number of unique enemies" value too.
        this.#waveTemplateData = [];
        this.#waveIndex = -1;
        //this.#waveSeed = -1;


        #game = game;
    }

    load_waves(jsonString)
    {

        if (this.#waveData != [])
        {
            reset_waves();
        }

        let parsedJson = JSON.parse(jsonString);


        // do stuff
        // basically: unparsed json goes in, array of wave data comes out.
        // if there already are wave things, then clear the memory. or maybe throw an exception.


        this.#waveData = parsedJson.waves;
        this.#waveTemplateData = parsedJson.waveTemplate;

        this.#waveIndex = 0;
    }

    generate_wave()
    {
        // number of enemies increases by 3 with each wave.
        let numEnemies = this.#waveTemplateData[4] + 3 * (this.#waveIndex - this.#waveData.length);


        // Copy pointers to the allEnemies and allWeights arrays
        let allEnemies = this.#waveTemplateData[2];
        let allWeights = this.#waveTemplateData[3];

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
                if (enemyList.length >= this.#waveTemplateData[5])
                {
                    // break from it.
                    break;
                }
            }
        }

        return new Wave(#game, this.#waveTemplateData[0], this.#waveTemplateData[1], enemyList, enemyWeights, numEnemies);



    }

    game_tick(deltaTime)
    {
        currentWave.game_tick(deltaTime);
    }

    next_wave()
    {
        let newWave = null;
        if (waveIndex < this.#waveData.length)
        {
            // go to the next wave.
            // do stuff :D
            let wave = this.#waveData[waveIndex];
            switch(waveData[0])
            {
                case "wave":
                    newWave = new Wave(#game, wave[1], wave[2], wave[3], wave[4], wave[5]);
                    break;
                case "boss":
                    // boss waves not implemented yet.
                    // break;
                default:
                    alert("Invalid wave type"+waveData[0]+".");
                    break;
            }
        }
        else
        {
            // if there is none (waveIndex > the number of waves),
            // then generate a new wave - using the wave index as the difficulty.
            newWave = generate_wave()
        }
        // set the new wave.
        this.#currentWave = newWave;

        // increment the wave index.
        this.#waveIndex ++;
    }

    reset_waves()
    {
        // this will clear all of the wave manager's wave-data memory.
        // also sets the current wave to null, and stuff.

        this.#currentWave = null;
        this.#waveData = [];
        this.#waveTemplateData = [];
        this.#waveIndex = -1;
        this.#waveSeed = -1;

    }


}
