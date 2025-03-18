import { spawn_enemy } from './enemies/enemy/enemy.js';
import Wave from './wave.js'

export default class BossWave extends Wave
{
    constructor(game, length, spawnDelay, enemyArray, enemyWeights, numEnemies, difficulty, title, sub_title)
    {
        let waveEnemies = enemyArray.slice(1);
        let waveWeights = enemyWeights.slice(1);

        super(game, length, spawnDelay, waveEnemies, waveWeights, numEnemies, difficulty, title, sub_title);

        this.bossEnemy = spawn_enemy(game, -50, -50, enemyArray[0], game.level.enemy_path, difficulty);
        game.enemies.push(this.bossEnemy);
        this.nextSpawn += 5 * this.game.target_fps;

        this.difficulty = difficulty;
    }

    game_tick(deltaTime)
    {
        return super.game_tick(deltaTime);
        //If the boss enemy is still alive,
        if (this.bossEnemy != null && this.bossEnemy.health > 0)
        {
            //re-add deltaTime so that the remaining time is a respite after beating the boss.
            this.remainingTime += deltaTime;
        }
        else
        {
            if (this.bossEnemy != null)
            {
                this.bossEnemy = null;
            }
        }
    }

    get_wave_progress()
    {
        if (this.bossEnemy == null)
        {
            return 0;
        }
        return this.bossEnemy.health / this.bossEnemy.max_health;
    }
}
