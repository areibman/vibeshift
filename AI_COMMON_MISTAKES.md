# Common AI Mistakes When Creating Microgames

## Top 10 Mistakes to Avoid

### 1. ❌ Forgetting to Register the Game
**Wrong**: Creating the game file but not registering it
**Right**: Must update BOTH:
- Import and add to scene array in `src/main.ts`
- Add entry to MICROGAMES array in `src/GameConfig.ts`

### 2. ❌ Not Cleaning Up Event Listeners
**Wrong**:
```typescript
setupControls(): void {
    this.input.on('pointermove', this.handleMove, this);
}

cleanupControls(): void {
    // Empty or missing cleanup
}
```

**Right**:
```typescript
cleanupControls(): void {
    this.input.off('pointermove', this.handleMove, this);
}
```

### 3. ❌ Managing Timer/Score/Lives
**Wrong**: Creating your own timer or score system
**Right**: BaseMicrogame handles all of this - just call setWinState() or setFailState()

### 4. ❌ Scene Key Mismatch
**Wrong**:
```typescript
export default class ClickGame extends BaseMicrogame {
    constructor() {
        super({ key: 'MyClickGame' }); // Key doesn't match class name
    }
}
```

**Right**:
```typescript
export default class ClickGame extends BaseMicrogame {
    constructor() {
        super({ key: 'ClickGame' }); // Key matches class name exactly
    }
}
```

### 5. ❌ Using Hard-Coded Positions
**Wrong**:
```typescript
this.player = this.add.rectangle(400, 300, 50, 50); // Hard-coded
```

**Right**:
```typescript
this.player = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 50, 50);
```

### 6. ❌ Complex Win Conditions
**Wrong**: Multi-step objectives or unclear goals
**Right**: Single, clear objective (catch ONE thing, dodge for X seconds, type ONE word)

### 7. ❌ Forgetting Physics Setup
**Wrong**:
```typescript
setupGame(): void {
    this.player = this.add.rectangle(100, 100, 50, 50);
    this.physics.add.existing(this.player); // Error: physics might not be configured
}
```

**Right**:
```typescript
setupGame(): void {
    // Enable physics if needed
    this.physics.world.gravity.y = 300; // Or 0 for no gravity
    
    this.player = this.add.rectangle(100, 100, 50, 50);
    this.physics.add.existing(this.player);
}
```

### 8. ❌ Not Handling Game End State
**Wrong**: Continuing to process input after setWinState() or setFailState()
**Right**: Check `this.gameEnded` before processing input in onGameUpdate()

### 9. ❌ Wrong Import Paths
**Wrong**:
```typescript
import { COLORS } from '../GameConfig'; // Wrong path
import BaseMicrogame from './BaseMicrogame'; // Wrong path
```

**Right**:
```typescript
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';
import BaseMicrogame from '../BaseMicrogame';
```

### 10. ❌ Missing Type Definitions
**Wrong**:
```typescript
private player; // No type
private speed = 100; // Implicit any
```

**Right**:
```typescript
private player!: Phaser.GameObjects.Rectangle;
private speed: number = 100;
```

## Quick Validation Checklist

Before submitting:
- [ ] Does `npm run build` pass without errors?
- [ ] Is the game registered in BOTH main.ts and GameConfig.ts?
- [ ] Are all event listeners cleaned up?
- [ ] Does the game end properly (win or lose)?
- [ ] Is the objective immediately clear?
- [ ] Does the prompt end with '!'?
- [ ] Are positions using GAME_WIDTH/HEIGHT constants?
- [ ] Is the scene key identical to the class name?

## Remember
- Keep it SIMPLE - players have 3-5 seconds
- One clear objective
- Immediate feedback
- Clean up everything 