define([
    'jquery',
    'openlayers',
    'underscore',
    'arches'
], function($, ol, _, arches) {
    var baseLayers = arches.bingLayers;

    _.each(baseLayers, function(layer) {
        layer.layer = new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: arches.bingKey,
                imagerySet: layer.id
            })
        });
    });

    //set default map style to Roads
    baseLayers[2].layer.setVisible(true);

    // addition of pelagios roman basemap
    //
    // baseLayers.push({
        // id: 'DARE',
        // name: 'DARE/Pelagios',
        // icon: arches.urls.media + 'img/map/Pelagios.png',
        // layer: new ol.layer.Tile({
            // visible: false,
            // source: new ol.source.XYZ({
                // url: 'http://pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
                // attributions: [
                    // new ol.Attribution({
                      // html: '<p style="font-size:14px;"><a href="http://pelagios.org/maps/greco-roman/about.html" target="blank">Pelagios project Greco-Roman basemap</a></p>'
                    // })
                // ]
            // })
        // })
    // });

    return baseLayers;
});