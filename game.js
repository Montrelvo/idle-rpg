// --- Skill Definitions (Placeholders) ---
const PASSIVE_SKILLS = {
  'increased_strength_1': { id: 'increased_strength_1', name: 'Might I', description: '+5 STR', effect: { stat: 'str', value: 5 }, cost: 1, prereqs: [] },
  'increased_health_1': { id: 'increased_health_1', name: 'Vitality I', description: '+20 Max Health', effect: { stat: 'maxHealth', value: 20 }, cost: 1, prereqs: [] },
};

const ACTIVE_SKILLS = {
  'power_strike': { id: 'power_strike', name: 'Power Strike', description: 'Deals 150% STR damage.', cost: 1, staminaCost: 20, cooldown: 5000, effect: { type: 'damage', multiplier: 1.5, stat: 'str' }, prereqs: [] },
  'quick_heal': { id: 'quick_heal', name: 'Quick Heal', description: 'Heals for 30% Max Health.', cost: 1, staminaCost: 30, cooldown: 10000, effect: { type: 'heal', multiplier: 0.3, stat: 'maxHealth' }, prereqs: [] },
};
// --- End Skill Definitions ---

// --- UI Utility Functions ---
const MAX_LOG_MESSAGES = 20; // Max messages to display in combat log
const combatLogElement = document.getElementById('combat-log');

function updateCombatLog(message) {
   if (!combatLogElement) {
       console.warn("Combat log element not found!");
       return;
   }

   const messageElement = document.createElement('p');
   messageElement.textContent = message;
   
   // Add the new message to the top
   combatLogElement.insertBefore(messageElement, combatLogElement.firstChild);

   // Limit the number of messages
   while (combatLogElement.children.length > MAX_LOG_MESSAGES) {
       combatLogElement.removeChild(combatLogElement.lastChild);
   }
}
// --- End UI Utility Functions ---


class Hero {
  constructor() {
    this.stats = {
      str: 10,
      int: 10,
      agi: 10,
      health: 100,
      maxHealth: 100,
      defense: 5,
      stamina: 100,
      maxStamina: 100,
      staminaRegen: 1 // Per second
    };
    this.cooldowns = new Map(); // For active skills: Map<skillId, timestamp>
    this.equipment = new Map([
      ['weapon', null],
      ['armor', null]
    ]);
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100; // Initial XP requirement for level 2
    this.attributePoints = 0; // Points gained on level up
    this.skillPoints = 0; // Points gained on level up for skills
    this.learnedPassiveSkills = new Map(); // Map<skillId, level>
    this.learnedActiveSkills = new Map(); // Map<skillId, level>
  }

  attack(target) {
    if (!target) return false; // Ensure target exists
    if (this.stats.stamina < 10) return false;
    this.stats.stamina -= 10;
    const baseDamage = this.stats.str * 2;
    target.takeDamage(baseDamage);
    const message = `Hero attacks for ${baseDamage} damage.`;
    console.log(message);
    updateCombatLog(message);
    return true;
  }

  takeDamage(amount) {
    const actualDamage = Math.max(0, amount - this.stats.defense);
    this.stats.health -= actualDamage;
    const message = `Hero takes ${actualDamage} damage. Health: ${this.stats.health}`;
    console.log(message);
    updateCombatLog(message);
    // Add logic for hero death if needed
    return this.stats.health > 0;
  }

  gainXP(amount) {
    this.xp += amount;
    const message = `Gained ${amount} XP. Total XP: ${Math.floor(this.xp)}/${this.xpToNextLevel}`;
    console.log(message);
    updateCombatLog(message);
    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    // Exponential scaling for next level's XP requirement
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    this.attributePoints += 3; // Gain 3 attribute points per level
    this.skillPoints += 1; // Gain 1 skill point per level

    // Basic stat increase on level up (can be refined)
    this.stats.maxHealth += 10;
    this.stats.health = this.stats.maxHealth; // Heal on level up
    this.stats.maxStamina += 5;
    this.stats.stamina = this.stats.maxStamina; // Restore stamina
    this.stats.str += 1;
    this.stats.int += 1;
    this.stats.agi += 1;

    const message = `LEVEL UP! Reached level ${this.level}. Attrib Points: ${this.attributePoints}, Skill Points: ${this.skillPoints}`;
    console.log(message);
    updateCombatLog(message);
    // TODO: Add UI notification for level up
  }

