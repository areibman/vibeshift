import Phaser from 'phaser';
import BaseMicrogame from '../BaseMicrogame';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../../GameConfig';

interface Heart {
    sprite: Phaser.GameObjects.Text;
    x: number;
    y: number;
    vy: number;
    life: number;
}

export default class PetDogGame extends BaseMicrogame {
    private pettingProgress: number = 0;
    private hearts: Heart[] = [];
    private isSpacePressed: boolean = false;
    private dogSprite!: Phaser.GameObjects.Container;
    private progressBar!: Phaser.GameObjects.Rectangle;
    private progressBarBg!: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'PetDogGame' });
    }

    getPrompt(): string {
        return 'PET!';
    }

    getGameDuration(): number {
        return 5000;
    }

    setupGame(): void {
        // Create sky background
        this.createStandardBackground(0x87CEEB, 0xFFE5B4);

        // Create progress bar
        this.progressBarBg = this.add.rectangle(GAME_WIDTH / 2, 50, 400, 20, 0x333333);
        this.progressBar = this.add.rectangle(GAME_WIDTH / 2, 50, 0, 20, COLORS.success);

        // Create dog container
        this.dogSprite = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        // Dog body
        const body = this.add.ellipse(0, 50, 100, 80, 0xB5651D);
        const head = this.add.circle(0, 0, 45, 0xB5651D);
        
        // Dog ears
        const leftEar = this.add.ellipse(-30, -25, 36, 60, 0xA0541A);
        const rightEar = this.add.ellipse(30, -25, 36, 60, 0xA0541A);

        // Dog face
        const snout = this.add.ellipse(0, 20, 44, 30, 0xD4A574);
        const nose = this.add.ellipse(0, 15, 10, 8, 0x000000);
        const leftEye = this.add.circle(-15, 0, 6, 0x000000);
        const rightEye = this.add.circle(15, 0, 6, 0x000000);

        // Add all parts to container
        this.dogSprite.add([body, head, leftEar, rightEar, snout, nose, leftEye, rightEye]);

        // Add instruction text
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, 'Hold SPACEBAR to pet the dog!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);
    }

    setupControls(): void {
        const keyboard = this.input.keyboard;
        if (!keyboard) return;

        keyboard.on('keydown-SPACE', () => {
            if (!this.isSpacePressed) {
                this.isSpacePressed = true;
            }
        });

        keyboard.on('keyup-SPACE', () => {
            this.isSpacePressed = false;
            if (!this.hasWon) {
                this.setFailState();
            }
        });
    }

    cleanupControls(): void {
        const keyboard = this.input.keyboard;
        if (!keyboard) return;
        keyboard.removeAllListeners();
    }

    private addHeart(): void {
        const heart = this.add.text(
            this.dogSprite.x + (Math.random() * 100 - 50),
            this.dogSprite.y,
            '❤️',
            { fontSize: '32px' }
        );

        this.hearts.push({
            sprite: heart,
            x: heart.x,
            y: heart.y,
            vy: -2,
            life: 100
        });
    }

    protected onGameUpdate(time: number, delta: number): void {
        if (this.isSpacePressed && !this.hasWon) {
            // Update petting progress
            this.pettingProgress = Math.min(100, this.pettingProgress + 1 * this.gameState.speed);
            this.progressBar.setDisplaySize((this.pettingProgress / 100) * 400, 20);

            // Add hearts periodically
            if (time % 500 < 16) {
                this.addHeart();
            }

            // Wiggle dog
            this.dogSprite.setRotation(Math.sin(time / 100) * 0.05);

            // Check win condition
            if (this.pettingProgress >= 100) {
                this.setWinState();
            }
        }

        // Update hearts
        this.hearts = this.hearts.filter(heart => {
            heart.y += heart.vy;
            heart.life -= 1;
            heart.sprite.setPosition(heart.x, heart.y);
            heart.sprite.setAlpha(heart.life / 100);

            if (heart.life <= 0) {
                heart.sprite.destroy();
                return false;
            }
            return true;
        });
    }
} 