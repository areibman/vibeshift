import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { UI_CONSTANTS } from './UIConstants';

export class CommonUI {
    static createPromptText(text: string, gui: GUI.AdvancedDynamicTexture): GUI.TextBlock {
        const promptText = new GUI.TextBlock();
        promptText.text = text;
        promptText.color = UI_CONSTANTS.colors.text.primary;
        promptText.fontSize = 64;
        promptText.fontFamily = "Fredoka";
        promptText.fontWeight = "bold";
        promptText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        promptText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        promptText.top = `-${UI_CONSTANTS.spacing.promptY * 100 - 50}%`;

        gui.addControl(promptText);
        return promptText;
    }

    static createTimerDisplay(gui: GUI.AdvancedDynamicTexture): GUI.TextBlock {
        const timerText = new GUI.TextBlock();
        timerText.text = "0.0";
        timerText.color = UI_CONSTANTS.colors.text.primary;
        timerText.fontSize = 48;
        timerText.fontFamily = "Fredoka";
        timerText.fontWeight = "bold";
        timerText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        timerText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        timerText.left = `${(UI_CONSTANTS.spacing.timerX - 0.5) * 100}%`;
        timerText.top = `-${(1 - UI_CONSTANTS.spacing.timerY - 0.5) * 100}%`;
        timerText.width = "100px";
        timerText.height = "60px";

        gui.addControl(timerText);
        return timerText;
    }

    static createLifeDisplay(lives: number, gui: GUI.AdvancedDynamicTexture): GUI.StackPanel {
        const lifePanel = new GUI.StackPanel();
        lifePanel.isVertical = false;
        lifePanel.height = "60px";
        lifePanel.width = "200px";
        lifePanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        lifePanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        lifePanel.left = "20px";
        lifePanel.top = "20px";

        for (let i = 0; i < 3; i++) {
            const heart = new GUI.TextBlock();
            heart.text = i < lives ? "❤️" : "🖤";
            heart.fontSize = 36;
            heart.width = "50px";
            heart.height = "50px";
            lifePanel.addControl(heart);
        }

        gui.addControl(lifePanel);
        return lifePanel;
    }

    static createScoreDisplay(score: number, gui: GUI.AdvancedDynamicTexture): GUI.TextBlock {
        const scoreText = new GUI.TextBlock();
        scoreText.text = `Score: ${score}`;
        scoreText.color = UI_CONSTANTS.colors.text.primary;
        scoreText.fontSize = 42;
        scoreText.fontFamily = "Fredoka";
        scoreText.fontWeight = "bold";
        scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        scoreText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        scoreText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        scoreText.paddingRight = "20px";
        scoreText.paddingTop = "20px";

        gui.addControl(scoreText);
        return scoreText;
    }

    static createButton(text: string, onClick: () => void, gui: GUI.AdvancedDynamicTexture): GUI.Button {
        const button = GUI.Button.CreateSimpleButton(`button_${text}`, text);
        button.width = "200px";
        button.height = "60px";
        button.color = UI_CONSTANTS.colors.text.primary;
        button.background = UI_CONSTANTS.colors.primary.toHexString();
        button.fontSize = 36;
        button.fontFamily = "Fredoka";
        button.fontWeight = "bold";
        button.cornerRadius = 10;
        button.thickness = 0;

        // Hover effect
        button.onPointerEnterObservable.add(() => {
            button.background = UI_CONSTANTS.colors.secondary.toHexString();
            CommonUI.animatePulse(button);
        });

        button.onPointerOutObservable.add(() => {
            button.background = UI_CONSTANTS.colors.primary.toHexString();
        });

        button.onPointerClickObservable.add(() => {
            CommonUI.animateBounce(button);
            setTimeout(onClick, 100);
        });

        gui.addControl(button);
        return button;
    }

    // Animation helpers
    static animateBounce(control: GUI.Control): void {
        const originalTop = control.topInPixels;
        let bounceCount = 0;
        const bounceHeight = 10;

        const bounceInterval = setInterval(() => {
            const progress = bounceCount / 10;
            const offset = Math.sin(progress * Math.PI) * bounceHeight;
            control.topInPixels = originalTop - offset;

            bounceCount++;
            if (bounceCount > 10) {
                clearInterval(bounceInterval);
                control.topInPixels = originalTop;
            }
        }, 30);
    }

    static animateShake(control: GUI.Control): void {
        const originalLeft = control.leftInPixels;
        let shakeCount = 0;

        const shakeInterval = setInterval(() => {
            const offset = (Math.random() - 0.5) * UI_CONSTANTS.animations.shakeIntensity;
            control.leftInPixels = originalLeft + offset;

            shakeCount++;
            if (shakeCount > 20) {
                clearInterval(shakeInterval);
                control.leftInPixels = originalLeft;
            }
        }, 25);
    }

    static animatePulse(control: GUI.Control): void {
        const originalScaleX = control.scaleX;
        const originalScaleY = control.scaleY;
        let pulseCount = 0;

        const pulseInterval = setInterval(() => {
            const progress = pulseCount / 20;
            const scale = 1 + Math.sin(progress * Math.PI * 2) * (UI_CONSTANTS.animations.pulseScale - 1);
            control.scaleX = originalScaleX * scale;
            control.scaleY = originalScaleY * scale;

            pulseCount++;
            if (pulseCount > 20) {
                clearInterval(pulseInterval);
                control.scaleX = originalScaleX;
                control.scaleY = originalScaleY;
            }
        }, 25);
    }

    static animateFadeIn(control: GUI.Control, duration: number = UI_CONSTANTS.animations.fadeTime): void {
        control.alpha = 0;
        const fadeStep = 1 / (duration / 16);

        const fadeInterval = setInterval(() => {
            control.alpha += fadeStep;
            if (control.alpha >= 1) {
                control.alpha = 1;
                clearInterval(fadeInterval);
            }
        }, 16);
    }

    static animateFadeOut(control: GUI.Control, duration: number = UI_CONSTANTS.animations.fadeTime): void {
        control.alpha = 1;
        const fadeStep = 1 / (duration / 16);

        const fadeInterval = setInterval(() => {
            control.alpha -= fadeStep;
            if (control.alpha <= 0) {
                control.alpha = 0;
                clearInterval(fadeInterval);
            }
        }, 16);
    }

    static createInstructionText(text: string, gui: GUI.AdvancedDynamicTexture): GUI.TextBlock {
        const instructionText = new GUI.TextBlock();
        instructionText.text = text;
        instructionText.color = UI_CONSTANTS.colors.text.secondary;
        instructionText.fontSize = 24;
        instructionText.fontFamily = "Fredoka";
        instructionText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        instructionText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        instructionText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        instructionText.paddingBottom = `${UI_CONSTANTS.spacing.instructionY * 100}px`;

        gui.addControl(instructionText);
        return instructionText;
    }
} 