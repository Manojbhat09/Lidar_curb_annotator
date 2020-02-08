# Lidar Curb annotator
This is an extension of paper LATTE.
By Bernie Wang, Virginia Wu, Bichen Wu, Kurt Keutzer
   

## Installation
1. Clone this repository
2. Setup virtual environment:
   ```Shell
   virtualenv env
   ```
   Activate the virtual environment
   ```Shell
   source env/bin/activate
   ```
3. Install dependencies. By default we use Python3.
   ```bash
   pip3 install -r requirements.txt
   ```
4. To run the tool, run `python app.py` in wherever you have your `app` directory is
5. Open http://127.0.0.1:5000/ on a browser (FireFox has been noted to have compatibility issues)

# Annotating your own LiDAR data
Your LiDAR data should include a binary file of the full point cloud, a binary file of the point cloud with the ground removed, and an image. See app/test_dataset for examples. After you have formated your data, place them in app/test_dataset. 

# Operations for Annotation:

## Annotation

1. ctrl + X is start annotation and highlights
2. ctrl + X to erase
3. ctrl + D to pause annotation
4. ctrl + D to continue annotation
3. P to save the annotation


## Controls
### "3D" mode
1. Left click and drag to orbit around the point cloud
2. Right click and drag to translate.
3. You can label objects in "3D" mode (see "labelling bounding boxes")

# LiDAR Format
This version of the app assumes the LiDAR data to be stored in a binary float matrix (.bin extension). 
Each column is a point, where the rows are in the following order: x, y, z, and intensity (little endian).
See the 3D Velodyne point clouds in [KITTI's dataset](http://www.cvlibs.net/datasets/kitti/raw_data.php) for example. 

