'use strict';

System.register(['lodash', 'jquery', './rendering', 'app/core/utils/kbn', 'app/core/config', 'app/core/time_series2', 'app/plugins/sdk'], function (_export, _context) {
  "use strict";

  var _, $, rendering, kbn, config, TimeSeries, MetricsPanelCtrl, _createClass, ThermometerCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreConfig) {
      config = _appCoreConfig.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('ThermometerCtrl', ThermometerCtrl = function (_MetricsPanelCtrl) {
        _inherits(ThermometerCtrl, _MetricsPanelCtrl);

        function ThermometerCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, ThermometerCtrl);

          var _this = _possibleConstructorReturn(this, (ThermometerCtrl.__proto__ || Object.getPrototypeOf(ThermometerCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;

          _this.series = [];

          var panelDefaults = {
            links: [],
            datasource: null,
            cacheTimeout: null,
            nullPointMode: 'connected',
            format: 'none',
            valueName: 'current',
            fontSize: '100%',
            minValue: -20,
            maxValue: 50,
            thresholds: '-10,0,15,25',
            colorGauge: true,
            colorValue: false,
            colors: ["rgb(0, 0, 255)", "rgb(0, 255, 255)", "rgb(0, 255, 0)", "rgb(255, 255, 0)", "rgb(255, 128, 0)"]
          };
          _.defaults(_this.panel, panelDefaults);

          _this.valueNameOptions = [{ value: 'min', text: 'Min' }, { value: 'max', text: 'Max' }, { value: 'avg', text: 'Average' }, { value: 'current', text: 'Current' }, { value: 'total', text: 'Total' }, { value: 'name', text: 'Name' }, { value: 'first', text: 'First' }, { value: 'delta', text: 'Delta' }, { value: 'diff', text: 'Difference' }, { value: 'range', text: 'Range' }, { value: 'last_time', text: 'Time of last point' }];

          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(ThermometerCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
            this.addEditorTab('Options', 'public/plugins/haneco-thermometer-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.format = subItem.value;
            this.render();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var data = {};
            if (dataList.length > 0 && dataList[0].type === 'table') {
              this.dataType = 'table';
              var tableData = dataList.map(this.tableHandler.bind(this));
              this.setTableValues(tableData, data);
            } else {
              this.dataType = 'timeseries';
              this.series = dataList.map(this.seriesHandler.bind(this));
              this.setValues(data);
            }

            if (data.value === null || data.value === void 0) {
              data.valueFormatted = "no value";
            }

            this.data = data;
            this.render();
          }
        }, {
          key: 'tableHandler',
          value: function tableHandler(tableData) {
            var dataPoints = [];
            var columnNames = {};

            tableData.columns.forEach(function (column, columnIndex) {
              columnNames[columnIndex] = column.text;
            });

            this.tableColumnOptions = columnNames;
            if (!_.find(tableData.columns, ['text', this.panel.tableColumn])) {
              if (this.tableColumnOptions.length === 1) {
                this.panel.tableColumn = this.tableColumnOptions[0];
              } else {
                this.panel.tableColumn = _.find(tableData.columns, function (col) {
                  return col.type !== 'time';
                }).text;
              }
            }

            tableData.rows.forEach(function (row) {
              var dataPoint = {};
              row.forEach(function (value, columnIndex) {
                var key = columnNames[columnIndex];
                dataPoint[key] = value;
              });
              dataPoints.push(dataPoint);
            });

            return dataPoints;
          }
        }, {
          key: 'setTableValues',
          value: function setTableValues(tableData, data) {
            if (!tableData || tableData.length === 0) {
              return;
            }

            if (tableData[0].length === 0 || tableData[0][0][this.panel.tableColumn] === undefined) {
              return;
            }

            var datapoint = tableData[0][0];
            data.value = datapoint[this.panel.tableColumn];

            if (_.isString(data.value)) {
              data.valueFormatted = _.escape(data.value);
              data.value = 0;
              data.valueRounded = 0;
            } else {
              var decimalInfo = this.getDecimalsForValue(data.value);
              var formatFunc = kbn.valueFormats[this.panel.format];
              data.valueFormatted = formatFunc(datapoint[this.panel.tableColumn], decimalInfo.decimals, decimalInfo.scaledDecimals);
              data.valueRounded = kbn.roundValue(data.value, this.panel.decimals || 0);
            }
          }
        }, {
          key: 'setValues',
          value: function setValues(data) {
            data.flotpairs = [];

            if (this.series.length > 1) {
              var error = new Error();
              error.message = 'Multiple Series Error';
              error.data = 'Metric query returns ' + this.series.length + ' series. ' + 'Thermometer Panel expects a single series.\n\nResponse:\n' + JSON.stringify(this.series);
              throw error;
            }

            if (this.series && this.series.length === 1) {
              var lastPoint = _.last(this.series[0].datapoints);
              var lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;

              if (this.panel.valueName === 'name') {
                data.value = 0;
                data.valueRounded = 0;
                data.valueFormatted = this.series[0].alias;
              } else if (_.isString(lastValue)) {
                data.value = 0;
                data.valueFormatted = _.escape(lastValue);
                data.valueRounded = 0;
              } else if (this.panel.valueName === 'last_time') {
                var formatFunc = kbn.valueFormats[this.panel.format];
                data.value = lastPoint[1];
                data.valueRounded = data.value;
                data.valueFormatted = formatFunc(data.value, 0, 0);
              } else {
                data.value = this.series[0].stats[this.panel.valueName];
                data.flotpairs = this.series[0].flotpairs;

                var decimalInfo = this.getDecimalsForValue(data.value);
                var _formatFunc = kbn.valueFormats[this.panel.format];
                data.valueFormatted = _formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                data.valueRounded = kbn.roundValue(data.value, decimalInfo.decimals);
              }
            }
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'getDecimalsForValue',
          value: function getDecimalsForValue(value) {
            if (_.isNumber(this.panel.decimals)) {
              return {
                decimals: this.panel.decimals,
                scaledDecimals: null
              };
            }

            var delta = value / 2;
            var dec = -Math.floor(Math.log(delta) / Math.LN10);
            var magn = Math.pow(10, -dec);
            var norm = delta / magn; // norm is between 1.0 and 10.0
            var size = void 0;

            if (norm < 1.5) {
              size = 1;
            } else if (norm < 3) {
              size = 2;
              // special case for 2.5, requires an extra decimal
              if (norm > 2.25) {
                size = 2.5;
                ++dec;
              }
            } else if (norm < 7.5) {
              size = 5;
            } else {
              size = 10;
            }

            size *= magn;

            // reduce starting decimals if not needed
            if (Math.floor(value) === value) {
              dec = 0;
            }

            var decimals = Math.max(0, dec);
            var result = {
              decimals: decimals,
              scaledDecimals: decimals - Math.floor(Math.log(size) / Math.LN10) + 2
            };

            return result;
          }
        }, {
          key: 'formatValue',
          value: function formatValue(value) {
            var decimalInfo = this.getDecimalsForValue(value);
            var formatFunc = kbn.valueFormats[this.panel.format];
            if (formatFunc) {
              return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
            }
            return value;
          }
        }, {
          key: 'onColorChange',
          value: function onColorChange(panelColorIndex) {
            var _this2 = this;

            return function (color) {
              _this2.panel.colors[panelColorIndex] = color;
              _this2.render();
            };
          }
        }, {
          key: 'getColor',
          value: function getColor() {
            var value = this.data.value;
            var thresholds = this.panel.thresholds.split(',');

            if (!_.isFinite(value)) {
              return null;
            }
            for (var i = thresholds.length; i > 0; i--) {
              if (value >= thresholds[i - 1]) {
                return this.panel.colors[i];
              }
            }
            return _.first(this.panel.colors);
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return ThermometerCtrl;
      }(MetricsPanelCtrl));

      _export('ThermometerCtrl', ThermometerCtrl);

      ThermometerCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=ThermometerCtrl.js.map
