#!/usr/bin/env python3
"""
Improved Microgame Generator for VibeWare
Uses a cleaner registry system instead of regex editing
"""

import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, Optional, Tuple

try:
    import litellm
    litellm.drop_params = True
except ImportError:
    print("❌ Error: litellm is not installed.")
    print("Please install it with: pip install litellm")
    sys.exit(1)


class MicrogameGenerator:
    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
        self.base_path = Path(__file__).parent
        self.context_files = self._load_context_files()

    def _load_context_files(self) -> Dict[str, str]:
        """Load all necessary context files"""
        files_to_load = {
            "base_microgame": "src/scenes/BaseMicrogame.ts",
            "example_catch": "src/scenes/microgames/CatchGame.ts",
            "instructions": "microgame_instructions.md"
        }

        context = {}
        for key, filepath in files_to_load.items():
            full_path = self.base_path / filepath
            if full_path.exists():
                with open(full_path, 'r') as f:
                    context[key] = f.read()
        return context

    def _create_system_prompt(self) -> str:
        """Create the system prompt with all context"""
        return f"""You are an expert TypeScript/Phaser game developer creating microgames for VibeWare.

CONTEXT FILES:

=== BaseMicrogame.ts (MUST EXTEND THIS) ===
{self.context_files.get('base_microgame', '')}

=== Example: CatchGame.ts ===
{self.context_files.get('example_catch', '')}

=== Instructions ===
{self.context_files.get('instructions', '')}

CRITICAL REQUIREMENTS:
1. Output ONLY the TypeScript code for the microgame class
2. Class name MUST match the key passed to super()
3. MUST implement all abstract methods from BaseMicrogame
4. MUST call setWinState() or setFailState() based on game outcome
5. MUST clean up ALL event listeners in cleanupControls()
6. Use GAME_WIDTH (800) and GAME_HEIGHT (600) for positioning
7. Keep it simple - players have only 3-5 seconds

Do not include any explanations, comments outside the code, or markdown code blocks. 
Just output the pure TypeScript code."""

    def _update_registry(self, game_name: str, game_info: Dict[str, str]) -> bool:
        """Update the registry file with the new game"""
        try:
            registry_path = self.base_path / "src/scenes/microgames/registry.ts"

            with open(registry_path, 'r') as f:
                content = f.read()

            # Add import at the marker
            import_line = f"import {game_name} from './{game_name}';"
            content = content.replace(
                "// NEW_GAME_MARKER - Do not remove this comment",
                f"{game_name},\n    // NEW_GAME_MARKER - Do not remove this comment"
            )

            # Add the import after the last import
            last_import_pos = content.rfind("import")
            if last_import_pos != -1:
                end_of_line = content.find('\n', last_import_pos)
                content = content[:end_of_line+1] + \
                    import_line + '\n' + content[end_of_line+1:]

            # Add metadata at the marker
            metadata_entry = f"""    {{
        key: '{game_name}',
        name: '{game_info['name']}',
        prompt: '{game_info['prompt']}',
        description: '{game_info['description']}',
        controls: '{game_info['controls']}'
    }},"""

            content = content.replace(
                "    // NEW_METADATA_MARKER - Do not remove this comment",
                f"{metadata_entry}\n    // NEW_METADATA_MARKER - Do not remove this comment"
            )

            with open(registry_path, 'w') as f:
                f.write(content)

            print(f"✅ Updated registry with {game_name}")
            return True

        except Exception as e:
            print(f"❌ Error updating registry: {e}")
            return False

    def _validate_game(self, game_name: str) -> Tuple[bool, str]:
        """Run validation script on the generated game"""
        try:
            result = subprocess.run(
                ['node', 'validateGames.cjs', game_name],
                capture_output=True,
                text=True,
                check=False
            )

            success = result.returncode == 0
            output = result.stdout + result.stderr

            return success, output

        except Exception as e:
            return False, f"Validation error: {e}"

    def generate_microgame(self,
                           name: str,
                           prompt: str,
                           description: str,
                           controls: str,
                           game_idea: str,
                           model: str = "gpt-4") -> bool:
        """Generate a new microgame based on the provided details"""

        # Create user prompt
        user_prompt = f"""Create a microgame called {name} with the following specifications:

Game Name: {name}
Prompt (shown to player): {prompt}
Description: {description}
Controls: {controls}
Game Concept: {game_idea}

Generate the complete TypeScript code for this microgame. The class name should be {name}."""

        print(f"\n🎮 Generating {name} using {model}...")

        for attempt in range(1, self.max_retries + 1):
            print(f"\n📝 Attempt {attempt}/{self.max_retries}")

            try:
                # Generate code using LiteLLM
                response = litellm.completion(
                    model=model,
                    messages=[
                        {"role": "system", "content": self._create_system_prompt()},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=2000
                )

                generated_code = response.choices[0].message.content.strip()

                # Clean up code if wrapped in markdown
                if "```typescript" in generated_code:
                    generated_code = generated_code.split(
                        "```typescript")[1].split("```")[0]
                elif "```" in generated_code:
                    generated_code = generated_code.split(
                        "```")[1].split("```")[0]

                # Save the generated code
                output_path = self.base_path / \
                    f"src/scenes/microgames/{name}.ts"
                with open(output_path, 'w') as f:
                    f.write(generated_code)

                print(f"✅ Code generated and saved to {output_path}")

                # Format the display name
                display_name = name.replace('Game', ' Game')
                display_name = ' '.join(
                    word.capitalize() for word in display_name.replace('_', ' ').split())

                game_info = {
                    "name": display_name,
                    "prompt": prompt,
                    "description": description,
                    "controls": controls
                }

                if not self._update_registry(name, game_info):
                    print("❌ Failed to update registry")
                    continue

                # Validate the game
                print("\n🔍 Running validation...")
                success, validation_output = self._validate_game(name)
                print(validation_output)

                if success:
                    print(f"\n✅ {name} successfully generated and validated!")
                    print("\n🎮 You can now test your game by running: npm run dev")
                    print(
                        "   Then press 'D' on the title screen to access the debug menu")
                    return True
                else:
                    print(f"\n❌ Validation failed, retrying...")
                    user_prompt = f"""{user_prompt}

The previous attempt failed validation with these errors:
{validation_output}

Please fix these issues and generate the corrected code."""

            except Exception as e:
                print(f"❌ Error: {e}")
                if "api_key" in str(e).lower():
                    print(
                        "\n💡 Tip: Make sure you have set your API key as an environment variable:")
                    print("   export OPENAI_API_KEY='your-key-here'")
                    return False

        print(
            f"\n❌ Failed to generate valid {name} after {self.max_retries} attempts")
        return False


def main():
    """Interactive microgame generator"""
    print("🎮 VibeWare Microgame Generator")
    print("=" * 40)

    # Check for API key
    if not os.environ.get('OPENAI_API_KEY') and not os.environ.get('ANTHROPIC_API_KEY'):
        print("\n⚠️  Warning: No API key found in environment variables.")
        print("Set one of the following:")
        print("  export OPENAI_API_KEY='your-key-here'")
        print("  export ANTHROPIC_API_KEY='your-key-here'")
        print("\nOr you can set a custom model that doesn't require these keys.\n")

    # Get game details from user
    print("\nEnter microgame details:")
    name = input("Game class name (e.g., ClickGame): ").strip()
    if not name:
        print("❌ Name is required")
        return

    # Ensure name ends with "Game" for consistency
    if not name.endswith("Game"):
        name += "Game"
        print(f"📝 Updated name to: {name}")

    prompt = input("Player prompt (e.g., CLICK!): ").strip().upper()
    if not prompt.endswith("!"):
        prompt += "!"

    description = input("Game description: ").strip()
    controls = input("Controls (e.g., Mouse: Click on targets): ").strip()
    game_idea = input("Detailed game concept: ").strip()

    # Model selection
    print("\nSelect AI model:")
    print("1. GPT-4 (default, requires OPENAI_API_KEY)")
    print("2. GPT-3.5-turbo (requires OPENAI_API_KEY)")
    print("3. Claude (requires ANTHROPIC_API_KEY)")
    print("4. Custom (enter your own)")

    model_choice = input("\nChoice [1]: ").strip() or "1"

    model_map = {
        "1": "gpt-4",
        "2": "gpt-3.5-turbo",
        "3": "claude-2",
        "4": None
    }

    model = model_map.get(model_choice)
    if model is None and model_choice == "4":
        model = input("Enter model name: ").strip()
    elif model is None:
        model = "gpt-4"

    # Generate the game
    generator = MicrogameGenerator()
    generator.generate_microgame(
        name, prompt, description, controls, game_idea, model)


if __name__ == "__main__":
    main()
