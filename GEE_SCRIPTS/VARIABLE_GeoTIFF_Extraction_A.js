/**
 * =========================================================================================
 * TITLE: GEOTIFF EXPORT FOR GULLY EROSION SUSCEPTIBILITY MAPPING
 * AUTHOR: Nwobi Nelson Onyebuchi
 * DATE: March 2026
 * DESCRIPTION: 
 * This script exports the 11 high-resolution environmental predictors used in the 
 * final susceptibility model. It includes 5 Terrain derivatives (SRTM 30m) and 
 * 6 Soil properties (SoilGrids 250m), clipped to validated study area boundaries.
 * =========================================================================================
 */

// 1. STUDY AREAS (Validated Assets)
var idemili = ee.FeatureCollection("projects/disaster-management-474719/assets/IDEMILI_NS");
var awka    = ee.FeatureCollection("projects/disaster-management-474719/assets/AWKA_NS");
var studyArea = idemili.geometry().union(awka.geometry());

Map.centerObject(idemili, 10);

// 2. TERRAIN PREDICTORS (SRTM 30m) - 5 TOTAL
var dem = ee.Image("USGS/SRTMGL1_003").select('elevation').rename('Elevation').clip(studyArea);
var slope = ee.Terrain.slope(dem).rename('Slope');
var aspect = ee.Terrain.aspect(dem).rename('Aspect');
var curvature = dem.convolve(ee.Kernel.laplacian8()).rename('Curvature');

// Topographic Wetness Index (TWI) 
var flowAcc = dem.focal_max(3).rename('FlowAcc'); 
var slopeRad = slope.multiply(Math.PI / 180);
var twi = flowAcc.add(1).log().divide(slopeRad.tan().add(0.001)).rename('TWI');

// 3. SOIL PREDICTORS (SOILGRIDS 0-5cm) - 6 TOTAL
var soilBase = "projects/soilgrids-isric/";
var sand = ee.Image(soilBase + "sand_mean").select('sand_0-5cm_mean').rename('Sand');
var clay = ee.Image(soilBase + "clay_mean").select('clay_0-5cm_mean').rename('Clay');
var soc  = ee.Image(soilBase + "soc_mean").select('soc_0-5cm_mean').rename('SOC');
var bdod = ee.Image(soilBase + "bdod_mean").select('bdod_0-5cm_mean').rename('BulkDensity');
var cec  = ee.Image(soilBase + "cec_mean").select('cec_0-5cm_mean').rename('CEC');
var ph   = ee.Image(soilBase + "phh2o_mean").select('phh2o_0-5cm_mean').rename('pH');

// 4. MULTI-BAND STACKING (The 11 Predicators)
var variableList = [
  dem, slope, aspect, curvature, twi, // Terrain
  sand, clay, soc, bdod, cec, ph       // Soil
];

var exportStack = ee.Image.cat(variableList).clip(studyArea).unmask(-9999);

// 5. AUTOMATED EXPORT LOGIC
var folderName = 'Gully_Predictors_Exports_2026';
var bands = exportStack.bandNames().getInfo();

bands.forEach(function(bandName) {
  var exportImg = exportStack.select(bandName);
  
  // 5a. Export for IDEMILI Basin
  Export.image.toDrive({
    image: exportImg.clip(idemili),
    description: 'IDEMILI_' + bandName,
    folder: folderName,
    fileNamePrefix: 'IDEMILI_' + bandName,
    region: idemili.geometry(),
    scale: 30, 
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });

  // 5b. Export for AWKA Sector
  Export.image.toDrive({
    image: exportImg.clip(awka),
    description: 'AWKA_' + bandName,
    folder: folderName,
    fileNamePrefix: 'AWKA_' + bandName,
    region: awka.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
});

// 6. CONSOLE LOGGING
print('✅ Export Tasks Initialized for 11 Predictors x 2 Study Sites.');
print('Variables:', bands);
