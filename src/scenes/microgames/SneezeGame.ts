import Phaser from 'phaser';
import BaseMicrogame from '../BaseMicrogame';

export default class SneezeGame extends BaseMicrogame {
    private sPresses: number = 0;
    private readonly WIN_THRESHOLD: number = 10;
    private ahText!: Phaser.GameObjects.Text;
    private chooText!: Phaser.GameObjects.Text;
    private pressCounter!: Phaser.GameObjects.Text;
    private progressBar!: Phaser.GameObjects.Rectangle;
    private progressBarBg!: Phaser.GameObjects.Rectangle;
    private blushOverlay!: Phaser.GameObjects.Rectangle;
    private sKey!: Phaser.Input.Keyboard.Key;
    private iframe!: HTMLIFrameElement;
    private iframeContainer!: HTMLDivElement;
    private isIframePreloaded: boolean = false;

    constructor() {
        super({ key: 'SneezeGame' });
    }

    getPrompt(): string {
        return 'SNEEZE!';
    }

    getGameDuration(): number {
        return 3000; // 3 seconds
    }

    setupGame(): void {
        // Create background with screentone pattern
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Show game UI immediately
        this.showGameUI();

        // Preload the iframe but keep it hidden
        this.preloadIframeCharacter();

        // Setup controls
        this.setupControls();
    }

    setupControls(): void {
        this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        
        this.sKey.on('down', () => {
            this.handleSPress();
        });
    }

    cleanupControls(): void {
        if (this.sKey) {
            this.sKey.removeAllListeners();
        }
        
        // Clean up iframe
        if (this.iframeContainer && this.iframeContainer.parentNode) {
            this.iframeContainer.parentNode.removeChild(this.iframeContainer);
            this.isIframePreloaded = false;
        }
    }

    private sendSneezeProgressToIframe(): void {
        if (this.iframe && this.iframe.contentWindow) {
            try {
                const cheekInflation = Math.min(this.sPresses * 0.1, 1);
                this.iframe.contentWindow.postMessage({
                    type: 'sneeze-progress',
                    value: cheekInflation
                }, '*');
            } catch (e) {
                console.error('Failed to send message to iframe:', e);
            }
        }
    }

    private createBackground() {
        // Create manga screentone pattern background
        const graphics = this.add.graphics();
        graphics.fillStyle(0xf0f0f0);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);

