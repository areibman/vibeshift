// Validation script for microgames
const fs = require('fs');
const path = require('path');

// Accept game name as argument
const gameName = process.argv[2];

if (!gameName) {
    console.error('Usage: node validateGames.cjs <GameName>');
    process.exit(1);
}

console.log(`🎮 Validating ${gameName}...\n`);

// Read and parse files
function readFile(filePath) {
    try {
        return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    } catch (e) {
        return null;
    }
}

// Read GameConfig to check registrations
const gameConfig = readFile('src/GameConfig.ts');
const mainFile = readFile('src/main.ts');

let errors = [];
let warnings = [];
let passes = [];

// Check if game file exists
const gamePath = `src/scenes/microgames/${gameName}.ts`;
if (!fs.existsSync(path.join(__dirname, gamePath))) {
    errors.push(`Game file not found: ${gamePath}`);
} else {
    passes.push(`✓ Game file exists: ${gamePath}`);
    const gameContent = readFile(gamePath);

    // Check if extends BaseMicrogame
    if (gameContent.includes('extends BaseMicrogame')) {
        passes.push('✓ Extends BaseMicrogame class');
    } else {
        errors.push('Must extend BaseMicrogame class');
    }

    // Check imports
    if (gameContent.includes("from '../BaseMicrogame'")) {
        passes.push('✓ Imports BaseMicrogame correctly');
    } else {
        errors.push('Must import BaseMicrogame');
    }

    // Check required methods
    const requiredMethods = [
        'getPrompt',
        'getGameDuration',
        'setupGame',
        'setupControls',
        'cleanupControls'
    ];

    requiredMethods.forEach(method => {
        if (gameContent.includes(`${method}(`)) {
            passes.push(`✓ Has ${method}() method`);
        } else {
            errors.push(`Missing required method: ${method}()`);
        }
    });

    // Check constructor
    if (gameContent.includes(`super({ key: '${gameName}'`)) {
        passes.push(`✓ Scene key matches class name: '${gameName}'`);
    } else {
        errors.push(`Scene key must match class name: ${gameName}`);
    }

    // Check win/lose states
    const hasWinState = gameContent.includes('setWinState()');
    const hasFailState = gameContent.includes('setFailState()');

    if (hasWinState || hasFailState) {
        passes.push('✓ Has win/fail state handling');
    } else {
        warnings.push('Game should call setWinState() or setFailState()');
    }

    // Check cleanup
    if (gameContent.includes('cleanupControls(): void {')) {
        const cleanupMethod = gameContent.substring(
            gameContent.indexOf('cleanupControls(): void {'),
            gameContent.indexOf('}', gameContent.indexOf('cleanupControls(): void {')) + 1
        );

        if (cleanupMethod.includes('.off(') || cleanupMethod.includes('.remove()') ||
            cleanupMethod.includes('// Cursor keys are automatically cleaned up')) {
            passes.push('✓ cleanupControls() has cleanup logic');
        } else if (cleanupMethod.trim().endsWith('{}')) {
            warnings.push('cleanupControls() appears to be empty');
        }
    }
}

// Check registration in registry
const registryFile = readFile('src/scenes/microgames/registry.ts');
if (registryFile) {
    // Check import
    if (registryFile.includes(`import ${gameName} from './${gameName}'`)) {
        passes.push('✓ Imported in registry');
    } else {
        errors.push('Not imported in registry.ts');
    }

    // Check in MICROGAME_SCENES array
    if (registryFile.includes(gameName + ',') || registryFile.includes(gameName + '\n')) {
        passes.push('✓ Added to MICROGAME_SCENES array');
    } else {
        errors.push('Not added to MICROGAME_SCENES array in registry.ts');
    }

    // Check metadata
    if (registryFile.includes(`key: '${gameName}'`)) {
        passes.push('✓ Metadata added to MICROGAME_METADATA');
    } else {
        errors.push('Metadata not added to MICROGAME_METADATA in registry.ts');
    }
} else {
    errors.push('Could not read registry.ts');
}

// Report results
const success = errors.length === 0;

if (success) {
    console.log('✅ Validation PASSED');
    console.log(`   ${passes.length} checks passed`);
} else {
    console.log('❌ Validation FAILED');
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(error => console.log(`   - ${error}`));
}

if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(warning => console.log(`   - ${warning}`));
}

// Exit with appropriate code
process.exit(success ? 0 : 1); 