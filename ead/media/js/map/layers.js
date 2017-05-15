define([
    'openlayers',
    'map/resource-layers',
    'map/layer-model',
    'layers-i18n'
], function(ol, resourceLayers, LayerModel, layerI18n) {
    var layers = resourceLayers.layers;

    layers.push(new LayerModel({
        name: 'Greco-Roman Map',
        categories: ['historical'],
        icon: 'fa fa-bookmark-o',
        infoContent: 'Roman Empire basemap, created by Johan Åhlfeldt with support from the Pelagios project. See credit info in bottom right-hand corner of this page for more information.',
        // 'Roman Empire basemap, created by Johan Åhlfeldt with support from the Pelagios project. <a href="http://pelagios.org/maps/greco-roman/about.html" target="blank">About this map</a>. <a href="http://dare.ht.lu.se/">interactive version</a>, <a href="http://commons.pelagios.org/2012/09/a-digital-map-of-the-roman-empire/">project background</a></p>',
        onMap: true,
        layer: new ol.layer.Tile({
            visible: false,
            source: new ol.source.XYZ({
                url: 'http://pelagios.org/tilesets/imperium/{z}/{x}/{y}.png',
                attributions: [
                    new ol.Attribution({
                      html: '<p style="font-size:14px;"><a href="http://pelagios.org/maps/greco-roman/about.html" target="blank">Pelagios project Greco-Roman basemap</a></p>'
                    })
                ]
            })
        })
    }));

    return layers;
});
