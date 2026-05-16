import cv2
import numpy as np
import os

def test_codec(codec_str, filename):
    print(f"Testing codec: {codec_str}")
    fourcc = cv2.VideoWriter_fourcc(*codec_str)
    out = cv2.VideoWriter(filename, fourcc, 20.0, (640, 480))
    if not out.isOpened():
        print(f"FAILED to open {codec_str}")
        return False
    
    # Write a few frames
    for _ in range(20):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(frame, "Test", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        out.write(frame)
    
    out.release()
    if os.path.exists(filename) and os.path.getsize(filename) > 0:
        print(f"SUCCESS: Created {filename} ({os.path.getsize(filename)} bytes)")
        return True
    else:
        print(f"FAILED: {filename} was not created or is empty")
        return False

if __name__ == "__main__":
    test_codec('avc1', 'test_avc1.mp4')
    test_codec('mp4v', 'test_mp4v.mp4')
    test_codec('X264', 'test_x264.mp4')
