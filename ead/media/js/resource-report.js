require([
    'jquery',
    'underscore',
    'arches',
    'bootstrap',
    'views/map',
    'openlayers', 
    'knockout',
    'utils',
    'map/map-tools'
], function($, _, arches, bootstrap, MapView, ol, ko, utils) {
    var ReportView = Backbone.View.extend({

        initialize: function(options) { 
            var resize;
            var self = this;
            var resource_geometry = $('#resource_geometry');
            var resource_centroid = $('#resource_centroid');
            
            if(resource_geometry.length > 0){
                var geom = JSON.parse(resource_geometry.val());
                this.map = new MapView({
                    el: $('#map')
                });

                ko.applyBindings(this.map, $('#basemaps-panel')[0]);

                this.highlightFeatures(JSON.parse(resource_geometry.val()));
                this.zoomToResource('1');

                var hideAllPanels = function(){
                    $("#basemaps-panel").addClass("hidden");

                    //Update state of remaining buttons
                    $("#inventory-basemaps")
                        .removeClass("arches-map-tools-pressed")
                        .addClass("arches-map-tools")
                        .css("border-bottom-left-radius", "1px");
                };

                //Inventory-basemaps button opens basemap panel
                $("#inventory-basemaps").click(function (){
                    if ($(this).hasClass('arches-map-tools-pressed')) {
                        hideAllPanels();
                    } else {
                        $("#basemaps-panel").removeClass("hidden");

                        //Update state of current button and adjust position
                        $("#inventory-basemaps")
                            .addClass("arches-map-tools-pressed")
                            .removeClass("arches-map-tools")
                            .css("border-bottom-left-radius", "5px");
                    }
                });

                $(".basemap").click(function (){ 
                    var basemap = $(this).attr('id');
                    _.each(self.map.baseLayers, function(baseLayer){ 
                        baseLayer.layer.setVisible(baseLayer.id == basemap);
                    });
                    hideAllPanels();
                });

                //Close Button
                $(".close").click(function (){ 
                    hideAllPanels();
                });
                
                // DO DISPLAY STUFF WITH THE CENTROID
                var centroid = JSON.parse(resource_centroid.val())
                var coord_display = MakeCoordDisplayString(centroid,include_dd=true);
                $("#dms-coords-section").html(coord_display);
                // construct the google maps link with this formula
                // https://stackoverflow.com/questions/2660201/what-parameters-should-i-use-in-a-google-maps-url-to-go-to-a-lat-lon?answertab=votes#tab-top
                // zoom parameter doesn't work though
                
                var gm = 'http://maps.google.com/maps?z=7&t=k&q=loc:'+centroid[1]+'+'+centroid[0]
                $("#gmaps-link").attr('href',gm)
               
            }else{
                $('.block-description').css('marginTop', '-40px');
                $('#map-container').hide();
            }

            var resize = function() {
                var header = $('.breadcrumbs').outerHeight() + $('.header').outerHeight();
                $('#report-body').height($(window).height() - header);
            };            

            $('body').removeClass('scroll-y');
            resize();
            $(window).resize(resize); 

            _.each($('.report-item-list'), function(list) {
                if ($(list).find('.report-list-item').length === 0) {
                    $(list).find('.empty-message').show();
                }
            })
            
            $("#print-btn").click( function() {
                // there is @media print styling in package.css that makes this work
                window.print();
            });

        },

        zoomToResource: function(resourceid){
            this.cancelFitBaseLayer = true;
            var feature = this.selectedFeatureLayer.getSource().getFeatureById(resourceid);
            if(feature.getGeometry().getGeometries().length > 1){
                var extent = feature.getGeometry().getExtent();
                var minX = extent[0];
                var minY = extent[1];
                var maxX = extent[2];
                var maxY = extent[3];
                var polygon = new ol.geom.Polygon([[[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY], [minX, minY]]]);
                this.map.map.getView().fitGeometry(polygon, this.map.map.getSize(), {maxZoom:8});
            }else{
                this.map.map.getView().fitGeometry(feature.getGeometry().getGeometries()[0], this.map.map.getSize(), {maxZoom:8});                    
            }
        },

        highlightFeatures: function(geometry){
            var source, geometries;
            var self = this;
            var f = new ol.format.GeoJSON({defaultDataProjection: 'EPSG:4326'});

            if(!this.selectedFeatureLayer){
                var zIndex = 0;
                var styleCache = {};

                var style = function(feature, resolution) {
                    return [new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(66, 139, 202, 0.4)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(66, 139, 202, 0.9)',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 10,
                            fill: new ol.style.Fill({
                                color: 'rgba(66, 139, 202, 0.4)'
                            }),
                            stroke: new ol.style.Stroke({
                                color: 'rgba(66, 139, 202, 0.9)',
                                width: 2
                            })
                        })
                    })];
                };                     
                this.selectedFeatureLayer = new ol.layer.Vector({
                    source: new ol.source.GeoJSON(),
                    style: style
                });
                this.map.map.addLayer(this.selectedFeatureLayer);  
            }
            this.selectedFeatureLayer.getSource().clear();

            feature = {
                'type': 'Feature',
                'id': '1',
                'geometry':  geometry
            };

            this.selectedFeatureLayer.getSource().addFeature(f.readFeature(feature, {featureProjection: 'EPSG:3857'}));
        }
    });

    new ReportView();
});
