import { Hero } from '../entities/hero.js';
import { Enemy } from '../entities/enemy.js';
import { LootTable } from './loot_table.js';
import { updateCombatLog } from '../utils/ui_logger.js';

export class CombatManager {
  constructor(scene, heroArchetype = null) { // Accept scene context and optional archetype
    this.scene = scene; // Store scene context
    this.hero = new Hero(heroArchetype); // Pass archetype to Hero constructor
    this.currentEnemy = null;
    this.combatInterval = null;
  }

  startAutoCombat() {
    if (this.combatInterval) return; // Prevent multiple intervals

    this.combatInterval = setInterval(() => {
      // Check if enemy needs spawning
      if (!this.currentEnemy || this.currentEnemy.stats.health <= 0) {
        this.spawnNewEnemy();
      }
      // Resolve combat if enemy exists
      if (this.currentEnemy) {
          this.resolveCombatRound();
      }
    }, 1000); // Combat tick rate
  }

  stopAutoCombat() {
      if (this.combatInterval) {
          clearInterval(this.combatInterval);
          this.combatInterval = null;
          const message = "Auto-combat stopped.";
          console.log(message); // Keep console.log for debugging if desired
          updateCombatLog(message);
      }
  }

  spawnNewEnemy() {
      // If there's an old enemy sprite, destroy it first
      if (this.scene.enemySprite) {
          this.scene.enemySprite.destroy();
          this.scene.enemySprite = null;
      }
      // Create new enemy logic
      const tier = this.currentTier();
      this.currentEnemy = new Enemy(tier);
      const message = `New enemy spawned: Tier ${this.currentEnemy.tier}, Health ${this.currentEnemy.stats.health}`;
      console.log(message);
      updateCombatLog(message);

      // Create placeholder graphics for the new enemy
      // This assumes 'this.scene' is a Phaser scene and has 'add.graphics()'
      if (this.scene && typeof this.scene.add === 'object' && typeof this.scene.add.graphics === 'function') {
        this.scene.enemySprite = this.scene.add.graphics();
        this.scene.enemySprite.fillStyle(0xff0000, 1); // Red rectangle
        this.scene.enemySprite.fillRect(-25, -50, 50, 100); // Draw centered at (0,0) initially
        this.scene.enemySprite.setPosition(600, 300); // Position on screen
      } else {
        console.error("Scene context for CombatManager is not a valid Phaser scene or 'add.graphics' is unavailable.");
      }
  }

  currentTier() {
    // Placeholder: Increase tier based on hero level, for example
    return Math.max(1, Math.floor(this.hero.level / 5) + 1);
  }

  resolveCombatRound() {
    if (!this.currentEnemy || !this.hero) return; // Safety check

    // Hero attacks
    if (this.hero.attack(this.currentEnemy)) {
      // Check if enemy died from hero attack
      if (this.currentEnemy.stats.health <= 0) {
        this.handleEnemyDefeat();
        return; // End round early if enemy died
      }
    } else {
      // Hero couldn't attack (e.g., out of stamina)
      const message = "Hero out of stamina!";
      console.log(message);
      updateCombatLog(message);
    }

    // Enemy attacks if still alive and hero is alive
    if (this.currentEnemy && this.currentEnemy.stats.health > 0 && this.hero.stats.health > 0) {
      this.currentEnemy.attack(this.hero);
      // Check if hero died from enemy attack
      if (this.hero.stats.health <= 0) {
        this.handleHeroDefeat();
      }
    }
  }

  handleEnemyDefeat() {
    if (!this.currentEnemy) return; // Should not happen, but safety check

    // Store enemy reference before clearing it
    const defeatedEnemy = this.currentEnemy;
    const loot = new LootTable(defeatedEnemy.tier).generateLoot();
    // Note: JSON.stringify for modifiers might be too verbose for UI log, but good for console
    const uiLogMessage = `Enemy defeated! Loot found: Tier ${loot.tier}, Rarity ${loot.rarity}`;
    console.log(`${uiLogMessage} (${JSON.stringify(loot.modifiers)})`); 
    updateCombatLog(uiLogMessage);


    // Award XP
    this.hero.gainXP(defeatedEnemy.stats.xpValue);

    // TODO: Add loot to inventory or apply effects

    this.currentEnemy = null; // Clear the defeated enemy reference

    // Destroy the enemy sprite
    if (this.scene.enemySprite) {
        this.scene.enemySprite.destroy();
        this.scene.enemySprite = null;
    }
    // Don't spawn immediately, let the interval handle it next tick
  }

  handleHeroDefeat() {
    const message = "Hero has been defeated!";
    console.error(message);
    updateCombatLog(`ERROR: ${message}`);
    this.stopAutoCombat(); // Stop combat
    // TODO: Implement respawn logic, penalties, etc.
    // Maybe disable UI elements or show a "Defeated" screen
  }
} // End CombatManager Class