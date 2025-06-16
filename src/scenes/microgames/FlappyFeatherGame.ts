import Phaser from 'phaser';
import BaseMicrogame from '../BaseMicrogame';
import { GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';

export default class FlappyFeatherGame extends BaseMicrogame {
    private feather!: Phaser.GameObjects.Ellipse;
    private velocityY: number = 0;
    private gravity: number = 200;
    private flapStrength: number = -300;
    private featherMaxY: number = GAME_HEIGHT - 50;

    constructor() {
        super({ key: 'FlappyFeatherGame' });
    }

    getPrompt(): string {
        return 'FLAP!';
    }

    getGameDuration(): number {
        return 4000; // 4 seconds
    }

    setupGame(): void {
        this.createBackground();
        this.createFeather();
    }

    setupControls(): void {
        this.input.on('pointerdown', this.flap, this);
    }

    cleanupControls(): void {
        this.input.off('pointerdown', this.flap, this);
    }

    resetGameState(): void {
        this.velocityY = 0;
    }

    protected onGameUpdate(_time: number, delta: number): void {
        if (!this.hasFailed) {
            this.velocityY += this.gravity * (delta / 1000);
            this.feather.y += this.velocityY * (delta / 1000);

            if (this.feather.y > this.featherMaxY) {
                this.feather.y = this.featherMaxY;
                this.showFailureFeedback();
                this.setFailState();
            }

            if (this.feather.y < 0) {
                this.feather.y = 0;
                this.showFailureFeedback();
                this.setFailState();
            }

            // Win condition - Feather remains aloft within bounds during the game's duration
            if (this.timeRemaining <= 0 && this.feather.y > 0 && this.feather.y < this.featherMaxY) {
                this.setWinState();
            }
        }
    }

    private flap(): void {
        this.velocityY = this.flapStrength;
    }

    private createBackground() {
        this.createStandardBackground(0x87CEEB, 0xFFE5B4);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Keep the Feather Flying!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    private createFeather() {
        this.feather = this.add.ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, 10, 40, 0xFFFDD0);
        this.feather.setStrokeStyle(2, 0xE6D7C3);
        this.tweens.add({
            targets: this.feather,
            angle: { from: -10, to: 10 },
            duration: 800,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    protected showSuccessFeedback(): void {
        const successText = this.add.text(GAME_WIDTH / 2, this.feather.y - 30, 'Amazing Flap!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: successText,
            alpha: 1,
            duration: 300,
            ease: 'Back.out',
            yoyo: true,
            onComplete: () => successText.destroy()
        });
    }

    protected showFailureFeedback(): void {
        const failText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Feather Down!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: failText,
            alpha: 1,
            duration: 300,
            ease: 'Back.out',
            yoyo: true,
            onComplete: () => failText.destroy()
        });

        this.cameras.main.shake(200, 0.02);
    }
}