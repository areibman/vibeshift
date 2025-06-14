// Simple validation script for microgames
const fs = require('fs');
const path = require('path');

console.log('🎮 Validating VibeWare Microgames...\n');

// Read and parse files
function readFile(filePath) {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}

// Games to validate
const games = ['CatchGame', 'TypeGame', 'DodgeGame'];

// Read GameConfig to check registrations
const gameConfig = readFile('src/GameConfig.ts');
const mainFile = readFile('src/main.ts');

let allPassed = true;

games.forEach(gameName => {
    console.log(`\n${'='.repeat(30)} ${gameName} ${'='.repeat(30)}`);
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
        console.log('\nRequired Methods:');
        const requiredMethods = [
            'getPrompt',
            'getGameDuration',
            'setupGame',
            'setupControls',
            'cleanupControls'
        ];

        requiredMethods.forEach(method => {
            if (gameContent.includes(`${method}(`)) {
                console.log(`  ✓ ${method}()`);
            } else {
                errors.push(`Missing required method: ${method}()`);
                console.log(`  ✗ ${method}() - MISSING`);
            }
        });

        // Check constructor
        console.log('\nConstructor:');
        if (gameContent.includes(`super({ key: '${gameName}'`)) {
            console.log(`  ✓ Scene key matches class name: '${gameName}'`);
        } else {
            warnings.push(`Scene key should match class name: ${gameName}`);
            console.log(`  ⚠ Scene key might not match class name`);
        }

        // Check win/lose states
        console.log('\nGame States:');
        const hasWinState = gameContent.includes('setWinState()');
        const hasFailState = gameContent.includes('setFailState()');

        if (hasWinState) console.log('  ✓ Uses setWinState()');
        if (hasFailState) console.log('  ✓ Uses setFailState()');

        if (!hasWinState && !hasFailState) {
            warnings.push('Game should call setWinState() or setFailState()');
            console.log('  ⚠ No win/fail states found');
        }

        // Check cleanup
        console.log('\nCleanup:');
        if (gameContent.includes('cleanupControls(): void {')) {
            const cleanupMethod = gameContent.substring(
                gameContent.indexOf('cleanupControls(): void {'),
                gameContent.indexOf('}', gameContent.indexOf('cleanupControls(): void {')) + 1
            );

            if (cleanupMethod.includes('.off(') || cleanupMethod.includes('.remove()') ||
                cleanupMethod.includes('// Cursor keys are automatically cleaned up')) {
                console.log('  ✓ cleanupControls() has cleanup logic');
            } else if (cleanupMethod.trim().endsWith('{}')) {
                warnings.push('cleanupControls() appears to be empty');
                console.log('  ⚠ cleanupControls() might be empty');
            }
        }
    }

    // Check registration in GameConfig
    console.log('\nRegistration:');
    if (gameConfig.includes(`key: '${gameName}'`)) {
        console.log('  ✓ Registered in MICROGAMES array');

        // Extract the game entry to check all fields
        const gameEntry = gameConfig.match(new RegExp(`{[^}]*key: '${gameName}'[^}]*}`, 's'));
        if (gameEntry) {
            const entry = gameEntry[0];
            if (entry.includes('name:')) console.log('  ✓ Has name field');
            if (entry.includes('prompt:')) console.log('  ✓ Has prompt field');
            if (entry.includes('description:')) console.log('  ✓ Has description field');
            if (entry.includes('controls:')) console.log('  ✓ Has controls field');
        }
    } else {
        errors.push('Not registered in MICROGAMES array in GameConfig.ts');
        console.log('  ✗ Not in MICROGAMES array');
    }

    // Check registration in main.ts
    if (mainFile.includes(`import ${gameName}`) && mainFile.includes(`${gameName}`)) {
        console.log('  ✓ Imported and registered in main.ts');
    } else {
        errors.push('Not imported or registered in main.ts scene array');
        console.log('  ✗ Not properly registered in main.ts');
    }

    // Report results
    console.log('\n📊 Summary:');
    if (errors.length === 0) {
        console.log('✅ Validation PASSED');
        console.log(`   ${passes.length} checks passed`);
    } else {
        console.log('❌ Validation FAILED');
        allPassed = false;
        console.log(`\n❌ Errors (${errors.length}):`);
        errors.forEach(error => console.log(`   - ${error}`));
    }

    if (warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${warnings.length}):`);
        warnings.forEach(warning => console.log(`   - ${warning}`));
    }
});

console.log('\n' + '='.repeat(70));
console.log('📈 FINAL RESULTS:');
if (allPassed) {
    console.log('✅ All microgames passed validation!');
} else {
    console.log('❌ Some microgames failed validation.');
}
console.log('='.repeat(70));

process.exit(allPassed ? 0 : 1); 