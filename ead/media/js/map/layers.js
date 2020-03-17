define([
    'openlayers',
    'map/resource-layers',
    'map/layer-model',
    'layers-i18n'
], function(ol, resourceLayers, LayerModel, layerI18n) {
    var layers = resourceLayers.layers;
    
    // remove the layer showing all resources from map
    // also improve the name and description
    for (i = 0; i < layers.length; i++) {
        if (layers[i].id == "all") {
            layers[i].onMap = false;
            layers[i].name = "All Sites and Complexes";
            layers[i].description = "";
        }
    } 

    layers.push(new LayerModel({
        name: layerI18n.exampleLayerName,
        categories: [layerI18n.exampleCategory],
        icon: 'fa fa-bookmark-o',
        infoContent: layerI18n.exampleContent,
        layer: new ol.layer.Tile({
            source: new ol.source.XYZ({url: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png'})
        })
    }));

    return layers;
});
