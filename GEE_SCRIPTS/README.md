**Google Earth Engine (GEE) Implementation**

This folder contains the JavaScript API scripts used for the cloud-based geospatial processing of environmental predictors. The workflow is structured into three distinct modules to handle data sampling, raw variable extraction, and normalization for multi-criteria evaluation.

**1. VARIABLES_CSV_Extraction.js**

**Function: Training and Validation Dataset Generation.**

•	Sampling Strategy: Implements a 1:1 Balanced Sampling approach to ensure an equal distribution between gully (presence) and non-gully (absence) points.

•	Spatial Control: Applies a 100-meter exclusionary buffer around digitized gully features to ensure "absence" samples represent stable terrain and to reduce spatial autocorrelation.

•	Feature Extraction: Samples 11 environmental variables (5 Terrain, 6 Soil) at a 30m spatial resolution across the Idemili and Awka study areas.

**2. VARIABLE_GeoTIFF_Extraction_A.js**

**Function: High-Resolution Raw Predictor Export.**

•	Terrain Processing: Derives 5 primary terrain factors from the SRTM 30m DEM, including Elevation, Slope, Aspect, Curvature, and the Topographic Wetness Index (TWI).

•	Soil Data Integration: Extracts 6 key soil properties from ISRIC SoilGrids (0–5cm), including Sand, Clay, SOC, Bulk Density, CEC, and pH.

•	Output: Generates 22 raw GeoTIFFs (11 variables for each study sector) for baseline spatial analysis.

**3. VARIABLE_GeoTIFF_Extraction_B.js**

**Function: Min-Max Normalization for Weighted Overlay.**

•	Scaling Logic: Performs a linear Min-Max scaling (0 to 1) on all 11 environmental predictors.

•	Purpose: Standardizes variables with different units (e.g., pH values vs. Elevation in meters) into a dimensionless index. This step is essential for ensuring unbiased integration during Weighted Sum Overlay and susceptibility mapping.

•	Precision: Ensures that no-data values are masked and that the output reflects the specific dynamic range of the Idemili and Awka regions.

**How to Use**
1.	Access the Google Earth Engine Code Editor.
2.	Copy the contents of each script into the editor.
3.	Ensure your Asset paths for the study area boundaries and gully points match your GEE environment.
4.	Run the scripts in sequence to reproduce the data framework used in this study.
