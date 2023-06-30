/* Imports */


    import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
    import * as am5 from "@amcharts/amcharts5";
    import * as am5map from "@amcharts/amcharts5/map";
    import * as am5geodata_worldLow from "./../assets/js/geodata/json/worldUltra.json";


export default function amWorld() {

    /* Chart code */
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdiv");


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root)
    ]);


    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
    let chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        paddingBottom: 20,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20
    }));


        // Create main polygon series for countries
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
        let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow
        }));

    polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        toggleKey: "active",
        interactive: true
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
        fill: root.interfaceColors.get("primaryButtonHover")
    });

    polygonSeries.mapPolygons.template.on("hit", function(event) {
      var target = event.target;
      var dataItem = target.dataItem;
      var countryName = dataItem.get("name");
      // Realiza las acciones necesarias cuando se hace clic en el país, por ejemplo:
      console.log("Clic en el país:", countryName);
    });

    // Create series for background fill
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
    let backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    backgroundSeries.mapPolygons.template.setAll({
        fill: root.interfaceColors.get("alternativeBackground"),
        fillOpacity: 0.1,
        strokeOpacity: 0
    });
    backgroundSeries.data.push({
        geometry: am5map.getGeoRectangle(90, 180, -90, -180)
    });


    // Create graticule series
    // https://www.amcharts.com/docs/v5/charts/map-chart/graticule-series/
    let graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({ strokeOpacity: 0.1, stroke: root.interfaceColors.get("alternativeBackground") })


    // Rotate animation
    chart.animate({
        key: "rotationX",
        from: 0,
        to: 360,
        duration: 30000,
        loops: Infinity
    });

        // Set up events
var previousPolygon;

polygonSeries.mapPolygons.template.on("active", function(active, target) {
  if (previousPolygon && previousPolygon != target) {
    previousPolygon.set("active", false);
  }
  if (target.get("active")) {
    selectCountry(target.dataItem.get("id"));
  }
  previousPolygon = target;
});

function selectCountry(id) {
  var dataItem = polygonSeries.getDataItemById(id);
  var target = dataItem.get("mapPolygon");
  if (target) {
    var centroid = target.geoCentroid();
    if (centroid) {
      chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
    }
  }
}

        // Set up events
var previousPolygon;

polygonSeries.mapPolygons.template.on("active", function(active, target) {
  if (previousPolygon && previousPolygon != target) {
    previousPolygon.set("active", false);
  }
  if (target.get("active")) {
    selectCountry(target.dataItem.get("id"));
  }
  previousPolygon = target;
});

function selectCountry(id) {
  var dataItem = polygonSeries.getDataItemById(id);
  var target = dataItem.get("mapPolygon");
  if (target) {
    var centroid = target.geoCentroid();
    if (centroid) {
      chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
    }
  }
}


    // Make stuff animate on load
    chart.appear(1000, 100);

	//Fix Map position

	const mapDiv = document.querySelectorAll('div');
    mapDiv[9].style.left = -100 + 'px';
}