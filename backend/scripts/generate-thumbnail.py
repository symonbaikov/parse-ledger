#!/usr/bin/env python3
"""
PDF Thumbnail Generator

This script generates a thumbnail image (PNG) from the first page of a PDF file.
Usage: python generate-thumbnail.py <input_pdf_path> <output_png_path> [width]
"""

import os
import sys

from pdf2image import convert_from_path
from PIL import Image


def generate_thumbnail(pdf_path: str, output_path: str, width: int = 200) -> bool:
    """
    Generate a thumbnail from the first page of a PDF file.

    Args:
        pdf_path: Path to the input PDF file
        output_path: Path where the thumbnail PNG should be saved
        width: Target width for the thumbnail (height will be scaled proportionally)

    Returns:
        True if successful, False otherwise
    """
    try:
        # Check if input file exists
        if not os.path.exists(pdf_path):
            print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
            return False

        # Convert first page to image
        # Use dpi=150 for reasonable quality while keeping file size manageable
        images = convert_from_path(
            pdf_path, first_page=1, last_page=1, dpi=150, fmt="png"
        )

        if not images:
            print(f"Error: No pages found in PDF: {pdf_path}", file=sys.stderr)
            return False

        # Get first page
        first_page = images[0]

        # Calculate new height maintaining aspect ratio
        aspect_ratio = first_page.height / first_page.width
        height = int(width * aspect_ratio)

        # Resize image
        thumbnail = first_page.resize((width, height), Image.Resampling.LANCZOS)

        # Save thumbnail
        thumbnail.save(output_path, "PNG", optimize=True)

        return True

    except Exception as e:
        print(f"Error generating thumbnail: {str(e)}", file=sys.stderr)
        return False


def main():
    if len(sys.argv) < 3:
        print(
            "Usage: python generate-thumbnail.py <input_pdf_path> <output_png_path> [width]"
        )
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 200

    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    success = generate_thumbnail(pdf_path, output_path, width)

    if success:
        print(f"Thumbnail generated successfully: {output_path}")
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
