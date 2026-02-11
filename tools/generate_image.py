#!/usr/bin/env python3
"""
Google Gemini Image Generator (Portfolio Local Copy)

Generate images from text prompts or edit existing images using Google's Gemini API.
Supports reference images and style templates for consistency.

Setup:
    1. Get API key from https://aistudio.google.com/apikey
    2. Create .env file with: GOOGLE_AI_API_KEY=your_key_here
    3. Run: uv sync

Usage:
    # Generate from prompt
    uv run python main.py output.png "A minimal 3D cube on solid black background"

    # Use a style template (reads prompt from .md file)
    uv run python main.py output.png "A gear icon" --style styles/blue_glass_3d.md

    # Generate multiple variations with style
    uv run python main.py output.png "cube" "sphere" "pyramid" --style styles/blue_glass_3d.md

    # Edit existing image
    uv run python main.py output.png "Change the background to blue" --edit input.png

    # Use reference images for style consistency
    uv run python main.py output.png "Same style but with a sphere" --ref style.png

    # Specify aspect ratio
    uv run python main.py output.png "Prompt" --aspect 16:9  # YouTube thumbnails

Aspect ratios: 1:1, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
"""
import argparse
import os
import re
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image


def load_style_template(style_path: Path) -> str:
    """
    Load a prompt template from a markdown style file.

    Looks for a code block after '## Prompt Template' or '### Template'.
    The template should contain {subject} as a placeholder.

    Args:
        style_path: Path to the .md style file

    Returns:
        The prompt template string with {subject} placeholder
    """
    if not style_path.exists():
        raise FileNotFoundError(f"Style file not found: {style_path}")

    content = style_path.read_text()

    # Look for code block after "Prompt Template" or "Template" header
    # Match ```...``` after a template-related header (allowing text in between)
    pattern = r'(?:##?\s*(?:Prompt\s*)?Template)[^\n]*\n+(?:.*?\n)*?```[^\n]*\n(.*?)```'
    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)

    if match:
        template = match.group(1).strip()
        # Normalize the placeholder - support both {subject} and [YOUR SUBJECT]
        template = re.sub(
            r'\[YOUR SUBJECT[^\]]*\]|\[SUBJECT\]|\{subject\}',
            '{subject}',
            template,
            flags=re.IGNORECASE
        )
        return template

    raise ValueError(f"No prompt template found in {style_path}. "
                     "Add a '## Prompt Template' section with a code block.")


def apply_style_template(template: str, subject: str) -> str:
    """
    Apply a subject to a style template.

    Args:
        template: The prompt template with {subject} placeholder
        subject: The subject to insert

    Returns:
        The complete prompt
    """
    if '{subject}' in template:
        return template.format(subject=subject)
    else:
        # If no placeholder, prepend the subject
        return f"{subject}. {template}"


def edit_image(
    input_path: Path,
    prompt: str,
    output_path: Path,
    reference_images: Optional[list[Path]] = None,
) -> None:
    """
    Edit an existing image based on a text prompt.

    Args:
        input_path: Path to the image to edit
        prompt: Text description of the edit to make
        output_path: Where to save the edited image
        reference_images: Optional list of additional reference images (up to 14 total)
    """
    client = genai.Client(
        api_key=os.environ.get("GOOGLE_AI_API_KEY"),
    )

    # Build contents list: prompt first, then input image, then any references
    contents: list = [prompt]

    # Add the main image to edit
    main_image = Image.open(input_path)
    contents.append(main_image)

    # Add reference images if provided (Gemini supports up to 14 total)
    if reference_images:
        for ref_path in reference_images[:13]:  # 13 refs + 1 main = 14 max
            if ref_path.exists():
                ref_image = Image.open(ref_path)
                contents.append(ref_image)
            else:
                print(f"Warning: Reference image not found: {ref_path}")

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                with open(output_path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"Edited image saved to: {output_path}")
                return
            elif hasattr(part, "text") and part.text:
                print(part.text)


