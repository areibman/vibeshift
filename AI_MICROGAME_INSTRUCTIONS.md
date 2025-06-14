# AI Agent Instructions for Creating VibeWare Microgames

## Overview
You are tasked with creating a new microgame for VibeWare, a WarioWare-style game collection. Each microgame is a quick challenge lasting 3-5 seconds that players must complete.

## Required Context Files

### 1. Core Files (MUST READ)
- `src/scenes/BaseMicrogame.ts` - The abstract base class you must extend
- `src/GameConfig.ts` - Contains constants, types, and the MICROGAMES array
- `src/main.ts` - Shows how scenes are registered

### 2. Example Implementation Files (READ AT LEAST ONE)
- `src/scenes/microgames/CatchGame.ts` - Mouse-controlled catching game
- `src/scenes/microgames/TypeGame.ts` - Keyboard-based typing game  
- `src/scenes/microgames/DodgeGame.ts` - Arrow-key dodging game

### 3. Configuration Reference
- `tsconfig.json` - TypeScript configuration (strict mode enabled)

## Implementation Requirements

### 1. File Structure
```
src/scenes/microgames/YourGameName.ts
```

### 2. Class Template
```typescript
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';
import BaseMicrogame from '../BaseMicrogame';

export default class YourGameName extends BaseMicrogame {
    // Private properties for game objects
    private yourGameObject!: Phaser.GameObjects.Type;
    
    constructor() {
        super({ key: 'YourGameName' }); // Key must match class name
    }

    getPrompt(): string {
        return 'ACTION!'; // 1-2 word instruction (e.g., "CATCH!", "DODGE!")
    }

    getGameDuration(): number {
        return 5000; // 3000-5000ms typical, can adjust for difficulty
    }

    setupGame(): void {
        // Create all game objects here
        // Use this.add for Phaser objects
        // Enable physics if needed: this.physics.world.gravity.y = value;
    }

    setupControls(): void {
        // Set up ALL input handlers
        // Mouse: this.input.on('pointermove', handler, this);
        // Keyboard: this.cursors = this.input.keyboard!.createCursorKeys();
    }

    cleanupControls(): void {
        // CRITICAL: Remove ALL event listeners
        // this.input.off('eventname', handler, this);
        // Stop any timers: if (this.timer) this.timer.remove();
    }

    protected onGameUpdate(time: number, delta: number): void {
        // Optional: Frame-by-frame logic
        // Check win/lose conditions
        // Call this.setWinState() or this.setFailState()
    }
}
```

### 3. Game Registration
After creating your game file, you must:

1. Import it in `src/main.ts`:
```typescript
import YourGameName from './scenes/microgames/YourGameName';
```

2. Add to the scene array in `src/main.ts`:
```typescript
scene: [
    TitleScene,
    TransitionScene,
    DebugMenuScene,
    CatchGame,
    TypeGame,
    DodgeGame,
    YourGameName // Add here
],
```

3. Add to MICROGAMES array in `src/GameConfig.ts`:
```typescript
{
    key: 'YourGameName',
    name: 'Descriptive Name',
    prompt: 'ACTION!',
    description: 'Brief description of gameplay',
    controls: 'Mouse: Move left/right' // or 'Arrow keys: Move' etc.
}
```

## Validation Checklist

### TypeScript Compilation ✓
- [ ] No TypeScript errors
- [ ] All required abstract methods implemented
- [ ] Proper types for all Phaser objects
- [ ] No unused variables (strict mode)

### Required Methods ✓
- [ ] `getPrompt()` returns a string
- [ ] `getGameDuration()` returns a number (3000-5000 typical)
- [ ] `setupGame()` creates all game objects
- [ ] `setupControls()` sets up input handling
- [ ] `cleanupControls()` removes ALL event listeners

### Game Logic ✓
- [ ] Win condition calls `this.setWinState()`
- [ ] Fail condition calls `this.setFailState()`
- [ ] Game is completable within the duration
- [ ] Clear visual feedback for player actions

### Input Handling ✓
- [ ] Controls match the type specified in MICROGAMES config
- [ ] ALL event listeners are cleaned up in `cleanupControls()`
- [ ] Input is disabled after game ends

### Visual Requirements ✓
- [ ] Uses GAME_WIDTH (800) and GAME_HEIGHT (600) constants
- [ ] Visual elements use COLORS from GameConfig when appropriate
- [ ] Clear, immediate visual feedback

### Common Pitfalls to Avoid ❌
- [ ] DON'T handle timer - BaseMicrogame does this
- [ ] DON'T manage score/lives - BaseMicrogame does this
- [ ] DON'T transition scenes - BaseMicrogame does this
- [ ] DON'T forget to clean up timers/listeners
- [ ] DON'T use absolute positions - use GAME_WIDTH/HEIGHT

## Testing Instructions

1. Run `npm run validate` - Automated validation checks
2. Run `npm run build` - Must compile without errors
3. Run `npm run dev` - Start development server
4. Press 'D' on title screen for debug menu
5. Select your game and test:
   - Can you win?
   - Can you lose?
   - Does it end properly?
   - Are controls responsive?

## Validation Script

The project includes an automated validation script that checks:
- All required methods are implemented
- Proper class inheritance from BaseMicrogame
- Scene key matches class name
- Game is registered in both main.ts and GameConfig.ts
- Win/fail states are implemented
- Cleanup logic exists
- All required metadata fields are present

Run validation with: `npm run validate`

## Example Analysis

### CatchGame.ts Pattern
- Mouse-controlled
- Physics-based falling objects
- Win: Catch object
- Fail: Object hits ground
- Spawns objects with timer

### TypeGame.ts Pattern  
- Keyboard input
- Text display and comparison
- Win: Type word correctly
- Fail: Time runs out
- Character-by-character feedback

### DodgeGame.ts Pattern
- Arrow key movement
- Physics projectiles
- Win: Survive duration
- Fail: Get hit
- Progressive difficulty

## Final Notes

- Keep it simple - players have 3-5 seconds
- One clear objective
- Instant visual feedback
- Test multiple times
- Consider edge cases (spam clicking, holding keys, etc.)

Remember: The game should be immediately understandable and playable within seconds! 