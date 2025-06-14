/**
 * Microgame Registry
 * Add your game imports and registrations here
 */

import CatchGame from './CatchGame';
import TypeGame from './TypeGame';
import DodgeGame from './DodgeGame';
import ClickGame from './ClickGame';
import SneezeGame from './SneezeGame';
import TerminalVirusGame from './TerminalVirusGame';
import PetDogGame from './PetDogGame';
import FruitSliceGame from './FruitSliceGame';

// Export all games as an array
export const MICROGAME_SCENES = [
    CatchGame,
    TypeGame,
    DodgeGame,
    ClickGame,
    SneezeGame,
    TerminalVirusGame,
    PetDogGame,
    FruitSliceGame,
    // NEW_GAME_MARKER - Do not remove this comment
];

// Export metadata for each game
export const MICROGAME_METADATA = [
    {
        key: 'CatchGame',
        name: 'Catch the Egg',
        prompt: 'CATCH!',
        description: 'Move basket to catch falling egg',
        controls: 'Mouse: Move left/right'
    },
    {
        key: 'TypeGame',
        name: 'Type the Word',
        prompt: 'TYPE!',
        description: 'Type the word shown before time runs out',
        controls: 'Keyboard: Type letters, Backspace to delete'
    },
    {
        key: 'DodgeGame',
        name: 'Dodge the Fire',
        prompt: 'DODGE!',
        description: 'Avoid falling projectiles',
        controls: 'Arrow keys: Move left/right'
    },
    {
        key: 'ClickGame',
        name: 'Click the Target',
        prompt: 'CLICK!',
        description: 'Click the target before it disappears',
        controls: 'Mouse: Click on target'
    },
    {
        key: 'SneezeGame',
        name: 'Fake Sneeze',
        prompt: 'SNEEZE!',
        description: 'Mash S key 10 times to build up a sneeze',
        controls: 'Keyboard: Press S repeatedly'
    },
    {
        key: 'TerminalVirusGame',
        name: 'Stop the Virus',
        prompt: 'TERMINATE!',
        description: 'Press Ctrl+C to stop the virus',
        controls: 'Keyboard: Press Ctrl+C'
    },
    {
        key: 'PetDogGame',
        name: 'Pet the Dog',
        prompt: 'PET!',
        description: 'Hold spacebar to pet the dog',
        controls: 'Keyboard: Hold Spacebar'
    },
    {
        key: 'FruitSliceGame',
        name: 'Slice the Fruits',
        prompt: 'SLICE!',
        description: 'Slice all fruits before they fall',
        controls: 'Mouse: Drag to slice'
    },
    // NEW_METADATA_MARKER - Do not remove this comment
]; 