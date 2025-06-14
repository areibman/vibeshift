import * as BABYLON from '@babylonjs/core';

export const UI_CONSTANTS = {
    colors: {
        primary: BABYLON.Color3.FromHexString('#4ECDC4'),
        secondary: BABYLON.Color3.FromHexString('#FF6B6B'),
        warning: BABYLON.Color3.FromHexString('#FFD93D'),
        success: BABYLON.Color3.FromHexString('#95E1D3'),
        failure: BABYLON.Color3.FromHexString('#F38181'),
        background: BABYLON.Color3.FromHexString('#2D3436'),
        text: {
            primary: '#FFFFFF',
            secondary: '#DFE6E9',
            dark: '#2D3436'
        }
    },

    fonts: {
        main: 'bold 72px Fredoka',
        prompt: 'bold 64px Fredoka',
        timer: 'bold 48px Fredoka',
        instruction: '24px Fredoka',
        button: 'bold 36px Fredoka',
        score: 'bold 42px Fredoka'
    },

    spacing: {
        promptY: 0.85,           // Percentage from top
        timerX: 0.85,            // Percentage from left
        timerY: 0.1,
        instructionY: 0.05       // From bottom
    },

    animations: {
        fadeTime: 300,
        bounceTime: 500,
        shakeIntensity: 10,
        pulseScale: 1.1
    }
}; 