        // Add dot pattern
        graphics.fillStyle(0x000000, 0.1);
        for (let x = 0; x < this.scale.width; x += 8) {
            for (let y = 0; y < this.scale.height; y += 8) {
                graphics.fillCircle(x, y, 1);
            }
        }
    }

    private preloadIframeCharacter() {
        if (this.isIframePreloaded) return;

        // Get the game container element
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.error('Game container not found');
            return;
        }

        // Create container for iframe - smaller and centered
        this.iframeContainer = document.createElement('div');
        this.iframeContainer.style.position = 'absolute';
        this.iframeContainer.style.top = '50%';
        this.iframeContainer.style.left = '50%';
        this.iframeContainer.style.width = '300px';
        this.iframeContainer.style.height = '300px';
        this.iframeContainer.style.transform = 'translate(-50%, -50%)';
        this.iframeContainer.style.pointerEvents = 'none';
        this.iframeContainer.style.zIndex = '1';
        this.iframeContainer.style.borderRadius = '15px';
        this.iframeContainer.style.overflow = 'hidden';
        this.iframeContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        this.iframeContainer.style.display = 'none'; // Hide initially

        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'https://cloud.needle.tools/view/embed?file=BgpwFZ4L3mJ-Z4L3mJ-world';
        this.iframe.title = 'Alana | Hosted on Needle Cloud';
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.borderRadius = '15px';
        this.iframe.referrerPolicy = 'no-referrer-when-downgrade';
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        
        // Add iframe to container
        this.iframeContainer.appendChild(this.iframe);
        gameContainer.appendChild(this.iframeContainer);
        
        this.isIframePreloaded = true;
    }

    private showIframeCharacter() {
        if (!this.isIframePreloaded) {
            this.preloadIframeCharacter();
        }
        if (this.iframeContainer) {
            this.iframeContainer.style.display = 'block';
        }
    }

    private createUI() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Title
        this.add.text(centerX, 50, 'FAKE SNEEZE!', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setRotation(-0.1).setDepth(10);

        // Press counter (hidden initially)
        this.pressCounter = this.add.text(50, 50, 'S Presses: 0/10', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setVisible(false).setDepth(10);

        // Progress bar background
        this.progressBarBg = this.add.rectangle(centerX, this.scale.height - 80, 300, 30, 0xffffff);
        this.progressBarBg.setStrokeStyle(3, 0x000000);
        this.progressBarBg.setVisible(false).setDepth(10);

        // Progress bar fill
        this.progressBar = this.add.rectangle(centerX - 150, this.scale.height - 80, 0, 26, 0xff6b6b);
        this.progressBar.setOrigin(0, 0.5);
        this.progressBar.setVisible(false).setDepth(10);

        // "Ah-" text (hidden initially)
        this.ahText = this.add.text(centerX, centerY + 100, 'Ah-', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setVisible(false).setRotation(-0.05).setDepth(10);

        // "CHOO!" text (hidden initially)
        this.chooText = this.add.text(centerX, centerY, '-CHOO!', {
            fontSize: '72px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setVisible(false).setRotation(0.15).setDepth(20);

        // Blush overlay (hidden initially)
        this.blushOverlay = this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0xff6b6b, 0).setDepth(5);
    }

    private handleSPress() {
        if (this.gameEnded) return;

        this.sPresses++;
        this.updateGameState();

        // Check for win condition
        if (this.sPresses >= this.WIN_THRESHOLD) {
            this.triggerSneeze();
        }
    }

    private showGameUI() {
        this.pressCounter.setVisible(true);
        this.progressBarBg.setVisible(true);
        this.progressBar.setVisible(true);
        this.ahText.setVisible(true);
    }

    private updateGameState() {
        // Update press counter
        this.pressCounter.setText(`S Presses: ${this.sPresses}/${this.WIN_THRESHOLD}`);

        // Update progress bar
        const progress = Math.min(this.sPresses / this.WIN_THRESHOLD, 1);
        this.progressBar.width = 300 * progress;

        // Update "Ah-" text size and color
        const scale = 1 + (this.sPresses * 0.2);
        this.ahText.setScale(scale);
        this.ahText.setFontSize(48 + (this.sPresses * 5));
        
        if (this.sPresses > 7) {
            this.ahText.setColor('#ff6b6b');
        }

        // Send cheek inflation data to iframe (only if iframe exists)
        if (this.iframe) {
            this.sendSneezeProgressToIframe();
        }

        // Add blush effect when close
        if (this.sPresses > 7) {
            this.blushOverlay.setAlpha(0.2);
        }
    }

    private triggerSneeze() {
        this.chooText.setVisible(true);
        this.chooText.setScale(0);
        
        this.tweens.add({
            targets: this.chooText,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.setWinState();
            }
        });

        // Hide other UI
        this.ahText.setVisible(false);
        this.pressCounter.setVisible(false);
        this.progressBarBg.setVisible(false);
        this.progressBar.setVisible(false);
    }

    protected showSuccessFeedback(): void {
        // Show the preloaded iframe
        this.showIframeCharacter();

        // Send final sneeze message to iframe
        this.sendSneezeProgressToIframe();

        // Set up a timer to hide the iframe after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.iframeContainer) {
                this.iframeContainer.style.display = 'none';
            }
        });

        const successText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'ACHOO!', {
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

        // Fade out
        this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 500,
            delay: 1000,
            onComplete: () => successText.destroy()
        });
    }

} 