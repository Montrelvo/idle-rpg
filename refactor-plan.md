# Refactoring Plan: Modularizing `game.js`

**Goal:** To break down the monolithic `game.js` into smaller, feature-specific ES6 modules, improving code organization, maintainability, and readability.

**Overview Diagram:**

```mermaid
graph TD
    A[Start Refactor] --> B{Phase 1: Setup};
    B --> C[1. Create src/ directory & subdirectories: config, utils, entities, systems, scenes];

    C --> D{Phase 2: Migrate Code to Modules};
    D --> E[2. Create src/config/constants.js];
    E --> F[3. Create src/utils/ui_logger.js];
    F --> G[4. Create src/entities/hero.js];
    G --> H[5. Create src/entities/enemy.js];
    H --> I[6. Create src/systems/loot_table.js];
    I --> J[7. Create src/systems/combat_manager.js];
    J --> K[8. Create src/scenes/main_scene.js];
    K --> L[9. Create src/main.js (New Entry Point)];

    L --> M{Phase 3: Finalize & Cleanup};
    M --> N[10. Update index.html to use src/main.js as module];
    N --> O[11. Verify all imports/exports and functionality];
    O --> P[12. Delete original game.js];
    P --> Q[Refactor Complete];
```

**Detailed Steps:**

**Phase 1: Setup**

1.  **Create Directory Structure:**
    *   In the project root (`c:\Users\menel\Desktop\idle-rpg`), create a new directory named `src`.
    *   Inside `src`, create the following subdirectories:
        *   `config`
        *   `utils`
        *   `entities`
        *   `systems`
        *   `scenes`

**Phase 2: Migrate Code to Modules**

For each step below, we will:
    a.  Create the new `.js` file in the specified location.
    b.  Copy the relevant code block from the current `game.js` into the new file.
    c.  Add necessary `export` statements in the new file.
    d.  Add necessary `import` statements in the new file, referencing other modules as they are created.

2.  **`src/config/constants.js`**
    *   **Content:** `PASSIVE_SKILLS`, `ACTIVE_SKILLS`, `ARCHETYPES`, `MAX_LOG_MESSAGES`.
    *   **Exports:** All these constants.
    *   **Imports:** None.

3.  **`src/utils/ui_logger.js`**
    *   **Content:** `updateCombatLog` function. The `combatLogElement` will be initialized within this module.
    *   **Exports:** `updateCombatLog` function.
    *   **Imports:** `MAX_LOG_MESSAGES` from `../config/constants.js`.

4.  **`src/entities/hero.js`**
    *   **Content:** `Hero` class.
    *   **Exports:** `Hero` class.
    *   **Imports:** `ARCHETYPES`, `PASSIVE_SKILLS`, `ACTIVE_SKILLS` from `../config/constants.js`; `updateCombatLog` from `../utils/ui_logger.js`.

5.  **`src/entities/enemy.js`**
    *   **Content:** `Enemy` class.
    *   **Exports:** `Enemy` class.
    *   **Imports:** `updateCombatLog` from `../utils/ui_logger.js`.

6.  **`src/systems/loot_table.js`**
    *   **Content:** `LootTable` class.
    *   **Exports:** `LootTable` class.
    *   **Imports:** None initially.

7.  **`src/systems/combat_manager.js`**
    *   **Content:** `CombatManager` class.
    *   **Exports:** `CombatManager` class.
    *   **Imports:** `Hero` from `../entities/hero.js`; `Enemy` from `../entities/enemy.js`; `LootTable` from `./loot_table.js`; `updateCombatLog` from `../utils/ui_logger.js`.

8.  **`src/scenes/main_scene.js`**
    *   **Content:** The Phaser `scene` object definition (the object assigned to `config.scene`, including `preload`, `create`, `update`, `populateSkillTreeUI`, and the `initializeGame` logic).
    *   **Exports:** The scene object (e.g., `export const mainScene = { ... };`).
    *   **Imports:** `CombatManager` from `../systems/combat_manager.js`; `ARCHETYPES`, `PASSIVE_SKILLS`, `ACTIVE_SKILLS` from `../config/constants.js`.

9.  **`src/main.js`** (New File - This will be the main entry point)
    *   **Content:** The Phaser `config` object and the `window.onload` logic.
    *   **Exports:** None (it's a top-level script).
    *   **Imports:** The scene object (e.g., `mainScene`) from `./scenes/main_scene.js`.
    *   **Example Content:**
        ```javascript
        import { mainScene } from './scenes/main_scene.js'; // Adjust if scene is default export

        const config = {
            type: Phaser.AUTO,
            parent: 'game-canvas', // from original game.js
            width: 800,            // from original game.js
            height: 600,           // from original game.js
            scene: mainScene       // Use the imported scene
        };

        window.onload = () => {
            const game = new Phaser.Game(config);
        };
        ```

**Phase 3: Finalize & Cleanup**

10. **Update `index.html`:**
    *   Locate the line `<script src="game.js"></script>`.
    *   Replace it with `<script type="module" src="src/main.js"></script>`.

11. **Verify Functionality:**
    *   Thoroughly test the game.

12. **Delete `game.js`:**
    *   Once everything is confirmed to be working correctly, the original `game.js` file can be deleted.