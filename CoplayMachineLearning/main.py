import argparse
import sys
import os


def is_video(path: str) -> bool:
    video_exts = {".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"}
    _, ext = os.path.splitext(path.lower())
    return ext in video_exts


def is_image(path: str) -> bool:
    image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
    _, ext = os.path.splitext(path.lower())
    return ext in image_exts


def main():
    parser = argparse.ArgumentParser(
        description="Football Analytics Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("--input", required=True, help="Path to input image or video")
    parser.add_argument("--model", default="yolo11n.pt", help="YOLO model path")
    parser.add_argument("--max-seconds", type=float, default=0, help="Max video seconds to process, 0=full")
    parser.add_argument("--output", default="output", help="Output directory")
    parser.add_argument("--conf", type=float, default=0.3, help="Detection confidence threshold")
    parser.add_argument("--frame-skip", type=int, default=1, help="Process every Nth frame")
    parser.add_argument("--possession-threshold", type=float, default=300.0, help="Pixel distance for possession")
    parser.add_argument("--init-frames", type=int, default=60, help="Frames for classifier initialization")
    parser.add_argument("--team1-color", type=str, default=None, help="Team 1 jersey color as hex e.g. FF0000")
    parser.add_argument("--team2-color", type=str, default=None, help="Team 2 jersey color as hex e.g. 0000FF")

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)

    if not (is_video(args.input) or is_image(args.input)):
        print(f"Error: Unsupported file type: {args.input}")
        sys.exit(1)

    if not os.path.exists(args.model):
        print(f"Error: Model file not found: {args.model}")
        sys.exit(1)

    jersey_colors = None
    if args.team1_color and args.team2_color:
        def hex_to_bgr(hex_str):
            hex_str = hex_str.strip().lstrip("#")
            r = int(hex_str[0:2], 16)
            g = int(hex_str[2:4], 16)
            b = int(hex_str[4:6], 16)
            return [b, g, r]

        jersey_colors = {
            "team1": hex_to_bgr(args.team1_color),
            "team2": hex_to_bgr(args.team2_color),
        }

    from analytics import FootballAnalytics

    pipeline = FootballAnalytics(
        model_path=args.model,
        conf=args.conf,
        init_frames=args.init_frames,
        possession_threshold=args.possession_threshold,
        output_dir=args.output,
        jersey_colors=jersey_colors,
    )

    if is_image(args.input):
        output = pipeline.process_image(args.input)
        print(f"\nDone! Annotated image: {output}")

    elif is_video(args.input):
        result = pipeline.process_video(
            args.input,
            max_seconds=args.max_seconds,
            frame_skip=args.frame_skip,
        )
        print(f"\nDone! Annotated video: {result['output_path']}")


if __name__ == "__main__":
    main()
