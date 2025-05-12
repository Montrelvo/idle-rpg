export class LootTable {
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