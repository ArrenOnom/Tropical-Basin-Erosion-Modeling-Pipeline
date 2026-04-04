/**
 * =========================================================================================
 * TITLE: INTEGRATED GEOMATICS MODELLING OF GULLY EROSION SUSCEPTIBILITY
 * AUTHOR: Nwobi Nelson Onyebuchi
 * DATE: March 2026
 * * DESCRIPTION: 
 * This script extracts 11 environmental predictors (Terrain & Soil) for 
 * gully susceptibility modeling. It implements a DYNAMIC 1:1 BALANCED SAMPLING
 * strategy and a 100m exclusion buffer to resolve class imbalance (Recall fix) 
 * and reduce spatial autocorrelation.
 * =========================================================================================
 */

// 1. STUDY AREA & ASSETS
var idemili = ee.FeatureCollection("projects/disaster-management-474719/assets/IDEMILI_NS");
var awka    = ee.FeatureCollection("projects/disaster-management-474719/assets/AWKA_NS");
var gullies_idemili = ee.FeatureCollection("projects/disaster-management-474719/assets/IDEMILI_GULLY_POINTS");
var gullies_awka    = ee.FeatureCollection("projects/disaster-management-474719/assets/AWKA_GULLY_POINTS");

var combinedArea = idemili.geometry().union(awka.geometry());
Map.centerObject(idemili, 10);

// 2. TERRAIN PREDICTORS (SRTM 30m)
var dem = ee.Image("USGS/SRTMGL1_003").select('elevation').rename('Elevation').clip(combinedArea);
var slope = ee.Terrain.slope(dem).rename('Slope');
var aspect = ee.Terrain.aspect(dem).rename('Aspect');
var curvature = dem.convolve(ee.Kernel.laplacian8()).rename('Curvature');
var flowAcc = dem.focal_max(3).rename('FlowAcc'); 
var twi = slope.expression('log((a + 1) / (tan(s * 3.14159 / 180)))', {
  'a': flowAcc, 's': slope
}).rename('TWI');

// 3. SOIL PREDICTORS (SOILGRIDS 250m)
var soilBase = "projects/soilgrids-isric/";
var sand = ee.Image(soilBase + "sand_mean").select('sand_0-5cm_mean').rename('Sand');
var clay = ee.Image(soilBase + "clay_mean").select('clay_0-5cm_mean').rename('Clay');
var soc  = ee.Image(soilBase + "soc_mean").select('soc_0-5cm_mean').rename('SOC');
var bdod = ee.Image(soilBase + "bdod_mean").select('bdod_0-5cm_mean').rename('BulkDensity');
var cec  = ee.Image(soilBase + "cec_mean").select('cec_0-5cm_mean').rename('CEC');
var ph   = ee.Image(soilBase + "phh2o_mean").select('phh2o_0-5cm_mean').rename('pH');

var envStack = dem.addBands([slope, aspect, curvature, twi, sand, clay, soc, bdod, cec, ph])
                  .clip(combinedArea)
                  .unmask(-9999);

// 4. DYNAMIC BALANCED SAMPLING (Addressing Reviewer Feedback)
var exclusionDistance = 100; // 100m buffer to reduce spatial autocorrelation
var randomSeed = 42;

function generateBalancedAbsence(areaFC, gulliesFC) {
  var nPresence = gulliesFC.size(); 
  var gullyBuffers = gulliesFC.map(function(f) { return f.buffer(exclusionDistance); });
  var exclusion = gullyBuffers.geometry();
  var available = areaFC.geometry().difference(exclusion, 1);
  
  var pts = ee.FeatureCollection.randomPoints({
    region: available,
    points: nPresence, // 1:1 balanced ratio implementation
    seed: randomSeed
  });
  return pts.map(function(pt){ return pt.set('Presence', 0); });
}

var abs_idemili = generateBalancedAbsence(idemili, gullies_idemili);
var abs_awka = generateBalancedAbsence(awka, gullies_awka);

gullies_idemili = gullies_idemili.map(function(f){ return f.set('Presence', 1); });
gullies_awka = gullies_awka.map(function(f){ return f.set('Presence', 1); });

var final_idemili = gullies_idemili.merge(abs_idemili);
var final_awka = gullies_awka.merge(abs_awka);

// 5. FEATURE EXTRACTION
var extractIdemili = envStack.sampleRegions({
  collection: final_idemili,
  scale: 30,
  geometries: true,
  tileScale: 4
}).filter(ee.Filter.neq('Elevation', -9999));

var extractAwka = envStack.sampleRegions({
  collection: final_awka,
  scale: 30,
  geometries: true,
  tileScale: 4
}).filter(ee.Filter.neq('Elevation', -9999));

// 6. OUTPUTS & EXPORT
print('Idemili Balanced Samples:', extractIdemili.size());
print('Awka Balanced Samples:', extractAwka.size());

Export.table.toDrive({
  collection: extractIdemili,
  description: 'Balanced_Samples_Idemili_162_v2',
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: extractAwka,
  description: 'Balanced_Samples_Awka_23_v2',
  fileFormat: 'CSV'
});
