import { spawn_enemy } from './enemies/enemy/enemy.js';

export default class Wave
{

    static currentWave = null;

    constructor(game, length, spawnDelay, enemyArray, enemyWeights, numEnemies, difficulty, title, sub_title)
    {
        this.game = game;
        Wave.currentWave = this;

        //Save these as temporary variables, so that the array sort can access them.
        this.unsortedWeights = enemyWeights;
        this.unsortedEnemies = enemyArray;

        // Sort the enemies, and their weights.
        // This is using a custom sort function, so that the enemy array is sorted based on the weight array.
        this.enemiesToSpawn = enemyArray.sort(this.#sort_array);
        this.enemyWeights = enemyWeights.sort(this.#sort_integers);

        // This loop modifies the weights array, ensuring that weights factor in the previous value.
        // If they didn't, then two elements with a weight of 50 would not work as expected.
        // only one would actually be used; the other would get ignored without this.
        // In addition, it calculates the cumulative weight, which is useful for other calculations.
        this.cumulativeWeight = 0;
        for (let i = 0; i < this.enemyWeights.length; i++)
        {
            let indexWeight = this.enemyWeights[i];
            this.enemyWeights[i] += this.cumulativeWeight;
            this.cumulativeWeight += indexWeight;
        }

        // Remove the temporary member variables - they aren't needed anymore.
        delete this.unsortedWeights;
        delete this.unsortedEnemies;

        // Initialise time, duration, and spawning timer variables.
        this.duration = length * this.game.target_fps;
        this.remainingTime = length * this.game.target_fps;
        this.timeBetweenWaves = 5 * this.game.target_fps;
        this.totalTimeBetweenWaves = this.timeBetweenWaves;

        this.spawnDelay = spawnDelay * this.game.target_fps;
        this.nextSpawn = spawnDelay * this.game.target_fps;
        this.numEnemies = numEnemies;
        this.totalEnemies = numEnemies;

        this.difficulty = difficulty;

        // create wave titles
        this.title_obj = this.game.add.text(
            this.game.level.texture_width/2, this.game.level.texture_height/2-30, title,
            {fontStyle: 'bold', fontSize:50, color:'#111111'}).setOrigin(0.5).setDepth(100)
        this.sub_title_obj = this.game.add.text(
            this.game.level.texture_width/2, this.game.level.texture_height/2+30, sub_title,
            {fontSize:30, color:'#333333'}).setOrigin(0.5).setDepth(100)
        this.game.time.delayedCall(3000, () => {
            this.title_obj.destroy()
            this.sub_title_obj.destroy()
        }, [], this.game);
    }

    game_tick(deltaTime)
    {
        // Subtract deltaTime from the remaining time.
        if (this.game.enemies.length + this.numEnemies <= 0) {
            this.timeBetweenWaves -= deltaTime;
        }
        this.nextSpawn -= deltaTime;

        // When it's time to spawn a new enemy,
        if (this.nextSpawn <= 0)
        {
            // Call the function to do so.
            this.find_enemy_to_spawn();
            // and reset the timer.
            this.nextSpawn = this.spawnDelay;
        }
        let health = 0;
        for (let enemy of this.game.enemies){
            health += enemy.health/enemy.max_health;
        }
        let return_data = [health + this.numEnemies,this.totalEnemies,this.timeBetweenWaves,this.totalTimeBetweenWaves]
        return (return_data)
    }

    find_enemy_to_spawn()
    {
        // First, santiy check - make sure there are enemies that can be spawned.
        if (this.numEnemies > 0)
        {
            // If there are, then a random number between 0 and the cumulative weight is generated.
            let randomNum = Math.random() * this.cumulativeWeight;
            // This number is then compared against each weight value.
            for(let i = 0; i < this.enemyWeights.length; i++)
            {
                // If it's the last element, or if the generated value is less than the weight,
                if (randomNum < this.enemyWeights[i] || i+1 == this.enemyWeights.length)
                {
                    // spawn the enemy and then return!
                    this.#spawn_enemy(this.enemiesToSpawn[i]);
                    this.numEnemies -= 1;
                    return;
                }
            }
        }
    }

    get_wave_progress()
    {
        // Return the fraction of time that's remaining.
        return (this.remainingTime / this.duration);
    }

    #spawn_enemy(enemyName)
    {
        // spawn the enemy
        let enemy = spawn_enemy(this.game, -50, -50, enemyName, this.game.level.enemy_path, this.difficulty);
        this.game.enemies.push(enemy);
        return enemy;
        // this.game.enemies.push(new Enemy(this.game, -50, -50, enemyName, this.game.enemy_path));
    }

    #sort_array(a, b)
    {
        //Get the corresponding weight values for the two values.
        let index1 = Wave.currentWave.unsortedEnemies.indexOf(a);
        let index2 = Wave.currentWave.unsortedEnemies.indexOf(b);
        return Wave.currentWave.unsortedWeights[index1] - Wave.currentWave.unsortedWeights[index2];
    }

    #sort_integers(a, b)
    {
        //Simply subtract b from a and return that.
        //this is how sort functions work.
        return a - b;
    }
}
