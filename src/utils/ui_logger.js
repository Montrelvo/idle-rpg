import { MAX_LOG_MESSAGES } from '../config/constants.js';

// Initialize combatLogElement here, as it's specific to this utility's DOM interaction.
// This assumes the DOM is ready or will be ready when this module is first used.
// A more robust solution might involve passing the element or initializing it on demand.
let combatLogElement = null;

// Function to initialize the combat log element, can be called when DOM is ready
export function initializeCombatLogElement() {
    combatLogElement = document.getElementById('combat-log');
    if (!combatLogElement) {
        console.warn("Combat log element 'combat-log' not found during initialization.");
    }
}

export function updateCombatLog(message) {
    if (!combatLogElement) {
        // Attempt to initialize if not already done, or if it failed previously
        initializeCombatLogElement();
        if (!combatLogElement) { // Still not found
            console.warn("Combat log element not found! Message not logged to UI:", message);
            return;
        }
    }

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    
    // Add the new message to the top (which appears as bottom due to flex-direction: column-reverse)
    combatLogElement.insertBefore(messageElement, combatLogElement.firstChild);

    // Limit the number of messages
    while (combatLogElement.children.length > MAX_LOG_MESSAGES) {
        combatLogElement.removeChild(combatLogElement.lastChild);
    }
}

// --- End UI Utility Functions --- 
// (Comment from original file, kept for context if needed, can be removed)