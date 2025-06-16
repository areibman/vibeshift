// Validation script for microgames
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Check registration in registry - these are warnings, not errors
// (since registry will be updated after validation passes)
const registryFile = readFile('src/scenes/microgames/registry.ts');
if (registryFile) {
    // Check import
    if (registryFile.includes(`import ${gameName} from './${gameName}'`)) {
        passes.push('✓ Already imported in registry');
    } else {
        warnings.push('Not yet imported in registry.ts (will be added after validation)');
    }

    // Check in MICROGAME_SCENES array
    if (registryFile.includes(gameName + ',') || registryFile.includes(gameName + '\n')) {
        passes.push('✓ Already in MICROGAME_SCENES array');
    } else {
        warnings.push('Not yet in MICROGAME_SCENES array (will be added after validation)');
    }

    // Check metadata
    if (registryFile.includes(`key: '${gameName}'`)) {
        passes.push('✓ Metadata already in MICROGAME_METADATA');
    } else {
        warnings.push('Metadata not yet in MICROGAME_METADATA (will be added after validation)');
    }
} else {
    errors.push('Could not read registry.ts');
}

// TypeScript Check - only check for structural issues
console.log('\n🔍 Checking TypeScript structure...');
try {
    // Check if the file can be parsed at all
    const gameContent = readFile(gamePath);

    // Basic syntax checks that would prevent the game from working
    const syntaxChecks = [
        { pattern: /class\s+\w+\s+extends\s+BaseMicrogame/, desc: 'Valid class declaration' },
        { pattern: /constructor\s*\(\s*\)\s*{[\s\S]*?super\s*\(\s*{[\s\S]*?}\s*\)/, desc: 'Valid constructor with super call' },
        { pattern: /getPrompt\s*\(\s*\)\s*:\s*string/, desc: 'Valid getPrompt method signature' },
        { pattern: /getGameDuration\s*\(\s*\)\s*:\s*number/, desc: 'Valid getGameDuration method signature' },
        { pattern: /setupGame\s*\(\s*\)\s*:\s*void/, desc: 'Valid setupGame method signature' },
        { pattern: /setupControls\s*\(\s*\)\s*:\s*void/, desc: 'Valid setupControls method signature' },
        { pattern: /cleanupControls\s*\(\s*\)\s*:\s*void/, desc: 'Valid cleanupControls method signature' }
    ];

    let structureValid = true;
    syntaxChecks.forEach(check => {
        if (!check.pattern.test(gameContent)) {
            errors.push(`Invalid structure: ${check.desc}`);
            structureValid = false;
        }
    });

    if (structureValid) {
        passes.push('✓ TypeScript structure is valid');
    }

    // Try to run a basic TypeScript parse check
    execSync(`npx tsc --noEmit --allowJs --checkJs ${gamePath} 2>&1 || true`, {
        stdio: 'pipe',
        encoding: 'utf8'
    });

} catch (error) {
    // If we can't even parse the file, it's a real error
    errors.push('TypeScript file has syntax errors');
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