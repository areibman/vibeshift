import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../../GameConfig';
import BaseMicrogame from '../BaseMicrogame';

export default class DodgeGame extends BaseMicrogame {
    private player!: Phaser.GameObjects.Rectangle;
    private projectiles!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private projectileTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'DodgeGame' });
    }

    getPrompt(): string {
        return 'DODGE!';
    }

    getGameDuration(): number {
        return 4000; // 4 seconds
    }

    setupGame(): void {
        // Enable physics
        this.physics.world.gravity.y = 0;

        // Background
        this.createStandardBackground(0x2C1810, 0x8B4513);

        // Add some ground decoration
        const ground = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x654321);

        // Create player
        this.player = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 100, 40, 40, COLORS.primary);
        this.physics.add.existing(this.player);

        // Add eyes to player
        this.add.circle(this.player.x - 8, this.player.y - 8, 4, 0xFFFFFF);
        this.add.circle(this.player.x + 8, this.player.y - 8, 4, 0xFFFFFF);
        this.add.circle(this.player.x - 8, this.player.y - 8, 2, 0x000000);
        this.add.circle(this.player.x + 8, this.player.y - 8, 2, 0x000000);

        // Create projectiles group
        this.projectiles = this.physics.add.group();

        // Spawn projectiles periodically
        this.projectileTimer = this.time.addEvent({
            delay: 500 - (100 * Math.min(this.gameState.speed, 3)),
            callback: () => this.spawnProjectile(),
            repeat: -1
        });

        // Set up collision
        this.physics.add.overlap(this.player, this.projectiles, () => {
            this.handleHit();
        });
    }

    setupControls(): void {
        // Arrow keys
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    cleanupControls(): void {
        // Cursor keys are automatically cleaned up
        // But we should stop the projectile spawner
        if (this.projectileTimer) {
            this.projectileTimer.remove();
        }
    }

    protected onGameUpdate(time: number, delta: number): void {
        if (this.hasFailed || this.gameEnded) return;

        // Move player
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        if (this.cursors.left.isDown) {
            body.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(300);
        } else {
            body.setVelocityX(0);
        }

        // Keep player in bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 20, GAME_WIDTH - 20);

        // Update eye positions
        const eyes = this.children.list.filter(child =>
            child instanceof Phaser.GameObjects.Arc &&
            (child as any).fillColor === 0xFFFFFF
        ) as Phaser.GameObjects.Arc[];
        if (eyes.length >= 2) {
            eyes[0].x = this.player.x - 8;
            eyes[0].y = this.player.y - 8;
            eyes[1].x = this.player.x + 8;
            eyes[1].y = this.player.y - 8;
        }

        const pupils = this.children.list.filter(child =>
            child instanceof Phaser.GameObjects.Arc &&
            (child as any).fillColor === 0x000000
        ) as Phaser.GameObjects.Arc[];
        if (pupils.length >= 2) {
            pupils[0].x = this.player.x - 8;
            pupils[0].y = this.player.y - 8;
            pupils[1].x = this.player.x + 8;
            pupils[1].y = this.player.y - 8;
        }

        // Clean up projectiles that are off screen
        this.projectiles.children.entries.forEach((projectile: any) => {
            if (projectile.y > GAME_HEIGHT + 50) {
                projectile.destroy();
            }
        });

        // If time runs out without being hit, player wins
        if (this.timeRemaining <= 100 && !this.hasFailed && !this.hasWon) {
            this.setWinState();
        }
    }

    private spawnProjectile(): void {
        if (this.hasFailed || this.gameEnded) return;

        const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
        const projectile = this.add.circle(x, -20, 15, COLORS.danger);

        // Add a fiery trail effect
        this.add.circle(x, -25, 10, 0xFF6600, 0.5);
        this.add.circle(x, -30, 5, 0xFFFF00, 0.3);

        this.physics.add.existing(projectile);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocityY(200 + (100 * this.gameState.speed));

        // Add slight wobble
        this.tweens.add({
            targets: projectile,
            x: x + Phaser.Math.Between(-20, 20),
            duration: 500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        this.projectiles.add(projectile);
    }

    private handleHit(): void {
        if (!this.hasFailed) {
            this.setFailState();

            // Make player flash red
            this.player.setFillStyle(COLORS.danger);

            // Explosion effect
            for (let i = 0; i < 10; i++) {
                const particle = this.add.circle(
                    this.player.x + Phaser.Math.Between(-20, 20),
                    this.player.y + Phaser.Math.Between(-20, 20),
                    Phaser.Math.Between(3, 8),
                    Phaser.Utils.Array.GetRandom([COLORS.danger, 0xFF6600, 0xFFFF00])
                );

                this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-50, 50),
                    y: particle.y + Phaser.Math.Between(-50, 50),
                    alpha: 0,
                    scale: 0,
                    duration: 500,
                    onComplete: () => particle.destroy()
                });
            }
        }
    }

    protected showSuccessFeedback(): void {
        const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'SURVIVED!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        // Victory jump
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 50,
            duration: 300,
            ease: 'Quad.out',
            yoyo: true
        });

        this.tweens.add({
            targets: successText,
            alpha: 1,
            scaleX: { from: 0, to: 1.2 },
            scaleY: { from: 0, to: 1.2 },
            duration: 300,
            ease: 'Back.out'
        });

        // Fade out
        this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => successText.destroy()
        });
    }

    protected showFailureFeedback(): void {
        const failText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'OUCH!', {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: failText,
            alpha: 1,
            scaleX: { from: 2, to: 1 },
            scaleY: { from: 2, to: 1 },
            duration: 300,
            ease: 'Back.out'
        });

        // Fade out
        this.tweens.add({
            targets: failText,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => failText.destroy()
        });

        // Camera shake
        this.cameras.main.shake(300, 0.03);
    }
} 