  spendAttributePoint(stat) {
    if (this.attributePoints > 0) {
      if (stat === 'str' || stat === 'int' || stat === 'agi') {
        this.stats[stat]++;
        this.attributePoints--;
        const message = `Spent 1 point on ${stat.toUpperCase()}. Points remaining: ${this.attributePoints}`;
        console.log(message);
        updateCombatLog(message);
        // TODO: Potentially recalculate derived stats (like damage, maxHealth based on STR/INT)
        return true;
      } else {
        const warningMessage = `Invalid stat provided to spendAttributePoint: ${stat}`;
        console.warn(warningMessage);
        updateCombatLog(`WARN: ${warningMessage}`);
        return false;
      }
    } else {
      const warningMessage = "Attempted to spend attribute point, but none available.";
      console.warn(warningMessage);
      updateCombatLog(`WARN: ${warningMessage}`);
      return false;
    }
  }

  // TODO: Add methods for learning/using skills
} // End Hero Class


class Enemy {
  constructor(tier) {
    this.tier = tier;
    this.stats = this.generateStats(tier);
  }

  generateStats(tier) {
    const base = tier * 10;
    return {
      health: base * 5,
      maxHealth: base * 5,
      damage: base * 2,
      defense: base * 1.5,
      xpValue: base * 3 // XP awarded on defeat
    };
  }

  takeDamage(amount) {
     const actualDamage = Math.max(0, amount - this.stats.defense);
    this.stats.health -= actualDamage;
    const message = `Enemy takes ${actualDamage} damage. Health: ${this.stats.health}`;
    console.log(message);
    updateCombatLog(message);
    return this.stats.health > 0;
  }

  attack(target) {
    if (!target) return; // Ensure target exists
    const damage = this.stats.damage;
    const message = `Enemy (Tier ${this.tier}) attacks for ${damage} potential damage.`;
    console.log(message);
    updateCombatLog(message);
    target.takeDamage(damage);
  }
} // End Enemy Class


class LootTable {
  constructor(tier) {
    this.tier = tier;
    // Rarity: 0=Common, 1=Uncommon, 2=Rare, 3=Epic, 4=Legendary
    this.rarityWeights = [0.5, 0.3, 0.15, 0.04, 0.01]; // Sum should be 1
  }

  generateLoot() {
    const rarityIndex = this.rollRarity();
    const rarityName = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][rarityIndex];
    return {
      tier: this.tier,
      rarity: rarityName, // Use name for clarity
      rarityIndex: rarityIndex,
      modifiers: this.generateModifiers(rarityIndex)
    };
  }

  rollRarity() {
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < this.rarityWeights.length; i++) {
      cumulative += this.rarityWeights[i];
      if (roll <= cumulative) return i;
    }
    return 0; // Default to common if something goes wrong
  }

  generateModifiers(rarityIndex) {
    // Placeholder: Generate a number of simple stat modifiers based on rarity
    const numModifiers = rarityIndex + 1; // More modifiers for higher rarity
    const modifiers = {};
    const possibleStats = ['str', 'int', 'agi', 'maxHealth', 'defense']; // Use maxHealth
    for (let i = 0; i < numModifiers; i++) {
      const stat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
      // Scale value by tier and rarity
      const value = Math.ceil(Math.random() * (rarityIndex + 1) * this.tier * 2);
      modifiers[stat] = (modifiers[stat] || 0) + value;
    }
    return modifiers;
  }
} // End LootTable Class


