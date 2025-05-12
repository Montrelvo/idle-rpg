// --- Skill Definitions (Placeholders) ---
export const PASSIVE_SKILLS = {
  'increased_strength_1': { id: 'increased_strength_1', name: 'Might I', description: '+5 STR', effect: { stat: 'str', value: 5 }, cost: 1, prereqs: [] },
  'increased_health_1': { id: 'increased_health_1', name: 'Vitality I', description: '+20 Max Health', effect: { stat: 'maxHealth', value: 20 }, cost: 1, prereqs: [] },
  'increased_strength_2': { id: 'increased_strength_2', name: 'Might II', description: '+10 STR', effect: { stat: 'str', value: 10 }, cost: 2, prereqs: ['increased_strength_1'] }, // Requires Might I
};

export const ACTIVE_SKILLS = {
  'power_strike': { id: 'power_strike', name: 'Power Strike', description: 'Deals 150% STR damage.', cost: 1, staminaCost: 20, cooldown: 5000, effect: { type: 'damage', multiplier: 1.5, stat: 'str' }, prereqs: [] },
  'quick_heal': { id: 'quick_heal', name: 'Quick Heal', description: 'Heals for 30% Max Health.', cost: 1, staminaCost: 30, cooldown: 10000, effect: { type: 'heal', multiplier: 0.3, stat: 'maxHealth' }, prereqs: [] },
};
// --- End Skill Definitions ---

// --- Archetype Definitions ---
export const ARCHETYPES = {
 warrior: {
   name: 'Warrior',
   description: '+5 STR, +20 Max Health, +2 Defense.',
   bonuses: { str: 5, maxHealth: 20, health: 20, defense: 2 }
 },
 mage: {
   name: 'Mage',
   description: '+5 INT, +10 Max Stamina, +0.5 Stamina Regen.',
   bonuses: { int: 5, maxStamina: 10, stamina: 10, staminaRegen: 0.5 }
 },
 rogue: {
   name: 'Rogue',
   description: '+5 AGI. (Future: +Crit Chance, -Enemy Awareness)',
   bonuses: { agi: 5 }
   // TODO: Implement crit chance and enemy awareness for Rogue bonuses
 }
};
// --- End Archetype Definitions ---

// --- UI Utility Constants ---
export const MAX_LOG_MESSAGES = 20; // Max messages to display in combat log
// Note: combatLogElement itself is DOM-dependent and will be handled in ui_logger.js