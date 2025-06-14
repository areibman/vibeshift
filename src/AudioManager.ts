import Phaser from 'phaser';

export class AudioManager {
    private static instance: AudioManager;
    private scene: Phaser.Scene;
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private shortClips: string[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        AudioManager.instance = this;

        // List of short audio clips for microgames
        this.shortClips = [
            'short1', 'short2', 'short3', 'short4', 'short5', 'short6',
            'short7', 'short8', 'short9', 'short10', 'short11', 'short12'
        ];
    }

    static getInstance(scene?: Phaser.Scene): AudioManager {
        if (!AudioManager.instance && scene) {
            AudioManager.instance = new AudioManager(scene);
        }
        return AudioManager.instance;
    }

    preloadAudio(scene: Phaser.Scene) {
        // Load title music
        scene.load.audio('titleMusic', 'audio/title.mp3');

        // Load transition music
        scene.load.audio('transitionMusic', 'audio/transition.mp3');

        // Load all short clips
        for (let i = 1; i <= 12; i++) {
            scene.load.audio(`short${i}`, `audio/short${i}.m4a`);
        }
    }

    playTitleMusic() {
        this.stopCurrentMusic();
        this.currentMusic = this.scene.sound.add('titleMusic', {
            loop: true,
            volume: 0.5
        });
        this.currentMusic.play();
    }

    playTransitionMusic(duration: number) {
        this.stopCurrentMusic();
        this.currentMusic = this.scene.sound.add('transitionMusic', {
            volume: 0.5
        });

        // Play only for the duration of the transition
        this.currentMusic.play();

        // Stop after the specified duration
        this.scene.time.delayedCall(duration, () => {
            if (this.currentMusic && this.currentMusic.key === 'transitionMusic') {
                this.currentMusic.stop();
            }
        });
    }

    playRandomShortClip(gameDuration: number) {
        this.stopCurrentMusic();

        // Select a random short clip
        const clipKey = Phaser.Utils.Array.GetRandom(this.shortClips);

        this.currentMusic = this.scene.sound.add(clipKey, {
            volume: 0.5
        });

        this.currentMusic.play();

        // Stop the music when the game ends
        this.scene.time.delayedCall(gameDuration, () => {
            if (this.currentMusic && this.currentMusic.key === clipKey) {
                this.currentMusic.stop();
            }
        });
    }

    stopCurrentMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    fadeOutMusic(duration: number = 300) {
        if (this.currentMusic) {
            this.scene.tweens.add({
                targets: this.currentMusic,
                volume: 0,
                duration: duration,
                onComplete: () => {
                    this.stopCurrentMusic();
                }
            });
        }
    }

    setVolume(volume: number) {
        if (this.currentMusic) {
            (this.currentMusic as any).volume = volume;
        }
    }
} 