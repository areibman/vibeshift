import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, GameState, INITIAL_GAME_STATE } from '../../GameConfig';

export default class CatchGame extends Phaser.Scene {
    private basket!: Phaser.GameObjects.Rectangle;
    private eggs!: Phaser.Physics.Arcade.Group;
    private gameTimer!: Phaser.Time.TimerEvent;
    private timeRemaining: number = 5000; // 5 seconds
    private caught: boolean = false;
    private failed: boolean = false; // Track if player failed
    private gameState!: GameState;
    private promptText!: Phaser.GameObjects.Text;
    private timerBar!: Phaser.GameObjects.Rectangle;
    private timerBarBg!: Phaser.GameObjects.Rectangle;
    private eggSpawnTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'CatchGame' });
    }

    init(data: { gameState: GameState }) {
        this.gameState = data.gameState || { ...INITIAL_GAME_STATE };
        this.caught = false;
        this.failed = false;
        this.timeRemaining = 5000;

        // Ensure speed is at least 1
        if (!this.gameState.speed || this.gameState.speed < 1) {
            this.gameState.speed = 1;
        }
    }

    create() {
        // Enable gravity for this scene
        this.physics.world.gravity.y = 300;

        // Create background with pastel colors
        this.createBackground();

        // Show prompt
        this.showPrompt();

        // Create basket
        this.createBasket();

        // Create eggs group - MUST be a physics group!
        this.eggs = this.physics.add.group();

        // Start spawning eggs after prompt
        this.time.delayedCall(1000, () => {
            this.spawnEgg();
            this.startTimer();

            // Continuously spawn eggs - but only if player hasn't caught one yet
            this.eggSpawnTimer = this.time.addEvent({
                delay: 3000, // Spawn every 3 seconds
                callback: () => {
                    if (!this.caught) {
                        this.spawnEgg();
                    }
                },
                repeat: -1
            });
        });

        // Set up collision detection
        this.physics.add.overlap(this.basket, this.eggs, this.catchEgg, undefined, this);
    }

    private createBackground() {
        // Pastel sky gradient
        const graphics = this.add.graphics();
        const skyBlue = Phaser.Display.Color.IntegerToColor(0xB4E5FF);
        const peach = Phaser.Display.Color.IntegerToColor(0xFFE5B4);

        for (let i = 0; i < GAME_HEIGHT; i++) {
            const ratio = i / GAME_HEIGHT;
            const r = Phaser.Math.Linear(skyBlue.red, peach.red, ratio);
            const g = Phaser.Math.Linear(skyBlue.green, peach.green, ratio);
            const b = Phaser.Math.Linear(skyBlue.blue, peach.blue, ratio);

            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            graphics.fillRect(0, i, GAME_WIDTH, 1);
        }

        // Add some clouds
        for (let i = 0; i < 3; i++) {
            const cloud = this.add.graphics();
            const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
            const y = Phaser.Math.Between(50, 150);

            cloud.fillStyle(0xFFFFFF, 0.7);
            cloud.fillCircle(x, y, 30);
            cloud.fillCircle(x + 25, y, 25);
            cloud.fillCircle(x - 25, y, 25);
            cloud.fillCircle(x + 10, y - 15, 20);
            cloud.fillCircle(x - 10, y - 15, 20);
        }
    }

    private showPrompt() {
        this.promptText = this.add.text(GAME_WIDTH / 2, 100, 'CATCH!', {
            fontSize: '72px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Animate prompt
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

    private createBasket() {
        // Create basket at bottom of screen
        this.basket = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 50, 80, 40, 0xD7C9AA);
        this.basket.setStrokeStyle(3, 0x8B4513);

        // Add physics to basket
        this.physics.add.existing(this.basket, true);

        // Make basket follow mouse
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.basket.x = Phaser.Math.Clamp(pointer.x, 40, GAME_WIDTH - 40);
            (this.basket.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
        });

        // Add basket wobble
        this.tweens.add({
            targets: this.basket,
            angle: { from: -2, to: 2 },
            duration: 200,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    private spawnEgg() {
        // Don't spawn if game is over
        if (this.caught || this.timeRemaining <= 0) return;

        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);

        // Create egg shape - slightly wider at bottom
        const egg = this.add.ellipse(x, -30, 35, 45, 0xFFFDD0); // Cream color
        egg.setStrokeStyle(2, 0xE6D7C3); // Light brown outline

        // Add shine effect for 3D look
        const shine = this.add.ellipse(x - 8, -38, 12, 18, 0xFFFFFF, 0.6);

        // Add subtle shadow on bottom
        const shadow = this.add.ellipse(x + 3, -25, 20, 10, 0xE6D7C3, 0.2);

        // Add physics to the egg
        this.physics.add.existing(egg, false);

        // Configure physics body
        const body = egg.body as Phaser.Physics.Arcade.Body;
        body.setVelocityY(100 + (50 * this.gameState.speed)); // Speed increases with game speed
        body.setSize(35, 45); // Match visual size

        // Add to eggs group
        this.eggs.add(egg);

        // Make shine and shadow follow egg
        this.time.addEvent({
            delay: 16,
            callback: () => {
                if (egg && egg.active) {
                    shine.x = egg.x - 8;
                    shine.y = egg.y - 8;
                    shadow.x = egg.x + 3;
                    shadow.y = egg.y + 5;
                } else {
                    shine.destroy();
                    shadow.destroy();
                }
            },
            repeat: -1
        });

        // Add slight wobble as it falls
        this.tweens.add({
            targets: egg,
            angle: { from: -3, to: 3 },
            duration: 400,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    private catchEgg(basket: any, egg: any) {
        if (!this.caught && egg.active) {
            this.caught = true;

            // Destroy the egg
            egg.destroy();

            // Stop spawning more eggs
            if (this.eggSpawnTimer) {
                this.eggSpawnTimer.remove();
            }

            // Basket happy animation
            this.tweens.add({
                targets: this.basket,
                scaleX: 1.3,
                scaleY: 0.8,
                duration: 100,
                yoyo: true
            });

            // Success particles
            for (let i = 0; i < 10; i++) {
                const particle = this.add.circle(
                    this.basket.x + Phaser.Math.Between(-20, 20),
                    this.basket.y,
                    5,
                    0xFFD700
                );

                this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-50, 50),
                    y: particle.y - Phaser.Math.Between(50, 100),
                    alpha: 0,
                    duration: 500,
                    onComplete: () => particle.destroy()
                });
            }

            // Show success feedback but don't end game yet
            const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'NICE CATCH!', {
                fontSize: '48px',
                fontFamily: 'Arial Black, sans-serif',
                color: '#00FF00',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: successText,
                alpha: 1,
                scaleX: { from: 0, to: 1.2 },
                scaleY: { from: 0, to: 1.2 },
                duration: 300,
                ease: 'Back.out'
            });

            // Fade out success text after a moment
            this.tweens.add({
                targets: successText,
                alpha: 0,
                duration: 500,
                delay: 1000,
                onComplete: () => successText.destroy()
            });
        }
    }

    private startTimer() {
        // Create timer bar
        this.timerBarBg = this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 100, 20, 0x000000, 0.3);
        this.timerBar = this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH - 100, 20, COLORS.success);

        this.gameTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                this.timeRemaining -= 50;

                // Update timer bar
                const percentage = this.timeRemaining / 5000;
                this.timerBar.width = (GAME_WIDTH - 100) * percentage;

                // Change color as time runs out
                if (percentage < 0.3) {
                    this.timerBar.setFillStyle(COLORS.danger);
                } else if (percentage < 0.6) {
                    this.timerBar.setFillStyle(COLORS.warning);
                }

                if (this.timeRemaining <= 0) {
                    this.checkGameEnd();
                }
            },
            repeat: -1
        });
    }

    private checkGameEnd() {
        this.gameTimer.remove();

        // Stop spawning
        if (this.eggSpawnTimer) {
            this.eggSpawnTimer.remove();
        }

        // Stop physics
        this.physics.pause();

        // Determine if player won or lost
        const won = this.caught && !this.failed;

        // Update game state based on result
        if (won) {
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
                    // Game over - return to title
                    this.scene.start('TitleScene');
                } else {
                    // Continue to next game, passing whether player won
                    this.scene.start('TransitionScene', {
                        gameState: this.gameState,
                        lastGameWon: won
                    });
                }
            }
        });
    }

    private showMissedEggFeedback() {
        // Don't show if already failed
        if (this.failed) return;

        this.failed = true;

        // Stop spawning more eggs
        if (this.eggSpawnTimer) {
            this.eggSpawnTimer.remove();
        }

        // Show immediate failure feedback
        const missText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SPLAT!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        // Egg splat effect
        const splat = this.add.ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 100, 30, 0xFFD700, 0.8);
        splat.setScale(0);

        this.tweens.add({
            targets: splat,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: missText,
            alpha: 1,
            scaleX: { from: 2, to: 1 },
            scaleY: { from: 2, to: 1 },
            duration: 300,
            ease: 'Back.out'
        });

        // Fade out feedback after a moment
        this.tweens.add({
            targets: [missText, splat],
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => {
                missText.destroy();
                splat.destroy();
            }
        });

        // Camera shake
        this.cameras.main.shake(200, 0.02);
    }

    update(time: number, delta: number) {
        // Check for eggs that hit the ground
        if (!this.failed && this.eggs) {
            this.eggs.children.entries.forEach((egg: any) => {
                if (egg.active && egg.y > GAME_HEIGHT - 50) {
                    // An egg hit the ground - show feedback but keep timer running
                    egg.destroy();
                    this.showMissedEggFeedback();
                }
            });
        }
    }
} 