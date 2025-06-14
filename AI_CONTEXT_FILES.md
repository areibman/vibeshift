# AI Agent Context Files for Microgame Development

## Essential Files to Include in Context

### 1. Core Implementation Files
```
src/scenes/BaseMicrogame.ts      # REQUIRED - Abstract base class
src/GameConfig.ts                # REQUIRED - Constants and MICROGAMES array  
src/main.ts                      # REQUIRED - Scene registration
tsconfig.json                    # REQUIRED - TypeScript config
```

### 2. Example Microgame (Include at least ONE)
```
src/scenes/microgames/CatchGame.ts   # Mouse-controlled example
src/scenes/microgames/TypeGame.ts    # Keyboard input example
src/scenes/microgames/DodgeGame.ts   # Arrow keys example
```

### 3. Documentation
```
AI_MICROGAME_INSTRUCTIONS.md     # Full implementation guide
```

### 4. Validation (Optional but recommended)
```
src/utils/validateMicrogame.ts   # Validation utility
```

## Minimal Context Command

For an AI agent, provide these files in this order:

1. `src/scenes/BaseMicrogame.ts` - Shows what to extend
2. `src/GameConfig.ts` - Shows constants and registration format
3. `src/main.ts` - Shows scene array structure
4. One example game (e.g., `src/scenes/microgames/CatchGame.ts`)
5. `AI_MICROGAME_INSTRUCTIONS.md` - Complete guide

## Validation Steps

After the AI generates a microgame, check:

1. **TypeScript compilation**: `npm run build`
2. **All abstract methods implemented**: getPrompt, getGameDuration, setupGame, setupControls, cleanupControls
3. **Game registered in two places**:
   - Imported and added to scene array in `src/main.ts`
   - Added to MICROGAMES array in `src/GameConfig.ts`
4. **Cleanup**: All event listeners removed in cleanupControls()
5. **Win/Lose**: Calls this.setWinState() or this.setFailState()

## Quick Test

```bash
npm run validate  # Run automated validation
npm run build     # Must pass TypeScript compilation
npm run dev       # Start game
# Press 'D' for debug menu
# Test the new game
``` 