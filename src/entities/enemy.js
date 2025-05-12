import { updateCombatLog } from '../utils/ui_logger.js';

export class Enemy {
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
    console.log(message); // Keep console.log for debugging if desired
    updateCombatLog(message);
    return this.stats.health > 0;
  }

  attack(target) {
    if (!target) return; // Ensure target exists
    const damage = this.stats.damage;
    const message = `Enemy (Tier ${this.tier}) attacks for ${damage} potential damage.`;
    console.log(message); // Keep console.log for debugging if desired
    updateCombatLog(message);
    target.takeDamage(damage);
  }
} // End Enemy Class