import os
import subprocess
import platform
import shutil
from pathlib import Path

def test_ffmpeg_resolution():
    print(f"--- FFmpeg Resolution Test ---")
    print(f"OS: {platform.system()} {platform.release()}")
    
    bin_dir = Path("bin").absolute()
    ffmpeg_file = bin_dir / "ffmpeg"
    
    print(f"\n1. Checking local binary: {ffmpeg_file}")
    if ffmpeg_file.exists():
        print(f"   [INFO] File exists. Size: {ffmpeg_file.stat().st_size} bytes")
        
        # Simulate the WinError 193 check
        try:
            print(f"   [TEST] Running: {ffmpeg_file} -version")
            result = subprocess.run([str(ffmpeg_file), "-version"], capture_output=True, text=True, timeout=5)
            print(f"   [SUCCESS] FFmpeg is valid.")
        except OSError as e:
            if getattr(e, 'winerror', None) == 193:
                print(f"   [ROOT CAUSE] WinError 193: %1 n’est pas une application Win32 valide.")
                print(f"   [DIAGNOSIS] The file '{ffmpeg_file}' is NOT a Windows executable.")
                print(f"               It is likely a Linux ELF binary.")
            else:
                print(f"   [ERROR] OSError: {e}")
        except Exception as e:
            print(f"   [ERROR] Unexpected error: {e}")
    else:
        print(f"   [WARNING] File {ffmpeg_file} not found.")

    print(f"\n2. Checking System PATH for 'ffmpeg'")
    system_path = shutil.which("ffmpeg")
    if system_path:
        print(f"   [INFO] Found in PATH: {system_path}")
    else:
        print(f"   [INFO] Not found in system PATH.")

    print(f"\n3. Recommendation:")
    print(f"   - Download FFmpeg for Windows from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z")
    print(f"   - Extract 'ffmpeg.exe' from the 'bin' folder of the archive.")
    print(f"   - Place it into: {bin_dir.absolute()}\\ffmpeg.exe")
    print(f"   - (Optional) Remove the extensionless 'ffmpeg' file to avoid confusion.")

if __name__ == "__main__":
    test_ffmpeg_resolution()
