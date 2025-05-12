import { mainScene } from './scenes/main_scene.js';
import { initializeCombatLogElement } from './utils/ui_logger.js'; // Import the initializer

const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 600,
    scene: mainScene,
    // It's good practice to ensure DOM elements are ready before Phaser tries to use them,
    // especially for things like the 'parent' div.
    // Phaser's 'DOMContentLoaded' event can also be used, but window.onload is simpler here.
};

window.onload = () => {
    // Initialize DOM-dependent utilities before starting Phaser
    // This ensures 'combat-log' element is found by ui_logger.js when it's first needed.
    initializeCombatLogElement(); 

    const game = new Phaser.Game(config);
};