class CombatManager {
  constructor(scene) { // Accept scene context
    this.scene = scene; // Store scene context
    this.hero = new Hero();
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
          console.log(message);
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
      this.scene.enemySprite = this.scene.add.graphics();
      this.scene.enemySprite.fillStyle(0xff0000, 1); // Red rectangle
      this.scene.enemySprite.fillRect(-25, -50, 50, 100); // Draw centered at (0,0) initially
      this.scene.enemySprite.setPosition(600, 300); // Position on screen
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
    const message = `Enemy defeated! Loot found: Tier ${loot.tier}, Rarity ${loot.rarity} (${JSON.stringify(loot.modifiers)})`;
    console.log(message); // Keep console.log for object details if needed
    updateCombatLog(`Enemy defeated! Loot found: Tier ${loot.tier}, Rarity ${loot.rarity}`);


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


// Phaser.js Game Configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-canvas', // Target the div in index.html
  width: 800,
  height: 600,
  scene: {
    preload: function() {
      // Load assets - We'll use graphics for now, no assets needed yet
      console.log("Preloading assets...");
    },
    create: function() {
      console.log("Creating game scene...");
      // Initialize game objects
      this.combatManager = new CombatManager(this); // Pass scene context (this)

      // Create placeholder graphics for hero
      this.heroSprite = this.add.graphics();
      this.heroSprite.fillStyle(0x00ff00, 1); // Green rectangle
      this.heroSprite.fillRect(-25, -50, 50, 100); // Draw centered at (0,0) initially
      this.heroSprite.setPosition(200, 300); // Position on screen

      // Placeholder for enemy sprite (will be created when combat starts)
      this.enemySprite = null;

      // Add text for basic stats display
      this.heroHealthText = this.add.text(150, 420, '', { font: '16px Arial', fill: '#ffffff' });
      this.enemyHealthText = this.add.text(550, 420, '', { font: '16px Arial', fill: '#ffffff' });

      // Add event listeners for attribute buttons
      document.getElementById('spend-str').addEventListener('click', () => {
        this.combatManager.hero.spendAttributePoint('str');
      });
      document.getElementById('spend-int').addEventListener('click', () => {
        this.combatManager.hero.spendAttributePoint('int');
      });
      document.getElementById('spend-agi').addEventListener('click', () => {
        this.combatManager.hero.spendAttributePoint('agi');
      });

      // Populate Skill Trees UI
      this.populateSkillTreeUI('passive-skills', PASSIVE_SKILLS);
      this.populateSkillTreeUI('active-skills', ACTIVE_SKILLS); // Placeholder for active skills

       // Start combat logic AFTER setting up visuals and listeners
      this.combatManager.startAutoCombat();

    },

    // Helper function to populate skill UI
    populateSkillTreeUI: function(elementId, skillData) {
        const container = document.getElementById(elementId);
        if (!container) return;
        container.innerHTML = `<h4>${elementId.replace('-', ' ').toUpperCase()}</h4>`; // Add a title

        for (const skillId in skillData) {
            const skill = skillData[skillId];
            const button = document.createElement('button');
            button.id = `learn-${skillId}`;
            button.textContent = `${skill.name} (Cost: ${skill.cost})`;
            button.title = skill.description; // Tooltip
            button.disabled = true; // Initially disabled, enable in update loop
            // TODO: Add event listener for learning the skill
            container.appendChild(button);
        }
    },
    update: function(time, delta) {
      // Game loop
      const hero = this.combatManager.hero;
      const enemy = this.combatManager.currentEnemy;

      // Regenerate hero stamina
      if (hero.stats.stamina < hero.stats.maxStamina) {
        hero.stats.stamina += hero.stats.staminaRegen * (delta / 1000); // Regen per second
        hero.stats.stamina = Math.min(hero.stats.stamina, hero.stats.maxStamina);
      }

      // Update HTML UI Panel
      const statsElement = document.getElementById('hero-stats');
      if (statsElement) {
          statsElement.innerHTML = `
              Level: ${hero.level}<br>
              XP: ${Math.floor(hero.xp)} / ${hero.xpToNextLevel}<br>
              Attribute Points: ${hero.attributePoints}<br>
              Skill Points: ${hero.skillPoints}<br>
              <hr>
              HP: ${Math.max(0, Math.ceil(hero.stats.health))}/${hero.stats.maxHealth}<br>
              Stamina: ${Math.ceil(hero.stats.stamina)}/${hero.stats.maxStamina}<br>
              STR: ${hero.stats.str} | INT: ${hero.stats.int} | AGI: ${hero.stats.agi}<br>
              Defense: ${hero.stats.defense}
          `;
      }

      // Enable/disable attribute buttons based on points
      const canSpendAttribPoints = hero.attributePoints > 0;
      document.getElementById('spend-str').disabled = !canSpendAttribPoints;
      document.getElementById('spend-int').disabled = !canSpendAttribPoints;
      document.getElementById('spend-agi').disabled = !canSpendAttribPoints;
      // TODO: Enable/disable skill buttons based on skill points

      // Update health text displays in Phaser canvas
      this.heroHealthText.setText(`Hero HP: ${Math.max(0, Math.ceil(hero.stats.health))}/${hero.stats.maxHealth}`);
      if (enemy && this.enemySprite) { // Check if enemy exists and sprite is drawn
        this.enemyHealthText.setText(`Enemy HP: ${Math.max(0, Math.ceil(enemy.stats.health))}/${enemy.stats.maxHealth}`);
        this.enemyHealthText.setVisible(true);
      } else {
        this.enemyHealthText.setVisible(false); // Hide text if no enemy
      }
    }
  }
};

// Ensure the DOM is ready before creating the game
window.onload = () => {
    const game = new Phaser.Game(config);
};