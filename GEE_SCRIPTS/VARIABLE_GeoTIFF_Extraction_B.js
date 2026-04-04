/**
 * =========================================================================================
 * TITLE: NORMALIZED GEOTIFF EXPORT FOR GULLY EROSION VULNERABILITY
 * AUTHOR: Nwobi Nelson Onyebuchi
 * DATE: March 2026
 * DESCRIPTION: 
 * This script performs Min-Max normalization (0-1 scaling) on the 11 environmental 
 * predictors. This step is critical for Weighted Overlay analysis, ensuring that 
 * variables with different units (e.g., Elevation in meters vs. pH) are 
 * comparable within the susceptibility model.
 * =========================================================================================
 */

// 1. STUDY AREAS
var idemili = ee.FeatureCollection("projects/disaster-management-474719/assets/IDEMILI_NS");
var awka    = ee.FeatureCollection("projects/disaster-management-474719/assets/AWKA_NS");
var studyArea = idemili.geometry().union(awka.geometry());

// 2. TERRAIN PREDICTORS (SRTM 30m) - 5 TOTAL
var dem = ee.Image("USGS/SRTMGL1_003").select('elevation').rename('Elevation').clip(studyArea);
var slope = ee.Terrain.slope(dem).rename('Slope');
var aspect = ee.Terrain.aspect(dem).rename('Aspect');
var curvature = dem.convolve(ee.Kernel.laplacian8()).rename('Curvature');

var slopeRad = slope.multiply(Math.PI / 180);
var flowAcc = dem.focal_max(3).rename('FlowAcc'); 
var twi = flowAcc.add(1).log().divide(slopeRad.tan().add(0.001)).rename('TWI');

// 3. SOIL PREDICTORS (SOILGRIDS 0-5cm) - 6 TOTAL
var soilBase = "projects/soilgrids-isric/";
var sand = ee.Image(soilBase + "sand_mean").select('sand_0-5cm_mean').rename('Sand');
var clay = ee.Image(soilBase + "clay_mean").select('clay_0-5cm_mean').rename('Clay');
var soc  = ee.Image(soilBase + "soc_mean").select('soc_0-5cm_mean').rename('SOC');
var bdod = ee.Image(soilBase + "bdod_mean").select('bdod_0-5cm_mean').rename('BulkDensity');
var cec  = ee.Image(soilBase + "cec_mean").select('cec_0-5cm_mean').rename('CEC');
var ph   = ee.Image(soilBase + "phh2o_mean").select('phh2o_0-5cm_mean').rename('pH');

// 4. NORMALIZATION FUNCTION (Min-Max Scaling to 0-1)
var normalize = function(image, region) {
  var minMax = image.reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: region.geometry(),
    scale: 30,
    maxPixels: 1e13
  });
  var bandName = image.bandNames().get(0);
  var min = ee.Number(minMax.get(ee.String(bandName).cat('_min')));
  var max = ee.Number(minMax.get(ee.String(bandName).cat('_max')));
  var diff = max.subtract(min);
  // Formula: (Value - Min) / (Max - Min)
  return image.subtract(min).divide(diff.add(0.000001)).clamp(0, 1);
};

// 5. PREPARATION AND EXPORT (The 11 Predictors)
var variableList = [
  dem, slope, aspect, curvature, twi, // Terrain
  sand, clay, soc, bdod, cec, ph       // Soil
];

var folderName = 'Gully_Normalized_0_1_Exports';

variableList.forEach(function(img) {
  var bandName = img.bandNames().get(0).getInfo();
  
  // Export for IDEMILI Basin
  var normIdemili = normalize(img.clip(idemili), idemili);
  Export.image.toDrive({
    image: normIdemili,
    description: 'NORM_IDEMILI_' + bandName,
    folder: folderName,
    fileNamePrefix: 'NORM_IDEMILI_' + bandName,
    region: idemili.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });

  // Export for AWKA Sector
  var normAwka = normalize(img.clip(awka), awka);
  Export.image.toDrive({
    image: normAwka,
    description: 'NORM_AWKA_' + bandName,
    folder: folderName,
    fileNamePrefix: 'NORM_AWKA_' + bandName,
    region: awka.geometry(),
    scale: 30,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF'
  });
});

print('✅ 22 Normalized Export Tasks Initialized (11 variables x 2 study sites).');
