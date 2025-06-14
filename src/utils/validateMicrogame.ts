import { MICROGAMES } from '../GameConfig';

/**
 * Validation utility for checking microgame implementations
 * Run this to ensure your microgame meets all requirements
 */

interface ValidationResult {
    passed: boolean;
    errors: string[];
    warnings: string[];
}

export class MicrogameValidator {
    private errors: string[] = [];
    private warnings: string[] = [];

    /**
     * Validate a microgame class
     */
    validateMicrogame(gameName: string, GameClass: any): ValidationResult {
        this.errors = [];
        this.warnings = [];

        // Check if class exists
        if (!GameClass) {
            this.errors.push(`Class ${gameName} not found`);
            return this.getResult();
        }

        // Check if it's registered in main.ts (would need to be checked manually)
        this.checkRegistration(gameName);

        // Check required methods
        this.checkRequiredMethods(GameClass);

        // Check method implementations
        this.checkMethodImplementations(GameClass);

        // Check if registered in MICROGAMES array
        this.checkMicrogamesArray(gameName);

        return this.getResult();
    }

    private checkRegistration(gameName: string): void {
        // This would need manual verification
        this.warnings.push(
            `Manual check required: Ensure ${gameName} is imported and added to scene array in main.ts`
        );
    }

    private checkRequiredMethods(GameClass: any): void {
        const instance = new GameClass();

        // Check abstract methods
        const requiredMethods = [
            'getPrompt',
            'getGameDuration',
            'setupGame',
            'setupControls',
            'cleanupControls'
        ];

        for (const method of requiredMethods) {
            if (typeof instance[method] !== 'function') {
                this.errors.push(`Missing required method: ${method}()`);
            }
        }
    }

    private checkMethodImplementations(GameClass: any): void {
        const instance = new GameClass();

        // Check getPrompt
        if (instance.getPrompt) {
            const prompt = instance.getPrompt();
            if (typeof prompt !== 'string') {
                this.errors.push('getPrompt() must return a string');
            } else if (prompt.length === 0) {
                this.errors.push('getPrompt() must return a non-empty string');
            } else if (prompt.length > 10) {
                this.warnings.push('getPrompt() should be 1-2 words (currently too long)');
            } else if (!prompt.endsWith('!')) {
                this.warnings.push('getPrompt() should end with exclamation mark (!)');
            }
        }

        // Check getGameDuration
        if (instance.getGameDuration) {
            const duration = instance.getGameDuration();
            if (typeof duration !== 'number') {
                this.errors.push('getGameDuration() must return a number');
            } else if (duration < 2000) {
                this.warnings.push('Game duration is very short (< 2 seconds)');
            } else if (duration > 7000) {
                this.warnings.push('Game duration is very long (> 7 seconds)');
            }
        }

        // Check constructor
        if (!instance.scene || !instance.scene.key) {
            this.errors.push('Constructor must call super({ key: "YourGameName" })');
        } else if (instance.scene.key !== GameClass.name) {
            this.errors.push(`Scene key "${instance.scene.key}" should match class name "${GameClass.name}"`);
        }
    }

    private checkMicrogamesArray(gameName: string): void {
        const entry = MICROGAMES.find(game => game.key === gameName);

        if (!entry) {
            this.errors.push(`Game not found in MICROGAMES array in GameConfig.ts`);
        } else {
            // Validate entry fields
            if (!entry.name || entry.name.length === 0) {
                this.errors.push('MICROGAMES entry missing "name" field');
            }
            if (!entry.prompt || entry.prompt.length === 0) {
                this.errors.push('MICROGAMES entry missing "prompt" field');
            }
            if (!entry.description || entry.description.length === 0) {
                this.errors.push('MICROGAMES entry missing "description" field');
            }
            if (!entry.controls || entry.controls.length === 0) {
                this.errors.push('MICROGAMES entry missing "controls" field');
            }

            // Check consistency
            if (entry.prompt) {
                // Note: We can't check this at compile time without running the game
                this.warnings.push(
                    'Manual check required: Ensure MICROGAMES prompt matches getPrompt() return value'
                );
            }
        }
    }

    private getResult(): ValidationResult {
        return {
            passed: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }
}

/**
 * Example usage:
 * 
 * import YourGame from './scenes/microgames/YourGame';
 * const validator = new MicrogameValidator();
 * const result = validator.validateMicrogame('YourGame', YourGame);
 * 
 * if (!result.passed) {
 *     console.error('Validation failed:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *     console.warn('Warnings:', result.warnings);
 * }
 */ 