def generate_image(
    prompt: str,
    output_path: Path,
    reference_images: Optional[list[Path]] = None,
    aspect_ratio: str = "16:9",
    image_size: str = "1K",
) -> None:
    """
    Generate a new image from a text prompt.

    Args:
        prompt: Text description of the image to generate
        output_path: Where to save the generated image
        reference_images: Optional list of reference images for style/composition (up to 14)
        aspect_ratio: Aspect ratio for the image (1:1, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)
        image_size: Resolution (1K, 2K, or 4K)
    """
    client = genai.Client(
        api_key=os.environ.get("GOOGLE_AI_API_KEY"),
    )

    # Build contents: if we have reference images, use them
    if reference_images:
        contents: list = [prompt]
        for ref_path in reference_images[:14]:
            if ref_path.exists():
                ref_image = Image.open(ref_path)
                contents.append(ref_image)
            else:
                print(f"Warning: Reference image not found: {ref_path}")

        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(output_path, "wb") as f:
                        f.write(part.inline_data.data)
                    print(f"Image saved to: {output_path}")
                    return
                elif hasattr(part, "text") and part.text:
                    print(part.text)
    else:
        # No reference images: use streaming with aspect ratio config
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]

        config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio,
                image_size=image_size,
            ),
        )

        for chunk in client.models.generate_content_stream(
            model="gemini-3-pro-image-preview",
            contents=contents,
            config=config,
        ):
            if (
                chunk.candidates is None
                or chunk.candidates[0].content is None
                or chunk.candidates[0].content.parts is None
            ):
                continue

            part = chunk.candidates[0].content.parts[0]
            if part.inline_data and part.inline_data.data:
                with open(output_path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"Image saved to: {output_path}")
                return
            elif hasattr(part, "text") and part.text:
                print(part.text)


def main():
    parser = argparse.ArgumentParser(
        description="Generate images using Google Gemini API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate single image
  uv run python main.py output.png "A minimal geometric cube"

  # Use a style template
  uv run python main.py output.png "gear icon" --style styles/blue_glass_3d.md

  # Generate 3 variations with style
  uv run python main.py output.png "cube" "sphere" "pyramid" --style styles/blue_glass_3d.md

  # Edit existing image
  uv run python main.py output.png "Change text to HELLO" --edit input.png

  # Generate with reference images
  uv run python main.py output.png "Similar style" --ref style1.png --ref style2.png

  # Combine style template + reference image
  uv run python main.py output.png "rocket" --style styles/blue_glass_3d.md --ref styles/blue_glass_3d.png
        """,
    )
    parser.add_argument("output", help="Output path for the image (base path if multiple prompts)")
    parser.add_argument("prompts", nargs="+", help="One or more subjects/prompts")
    parser.add_argument(
        "--style", "-s",
        help="Path to style template .md file (uses {subject} placeholder)",
    )
    parser.add_argument(
        "--edit", "-e",
        help="Path to input image to edit (instead of generating from scratch)",
    )
    parser.add_argument(
        "--ref", "-r",
        action="append",
        dest="references",
        help="Reference image for style/composition (can be used multiple times, up to 14 total)",
    )
    parser.add_argument(
        "--aspect", "-a",
        default="16:9",
        choices=["1:1", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
        help="Aspect ratio for generated images (default: 16:9)",
    )
    parser.add_argument(
        "--res",
        default="1K",
        choices=["1K", "2K", "4K"],
        help="Resolution/quality: 1K, 2K, or 4K (default: 1K)",
    )
    args = parser.parse_args()

    # Load .env from current directory or script directory
    load_dotenv()
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)

    if not os.environ.get("GOOGLE_AI_API_KEY"):
        print("Error: GOOGLE_AI_API_KEY not found in environment")
        print("Create a .env file with: GOOGLE_AI_API_KEY=your_key_here")
        print("Get your API key from: https://aistudio.google.com/apikey")
        return

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load style template if provided
    style_template = None
    if args.style:
        try:
            style_template = load_style_template(Path(args.style))
            print(f"Loaded style template from: {args.style}")
        except (FileNotFoundError, ValueError) as e:
            print(f"Error: {e}")
            return

    # Process prompts - apply style template if provided
    prompts = args.prompts
    if style_template:
        prompts = [apply_style_template(style_template, p) for p in prompts]

    # Convert reference paths to Path objects
    ref_images = [Path(r) for r in args.references] if args.references else None

    if args.edit:
        # Edit mode: modify existing image
        input_path = Path(args.edit)
        if not input_path.exists():
            print(f"Error: Input image not found: {input_path}")
            return
        edit_image(input_path, prompts[0], output_path, reference_images=ref_images)
    elif len(prompts) == 1:
        # Single prompt, single output
        generate_image(prompts[0], output_path, reference_images=ref_images, aspect_ratio=args.aspect, image_size=args.res)
    else:
        # Multiple prompts, numbered outputs
        stem = output_path.stem
        suffix = output_path.suffix
        parent = output_path.parent

        for i, prompt in enumerate(prompts, 1):
            numbered_path = parent / f"{stem}_{i}{suffix}"
            print(f"\nGenerating image {i}/{len(prompts)}...")
            generate_image(prompt, numbered_path, reference_images=ref_images, aspect_ratio=args.aspect, image_size=args.res)


if __name__ == "__main__":
    main()
