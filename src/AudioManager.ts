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
            'short7'
        ];
    }

    static getInstance(scene?: Phaser.Scene): AudioManager {
        if (!AudioManager.instance && scene) {
            AudioManager.instance = new AudioManager(scene);
        }
        return AudioManager.instance;
    }

    preloadAudio(scene: Phaser.Scene) {
        console.log('Starting audio preload...');

        // Load title music
        scene.load.audio('titleMusic', 'audio/theme.MP3');
        console.log('Loading title music: audio/theme.MP3');

        // Load transition music
        scene.load.audio('transitionMusic', 'audio/transition_long.MP3');
        console.log('Loading transition music: audio/transition_long.MP3');

        // Load all short clips
        for (let i = 1; i <= 7; i++) {
            scene.load.audio(`short${i}`, `audio/${i}.MP3`);
            console.log(`Loading short clip: audio/${i}.MP3`);
        }

        // Add load complete listener
        scene.load.on('complete', () => {
            console.log('All audio files loaded successfully!');
        });

        // Add load error listener
        scene.load.on('loaderror', (file: any) => {
            console.error('Failed to load audio file:', file.key, file.src);
        });
    }

    playTitleMusic() {
        this.stopCurrentMusic();
        try {
            this.currentMusic = this.scene.sound.add('titleMusic', {
                loop: true,
                volume: 0.5
            });
            this.currentMusic.play();
            console.log('Title music playback initiated');
        } catch (error) {
            console.error('Error playing title music:', error);
            console.log('This may be due to browser autoplay policies. Music will play after user interaction.');
        }
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