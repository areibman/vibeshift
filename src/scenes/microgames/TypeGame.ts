import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, GameState } from '../../GameConfig';

export default class TypeGame extends Phaser.Scene {
    private gameState!: GameState;
    private targetWord: string = '';
    private typedWord: string = '';
    private wordText!: Phaser.GameObjects.Text;
    private typedText!: Phaser.GameObjects.Text;
    private promptText!: Phaser.GameObjects.Text;
    private gameTimer!: Phaser.Time.TimerEvent;
    private timeRemaining: number = 3000; // 3 seconds
    private timerBar!: Phaser.GameObjects.Rectangle;
    private completed: boolean = false;
    private won: boolean = false;

    private words = ['BANANA', 'PHASER', 'SPEED', 'QUICK', 'GAME', 'TYPE', 'FAST', 'WIN'];

    constructor() {
        super({ key: 'TypeGame' });
    }

    init(data: { gameState: GameState }) {
        this.gameState = data.gameState;
        this.typedWord = '';
        this.completed = false;
        this.won = false;
        this.timeRemaining = 3000;
    }

    create() {
        // Create CRT monitor aesthetic background
        this.createBackground();

        // Show prompt
        this.showPrompt();

        // Select random word
        this.targetWord = Phaser.Utils.Array.GetRandom(this.words);

        // Display target word
        this.createWordDisplay();

        // Start timer after prompt
        this.time.delayedCall(1000, () => {
            this.startTimer();
            this.setupKeyboard();
        });
    }

    private createBackground() {
        // Dark background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000);

        // CRT monitor frame
        const frame = this.add.graphics();
        frame.lineStyle(4, 0x00FF00, 0.5);
        frame.strokeRoundedRect(50, 50, GAME_WIDTH - 100, GAME_HEIGHT - 100, 20);

        // Scanline effect
        for (let y = 0; y < GAME_HEIGHT; y += 4) {
            this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH, 1, 0x00FF00, 0.1);
        }

        // Terminal prompt style
        this.add.text(80, 100, '> SYSTEM CHALLENGE', {
            fontSize: '20px',
            fontFamily: 'Courier New, monospace',
            color: '#00FF00'
        });
    }

    private showPrompt() {
        this.promptText = this.add.text(GAME_WIDTH / 2, 150, 'TYPE!', {
            fontSize: '72px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Glitch effect
        this.tweens.add({
            targets: this.promptText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                this.tweens.add({
                    targets: this.promptText,
                    alpha: 0,
                    duration: 500,
                    delay: 200
                });
            }
        });
    }

    private createWordDisplay() {
        // Target word
        this.wordText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, this.targetWord, {
            fontSize: '64px',
            fontFamily: 'Courier New, monospace',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Typed word display
        this.typedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, '', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Blinking cursor
        const cursor = this.add.text(0, 0, '_', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#FFFFFF'
        });

        this.tweens.add({
            targets: cursor,
            alpha: { from: 1, to: 0 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Update cursor position
        this.time.addEvent({
            delay: 50,
            callback: () => {
                const bounds = this.typedText.getBounds();
                cursor.x = bounds.right + 5;
                cursor.y = this.typedText.y - 24;
            },
            repeat: -1
        });
    }

    private setupKeyboard() {
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (this.completed) return;

            const key = event.key.toUpperCase();

            // Check if it's a letter
            if (key.length === 1 && key.match(/[A-Z]/)) {
                this.typedWord += key;
                this.typedText.setText(this.typedWord);

                // Check if word matches
                if (this.typedWord === this.targetWord) {
                    this.handleSuccess();
                } else if (this.typedWord.length >= this.targetWord.length) {
                    // Wrong word
                    this.flashError();
                    this.typedWord = '';
                    this.typedText.setText('');
                }

                // Update color based on correctness
                this.updateTextColor();
            }

            // Backspace
            if (event.key === 'Backspace' && this.typedWord.length > 0) {
                this.typedWord = this.typedWord.slice(0, -1);
                this.typedText.setText(this.typedWord);
                this.updateTextColor();
            }
        });
    }

    private updateTextColor() {
        // Check each character
        let allCorrect = true;
        for (let i = 0; i < this.typedWord.length; i++) {
            if (this.typedWord[i] !== this.targetWord[i]) {
                allCorrect = false;
                break;
            }
        }

        this.typedText.setColor(allCorrect ? '#00FF00' : '#FF0000');
    }

    private flashError() {
        this.cameras.main.shake(100, 0.01);
        this.typedText.setColor('#FF0000');

        const errorText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'ERROR!', {
            fontSize: '32px',
            fontFamily: 'Courier New, monospace',
            color: '#FF0000'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: errorText,
            alpha: { from: 1, to: 0 },
            y: errorText.y + 20,
            duration: 500,
            onComplete: () => errorText.destroy()
        });
    }

    private startTimer() {
        // Create timer bar
        const timerBg = this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 100, 20, 0x003300);
        this.timerBar = this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 100, 20, 0x00FF00);

        this.gameTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                this.timeRemaining -= 50;

                // Update timer bar
                const percentage = this.timeRemaining / 3000;
                this.timerBar.width = (GAME_WIDTH - 100) * percentage;

                // Change color as time runs out
                if (percentage < 0.3) {
                    this.timerBar.setFillStyle(0xFF0000);
                } else if (percentage < 0.6) {
                    this.timerBar.setFillStyle(0xFFFF00);
                }

                if (this.timeRemaining <= 0) {
                    this.checkGameEnd();
                }
            },
            repeat: -1
        });
    }

    private handleSuccess() {
        this.completed = true;
        this.won = true;

        // Success effects
        this.wordText.setColor('#00FF00');
        this.typedText.setColor('#00FF00');

        // Show immediate feedback
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 150, 'ACCESS GRANTED!', {
            fontSize: '48px',
            fontFamily: 'Courier New, monospace',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        // Matrix-style falling characters
        for (let i = 0; i < 10; i++) {
            const char = this.add.text(
                Phaser.Math.Between(100, GAME_WIDTH - 100),
                Phaser.Math.Between(-100, -50),
                String.fromCharCode(Phaser.Math.Between(65, 90)),
                {
                    fontSize: '24px',
                    fontFamily: 'Courier New, monospace',
                    color: '#00FF00'
                }
            );

            this.tweens.add({
                targets: char,
                y: GAME_HEIGHT + 50,
                duration: Phaser.Math.Between(1000, 2000),
                alpha: { from: 1, to: 0 },
                onComplete: () => char.destroy()
            });
        }

        this.tweens.add({
            targets: successText,
            alpha: 1,
            scaleX: { from: 0, to: 1.2 },
            scaleY: { from: 0, to: 1.2 },
            duration: 300,
            ease: 'Back.out'
        });

        // Fade out success text
        this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => successText.destroy()
        });
    }

    private checkGameEnd() {
        this.gameTimer.remove();
        this.completed = true;

        // Update game state based on result
        if (this.won) {
            this.gameState.score += 100;
            this.gameState.gamesCompleted++;

            if (this.gameState.gamesCompleted % 5 === 0) {
                this.gameState.speed = Math.min(this.gameState.speed + 0.2, 3);
            }
        } else {
            this.gameState.lives--;
        }

        // Small delay before transition
        this.time.delayedCall(500, () => {
            if (this.gameState.debugMode) {
                this.scene.start('TitleScene');
            } else {
                if (this.gameState.lives <= 0) {
                    this.scene.start('TitleScene');
                } else {
                    this.scene.start('TransitionScene', {
                        gameState: this.gameState,
                        lastGameWon: this.won
                    });
                }
            }
        });
    }

} 