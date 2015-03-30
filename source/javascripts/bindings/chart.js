define(['knockout', 'charts/summary', 'charts/energyDemand', 'charts/energySupply', 'charts/electricityDemand', 'charts/electricitySupply', 'charts/energyEmissions', 'charts/electricityEmissions', 'charts/flows', 'charts/map', 'charts/airQuality', 'charts/costsContext', 'charts/costsCompared', 'charts/costsSensitivity', 'charts/costsSensitivityComponents', 'charts/overview'], function(ko, SummaryChart, EnergyDemandChart, EnergySupplyChart, ElectricityDemandChart, ElectricitySupplyChart, EnergyEmissionsChart, ElectricityEmissionsChart, FlowsChart, MapChart, AirQualityChart, CostsContextChart, CostsComparedChart, CostsSensitivityChart, CostsSensitivityComponentsChart, OverviewChart) {
  'use strict';

  ko.bindingHandlers.chart = {
    init: function(element, valueAccessor, allBindings) {
      var name = valueAccessor();
      var data = allBindings.get('data');
      var object = allBindings.get('object');

      element.name = name;
      element.data = data;

      element.params = allBindings.get('params') || {};
      element.classList.add(name);

      if(typeof object === "undefined") {
        self.chart = eval("new " + name);
      } else {
        self.chart = object;
      }

      self.chart.init(element, element.params);
      element.chart = self.chart;

      // Redraw on window resize
      window.addEventListener("resize", function () {
        ko.bindingHandlers.chart.draw(element, name);
      });
    },

    update: function(element, valueAccessor, allBindings) {
      var name = valueAccessor();
      var data = allBindings.get('data');

      var deferDrawing = element.params.deferDrawing;
      var autoSize = element.params.autoSize;

      element.name = name;
      element.data = data;

      // TODO: map needs data to be evaluated so update called?
      if(typeof data !== "object") {
        data();
      }

      // If data observable not (yet) set
      // (Data can be both object and KO observable)
      if(typeof deferDrawing !== "undefined" && deferDrawing() === true) {
        return false;
      }

      // Chart can be sized based on background image
      if(autoSize !== true) {
        // Normal draw
        ko.bindingHandlers.chart.draw(element, name);
      } else {
        // Defer loading until first child (image) has loaded
        if(element.drawn) {
          ko.bindingHandlers.chart.draw(element, name);
        } else {
          element.children[0].onload = function() {
            element.drawn = true;
            ko.bindingHandlers.chart.draw(element, name);
          }
        }
      }
    },

    draw: function(element, name) {
      // Do not draw charts that are not visible
      if(!element.offsetParent) { return; }

      name = name || element.name;

      var containerStyle = window.getComputedStyle(element);

      var width = parseInt(containerStyle.width, 10) - parseInt(containerStyle.paddingLeft, 10) - parseInt(containerStyle.paddingRight, 10);
      var height = parseInt(containerStyle.height, 10) - parseInt(containerStyle.paddingTop, 10) - parseInt(containerStyle.paddingBottom, 10);

      // Whether data is object or KO observable
      if(typeof element.data === "object") {
        // Multiple pathway chart
        element.chart.draw(element.data, width, height);
      } else {
        // Single pathway chart
        element.chart.draw(element.data()[name], width, height);
      }
    },

    redrawElements: function(elementNodelist) {
      for(var i = 0; i < elementNodelist.length; i++) {
        ko.bindingHandlers.chart.draw(elementNodelist[i]);
      };
    }


  };

});
