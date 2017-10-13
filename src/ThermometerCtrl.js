import _ from 'lodash';
import $ from 'jquery';

import rendering from './rendering';

import kbn from 'app/core/utils/kbn';
import config from 'app/core/config';
import TimeSeries from 'app/core/time_series2';
import { MetricsPanelCtrl } from 'app/plugins/sdk';

export class ThermometerCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;

    this.series = [];

    const panelDefaults = {
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
      colors: [
        "rgb(0, 0, 255)",
        "rgb(0, 255, 255)",
        "rgb(0, 255, 0)",
        "rgb(255, 255, 0)",
        "rgb(255, 128, 0)"
      ]  
    };
    _.defaults(this.panel, panelDefaults);
    
    this.valueNameOptions = [
      {value : 'min', text: 'Min'},
      {value : 'max', text: 'Max'},
      {value : 'avg', text: 'Average'},
      {value : 'current', text: 'Current'},
      {value : 'total', text: 'Total'},
      {value : 'name', text: 'Name'},
      {value : 'first', text: 'First'},
      {value : 'delta', text: 'Delta'},
      {value : 'diff', text: 'Difference'},
      {value : 'range', text: 'Range'},
      {value : 'last_time', text: 'Time of last point'}
    ];

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
    this.addEditorTab('Options', 'public/plugins/haneco-thermometer-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(subItem) {
    this.panel.format = subItem.value;
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  onDataReceived(dataList) {
    const data = {};
    if (dataList.length > 0 && dataList[0].type === 'table') {
      this.dataType = 'table';
      const tableData = dataList.map(this.tableHandler.bind(this));
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

  tableHandler(tableData) {
    const dataPoints = [];
    const columnNames = {};

    tableData.columns.forEach((column, columnIndex) => {
      columnNames[columnIndex] = column.text;
    });

    this.tableColumnOptions = columnNames;
    if (!_.find(tableData.columns, ['text', this.panel.tableColumn])) {
      if (this.tableColumnOptions.length === 1) {
        this.panel.tableColumn = this.tableColumnOptions[0];
      } else {
        this.panel.tableColumn = _.find(tableData.columns, (col) => {
          return col.type !== 'time';
        }).text;
      }
    }

    tableData.rows.forEach((row) => {
      const dataPoint = {};
      row.forEach((value, columnIndex) => {
        const key = columnNames[columnIndex];
        dataPoint[key] = value;
      });
      dataPoints.push(dataPoint);
    });

    return dataPoints;
  }
  
  setTableValues(tableData, data) {
    if (!tableData || tableData.length === 0) {
      return;
    }

    if (tableData[0].length === 0 || tableData[0][0][this.panel.tableColumn] === undefined) {
      return;
    }

    const datapoint = tableData[0][0];
    data.value = datapoint[this.panel.tableColumn];

    if (_.isString(data.value)) {
      data.valueFormatted = _.escape(data.value);
      data.value = 0;
      data.valueRounded = 0;
    } else {
      const decimalInfo = this.getDecimalsForValue(data.value);
      const formatFunc = kbn.valueFormats[this.panel.format];
      data.valueFormatted = formatFunc(datapoint[this.panel.tableColumn], decimalInfo.decimals, decimalInfo.scaledDecimals);
      data.valueRounded = kbn.roundValue(data.value, this.panel.decimals || 0);
    }
  }

  setValues(data) {
    data.flotpairs = [];

    if (this.series.length > 1) {
      const error = new Error();
      error.message = 'Multiple Series Error';
      error.data = `Metric query returns ${this.series.length} series. `
        + 'Thermometer Panel expects a single series.\n\nResponse:\n'
        + JSON.stringify(this.series);
      throw error;
    }

    if (this.series && this.series.length === 1) {
      let lastPoint = _.last(this.series[0].datapoints);
      let lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;

      if (this.panel.valueName === 'name') {
        data.value = 0;
        data.valueRounded = 0;
        data.valueFormatted = this.series[0].alias;
      } else if (_.isString(lastValue)) {
        data.value = 0;
        data.valueFormatted = _.escape(lastValue);
        data.valueRounded = 0;
      } else if (this.panel.valueName === 'last_time') {
        let formatFunc = kbn.valueFormats[this.panel.format];
        data.value = lastPoint[1];
        data.valueRounded = data.value;
        data.valueFormatted = formatFunc(data.value, 0, 0);
      } else {
        data.value = this.series[0].stats[this.panel.valueName];
        data.flotpairs = this.series[0].flotpairs;

        let decimalInfo = this.getDecimalsForValue(data.value);
        let formatFunc = kbn.valueFormats[this.panel.format];
        data.valueFormatted = formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
        data.valueRounded = kbn.roundValue(data.value, decimalInfo.decimals);
      }
    }
  }

  seriesHandler(seriesData) {
    const series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });

    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    return series;
  }

  getDecimalsForValue(value) {
    if (_.isNumber(this.panel.decimals)) {
      return {
        decimals: this.panel.decimals,
        scaledDecimals: null
      };
    }

    const delta = value / 2;
    let dec = -Math.floor(Math.log(delta) / Math.LN10);
    const magn = Math.pow(10, -dec);
    const norm = delta / magn; // norm is between 1.0 and 10.0
    let size;

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
    if (Math.floor(value) === value) { dec = 0; }

    const decimals = Math.max(0, dec);
    const result = {
      decimals: decimals,
      scaledDecimals: decimals - Math.floor(Math.log(size) / Math.LN10) + 2
    };

    return result;
  }

  formatValue(value) {
    const decimalInfo = this.getDecimalsForValue(value);
    const formatFunc = kbn.valueFormats[this.panel.format];
    if (formatFunc) {
      return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }
    return value;
  }

  onColorChange(panelColorIndex) {
    return (color) => {
      this.panel.colors[panelColorIndex] = color;
      this.render();
    };
  }

  getColor() {
    const value = this.data.value;
    const thresholds = this.panel.thresholds.split(',');

    if (!_.isFinite(value)) {
      return null;
    }
    for (let i = thresholds.length; i > 0; i--) {
      if (value >= thresholds[i-1]) {
        return this.panel.colors[i];
      }
    }
    return _.first(this.panel.colors);
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}

ThermometerCtrl.templateUrl = 'module.html';
