from PIL import Image
import os

def resize_images_in_folder(folder_path, size=(300, 300)):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                file_path = os.path.join(root, file)
                try:
                    with Image.open(file_path) as img:
                        img = img.resize(size, Image.Resampling.LANCZOS)
                        img.save(file_path)
                        print(f"Resized: {file_path}")
                except Exception as e:
                    print(f"Failed to resize {file_path}: {e}")

resize_images_in_folder('public/images')
