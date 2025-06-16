
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';
import BaseMicrogame from '../BaseMicrogame';

export default class SneezeShieldGame extends BaseMicrogame {
    private face!: Phaser.GameObjects.Ellipse;
    private nose!: Phaser.GameObjects.Ellipse;
    private tissue!: Phaser.GameObjects.Rectangle;
    private sneezeTimer!: Phaser.Time.TimerEvent;
    private sneezeInProgress: boolean = false;

    constructor() {
        super({ key: 'SneezeShieldGame' });
    }

    getPrompt(): string {
        return 'BLOCK!';
    }

    getGameDuration(): number {
        return 4000; // 4 seconds
    }

    setupGame(): void {
        // Create face with a nose
        this.createFace();

        // Create tissue
        this.createTissue();

        // Start the sneeze countdown
        this.sneezeTimer = this.time.delayedCall(3000, () => this.triggerSneeze(), [], this);
    }

    setupControls(): void {
        this.input.on('pointermove', this.moveTissue, this);
    }

    cleanupControls(): void {
        this.input.off('pointermove', this.moveTissue, this);
        if (this.sneezeTimer) {
            this.sneezeTimer.remove();
        }
    }

    resetGameState(): void {
        // Reset sneezing state
        this.sneezeInProgress = false;
    }

    private createFace() {
        // Create a humorous face with a big nose
        this.face = this.add.ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, 150, 200, 0xFFE4B2);
        this.nose = this.add.ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 50, 70, 0xFFCC99);
        
        // Add twitch animation to the face
        this.tweens.add({
            targets: this.face,
            x: '+=10',
            duration: 100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createTissue() {
        // Create a tissue paper
        this.tissue = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 80, 40, 0xFFFFFF);
        this.tissue.setStrokeStyle(2, 0xDDDDDD);

        // Add physics to tissue
        this.physics.add.existing(this.tissue, true);
    }

    private moveTissue(pointer: Phaser.Input.Pointer) {
        this.tissue.x = Phaser.Math.Clamp(pointer.x, 40, GAME_WIDTH - 40);
        this.tissue.y = Phaser.Math.Clamp(pointer.y, 40, GAME_HEIGHT - 40);
    }

    private triggerSneeze() {
        this.sneezeInProgress = true;

        // Check the position of the tissue
        if (this.tissue.getBounds().contains(this.nose.x, this.nose.y + 10)) {
            this.setWinState();
        } else {
            this.setFailState();
        }
    }

    protected onGameUpdate(time: number, delta: number): void {
        // Optional: Additional frame-based logic
    }

    protected showSuccessFeedback(): void {
        const blockedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'BLOCKED!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: blockedText,
            alpha: 1,
            scaleX: { from: 0, to: 1.2 },
            scaleY: { from: 0, to: 1.2 },
            duration: 300,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: blockedText,
            alpha: 0,
            duration: 500,
            delay: 1500,
            onComplete: () => blockedText.destroy()
        });
        
        // Create an animation of the face smiling when the sneeze is blocked
        this.tweens.add({
            targets: this.face,
            scale: 1.1,
            duration: 150,
            yoyo: true
        });
    }

    protected showFailureFeedback(): void {
        const splatText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SPLAT!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: splatText,
            alpha: 1,
            scaleX: { from: 2, to: 1 },
            scaleY: { from: 2, to: 1 },
            duration: 300,
            ease: 'Back.out'
        });

        // Create sneeze spray animation if the block fails
        const spray = this.add.particles('blue').createEmitter({
            x: this.nose.x,
            y: this.nose.y + 10,
            angle: { min: 0, max: 360 },
            speed: 100,
            lifespan: { min: 200, max: 400 },
            tint: [0xabcdef, 0xfedcba],
            scale: { start: 0.5, end: 0 },
            quantity: 10
        });

        this.tweens.add({
            targets: spray,
            alpha: 0,
            scale: 0,
            duration: 1000,
            onComplete: () => spray.kill()
        });

        // Fade out
        this.tweens.add({
            targets: splatText,
            alpha: 0,
            duration: 500,
            delay: 1500,
            onComplete: () => splatText.destroy()
        });

        // Camera shake to enhance the effect of missing the sneeze
        this.cameras.main.shake(200, 0.02);
    }
}
