import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './GameConfig';
import TitleScene from './scenes/TitleScene';
import TransitionScene from './scenes/TransitionScene';
import DebugMenuScene from './scenes/DebugMenuScene';
import CatchGame from './scenes/microgames/CatchGame';
import TypeGame from './scenes/microgames/TypeGame';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#2C3E50',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        TitleScene,
        TransitionScene,
        DebugMenuScene,
        CatchGame,
        TypeGame
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    }
};

new Phaser.Game(config); 