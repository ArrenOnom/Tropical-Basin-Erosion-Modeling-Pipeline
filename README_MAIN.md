    🌍 Tropical Basin Erosion Modeling Pipeline: A Comparative Gully Susceptibility Mapping in Idemili & Awka (SE Nigeria)

    Authors: Nwobi Nelson Onyebuchi

    Framework: Python (Scikit-Learn, Rasterio, Statsmodels)

    Methodology: Random Forest (RF) & Binary Logistic Regression (BLR)

    🚀 One-Click Execution
    Reproduce the entire study—from data cleaning to 1200 DPI figure generation—directly in your browser:

    📌 Project Overview:

    Gully erosion is a critical environmental hazard in Southeast Nigeria. This pipeline provides an objective, machine-learning-based   approach to mapping susceptibility by integrating topographic and soil-physicochemical factors.

    Key Features:

    •	Hybrid Statistical Analysis: Uses BLR for odds-ratio inference and RF for high-accuracy predictive mapping.

    •	Geospatial Integration: Automated masking and visualization of 12 environmental covariates.

    •	Objective Weighting: Extraction of Gini Importance for direct implementation in ArcGIS Weighted Overlay tools.

    •	Publication Quality: All figures are exported at 1200 DPI for academic journals.

     📂 Repository Structure:

    ├── Data/
    │   ├── Raw_CSV/          # Balanced GEE samples for Idemili and Awka
    │   └── Raw_GeoTIFFs/     # SRTM & SoilGrids layers (masked to study area)
    ├── Shapefile/
    │   ├── IDEMILI_NS/       # Administrative boundary for Idemili
    │   └── AWKA_NS/          # Administrative boundary for Awka
    ├── Outputs/
    │   ├── IDEMILI/          # Resulting CSV tables and 1200 DPI Figures
    │   └── AWKA/             # Resulting CSV tables and 1200 DPI Figures
    └── Gully_Erosion_Analysis.ipynb  # Main Python Pipeline

    🛠️ Step-by-Step Usage (A-Z):

     1. Launch the Notebook [Gully_Erosion_Susceptibility_Mapping_Idemili_Awka_ML_Analysis.ipynb]

    Click the "Open in Colab" badge at the top of this page. This will open the analysis environment in a virtual Google cloud server.

    2. Run the Master Setup
    
    The first cell in the notebook is the Master Setup. Execute it to:

      •	Automatically clone this repository into the Colab environment.
  
      •	Map all file paths to the BASE_DIR.

      •	Install necessary geospatial libraries (rasterio, geopandas).

    3. Execute Analysis Modules
   
    The notebook is divided into clear sections (4.5 to 4.9):

      •	4.5 BLR: Statistical odds and performance metrics.

      •	4.6 RF: Machine learning training and feature importance.

      •	4.7 Comparison: Head-to-head model validation (AUC-ROC).

      •	4.8 Visualization: Automatic generation of 12-panel geospatial atlases.

      •	4.9 Weights: Exporting the final influence percentages for ArcGIS.

    4. Retrieve Results

    Once the script finishes, navigate to the Outputs/ folder in the Colab sidebar. You will find:

      •	Figure_10_Final_Model_Comparison.png (Comparison Plot)

      •	Table_4_9_ArcGIS_Weights.csv (The numbers needed for your GIS map)

      •	Figure_11/12_Covariate_Atlas.png (Spatial Visuals)

    📊 Requirements
    The environment is self-configuring, but utilizes the following core stack:

      •	python 3.10+

      •	scikit-learn (Modeling)

      •	rasterio & geopandas (GIS)

      •	matplotlib & seaborn (Visualization)

      •	statsmodels (Statistical Inference)

    📜 Citation & License

    If you use this pipeline in your research, please cite:

    Nwobi, N. O.  (2026). Comparative Analysis of Gully Erosion Susceptibility in Tropical Basins using Machine Learning.
