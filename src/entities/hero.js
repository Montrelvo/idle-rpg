import { ARCHETYPES, PASSIVE_SKILLS, ACTIVE_SKILLS } from '../config/constants.js';
import { updateCombatLog } from '../utils/ui_logger.js';

export class Hero {
  constructor(archetypeId = null) { // Default to null if no archetype passed
    this.stats = {
      str: 10,
      int: 10,
      agi: 10,
      health: 100,
      maxHealth: 100,
      defense: 5,
      stamina: 100,
      maxStamina: 100,
      staminaRegen: 1, // Per second
      // critChance: 0.05 // Base crit chance, can be modified by rogue
    };
    this.archetype = archetypeId ? ARCHETYPES[archetypeId] : null;

    if (this.archetype) {
      updateCombatLog(`Initializing Hero as ${this.archetype.name}.`);
      for (const stat in this.archetype.bonuses) {
        if (this.stats.hasOwnProperty(stat)) {
          this.stats[stat] += this.archetype.bonuses[stat];
          updateCombatLog(`Applied archetype bonus: ${stat} +${this.archetype.bonuses[stat]}. New value: ${this.stats[stat]}`);
        } else {
          // This could be for stats not directly in this.stats, like a special flag
          // For now, we assume bonuses are for existing stats.
          updateCombatLog(`WARN: Archetype bonus for unknown stat '${stat}' for ${this.archetype.name}.`);
        }
      }
      // Ensure health is not above maxHealth after bonuses
      if (this.stats.health > this.stats.maxHealth) {
        this.stats.health = this.stats.maxHealth;
      }
      if (this.stats.stamina > this.stats.maxStamina) {
        this.stats.stamina = this.stats.maxStamina;
      }
    } else {
      updateCombatLog("Initializing Hero with default stats (no archetype selected).");
    }

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
    console.log(message); // Keep console.log for debugging if desired
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

  learnSkill(skillId, skillType) {
    const skillPool = skillType === 'passive' ? PASSIVE_SKILLS : ACTIVE_SKILLS;
    const skill = skillPool[skillId];

    if (!skill) {
      updateCombatLog(`WARN: Attempted to learn unknown skill: ${skillId}`);
      return false;
    }

    const learnedSkills = skillType === 'passive' ? this.learnedPassiveSkills : this.learnedActiveSkills;

    if (learnedSkills.has(skillId)) {
      updateCombatLog(`INFO: Skill "${skill.name}" already learned.`);
      return false;
    }

    if (this.skillPoints < skill.cost) {
      updateCombatLog(`INFO: Not enough skill points to learn "${skill.name}". Needs ${skill.cost}, has ${this.skillPoints}.`);
      return false;
    }

    // TODO: Check prerequisites (skill.prereqs)

    this.skillPoints -= skill.cost;
    learnedSkills.set(skillId, 1); // Assuming level 1 for now

    updateCombatLog(`Learned ${skillType} skill: "${skill.name}"! Skill points remaining: ${this.skillPoints}`);

    // Apply immediate effects for passive skills
    if (skillType === 'passive' && skill.effect) {
      if (this.stats.hasOwnProperty(skill.effect.stat)) {
        this.stats[skill.effect.stat] += skill.effect.value;
        updateCombatLog(`Passive effect applied: ${skill.effect.stat} +${skill.effect.value}. New value: ${this.stats[skill.effect.stat]}`);
        // TODO: Potentially call a recalculateDerivedStats() method here if stats like maxHealth are affected
      } else {
        updateCombatLog(`WARN: Unknown stat ${skill.effect.stat} for passive skill ${skill.name}`);
      }
    }
    return true;
  }
} // End Hero Class