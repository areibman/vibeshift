import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';
import BaseMicrogame from '../BaseMicrogame';

export default class ClickGame extends BaseMicrogame {
    private target!: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'ClickGame' });
    }

    getPrompt(): string {
        return 'CLICK!';
    }

    getGameDuration(): number {
        return 4000; // 4 seconds
    }

    setupGame(): void {
        this.createBackground();
        this.createTarget();
    }

    setupControls(): void {
        this.input.on('pointerdown', this.handleClick, this);
    }

    cleanupControls(): void {
        this.input.off('pointerdown', this.handleClick, this);
    }

    resetGameState(): void {
        // No persistent state to reset
    }

    protected onGameUpdate(time: number, delta: number): void {
        // No additional update logic needed
    }

    private createBackground() {
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.background);
    }

    private createTarget() {
        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const y = Phaser.Math.Between(50, GAME_HEIGHT - 50);
        this.target = this.add.rectangle(x, y, 50, 50, COLORS.neon.yellow);
        this.target.setInteractive();
    }

    private handleClick(pointer: Phaser.Input.Pointer) {
        if (this.target.getBounds().contains(pointer.x, pointer.y)) {
            this.setWinState();
        } else {
            this.setFailState();
        }
    }
}