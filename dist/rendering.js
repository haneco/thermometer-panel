'use strict';

System.register(['lodash', 'jquery', 'jquery.flot', 'jquery.flot.pie'], function (_export, _context) {
  "use strict";

  var _, $;

  function link(scope, elem, attrs, ctrl) {
    var data, panel;
    elem = elem.find('.thermometer-panel');
    var $tooltip = $('<div id="tooltip">');

    ctrl.events.on('render', function () {
      render(false);
    });

    function setElementHeight() {
      try {
        var height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }
        height -= 5 + (panel.title ? 24 : 9);
        elem.css('height', height + 'px');
        return true;
      } catch (e) {
        return false;
      }
    }

    function formatter(label, slice) {
      return "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
    }

    function addThermometer() {
      var width = elem.width();
      var height = elem.height();

      var size = Math.min(width, height);

      var min = panel.minValue;
      var max = panel.maxValue;
      var currentValue = data.value;

      var color = panel.colorGauge ? ctrl.getColor() : '#ff0000';
      var textColor = panel.colorValue ? ctrl.getColor() : 'inherit';

      var percentage = (currentValue - min) / (max - min) * 100;
      percentage = Math.min(percentage, 100);
      percentage = Math.max(percentage, 0);

      var ballSize = Math.max(Math.floor(height * 0.25), 20);
      var barWidth = ballSize * 0.4;
      var borderWidth = barWidth / 6;
      var boxShadowWidth = barWidth / 6;
      var colorBarWidth = barWidth - (borderWidth + boxShadowWidth) * 2;
      var html = '\n<span style="\n  margin:10px auto;\n  width:' + ballSize + 'px;\n  height:100%;\n  min-height:30px;\n  display:block;\n  position:relative;\n">\n  <!-- ball -->\n  <span style="\n    width:' + ballSize + 'px;\n    height:' + ballSize + 'px;\n    display:block;\n    position:absolute;\n    top:calc(100% - ' + ballSize + 'px);\n    background:' + color + ';\n    border-radius:' + ballSize + 'px;\n    border:' + borderWidth + 'px solid #fff;\n    box-shadow:inset 0 0 0 ' + boxShadowWidth + 'px #000;\n    "></span>\n  <!-- bar -->\n  <span style="\n    width:' + barWidth + 'px;\n    height:calc(100% - ' + (ballSize - borderWidth - boxShadowWidth / 3) + 'px);\n    display:block;\n    background:#333;        \n    border-radius:' + barWidth + 'px ' + barWidth + 'px 0 0;\n    border:' + borderWidth + 'px solid #fff;\n    border-bottom:none;\n    position:relative;\n    left:' + (ballSize / 2 - barWidth / 2) + 'px;\n    box-shadow:inset 0 0 0 ' + boxShadowWidth + 'px #000;\n  "></span>\n  <!-- color bar bottom -->\n  <span style="\n    width:' + colorBarWidth + 'px;\n    height:' + ballSize / 2 + 'px;\n    display:block;\n    position:absolute;\n    bottom:' + ballSize / 2 + 'px;\n    left:' + (ballSize / 2 - barWidth / 2 + boxShadowWidth + borderWidth) + 'px;\n    background:' + color + ';\n  "></span>\n  <!-- color bar wrapper -->\n  <span style="\n    width:' + colorBarWidth + 'px;\n    height:calc(100% - ' + (ballSize + 10) + 'px);\n    display:block;\n    position:absolute;\n    bottom:' + ballSize + 'px;\n    left:' + (ballSize / 2 - barWidth / 2 + boxShadowWidth + borderWidth) + 'px;\n  ">\n    <span style="\n      width:' + colorBarWidth + 'px;    \n      height:' + percentage + '%;\n      display:block;\n      position:absolute;\n      bottom:0;\n      left:0;\n      background:' + color + ';\n    "></span>\n  </span>\n  <span style="\n    position:absolute;\n    top:calc(50% - 1em);\n    left:' + (ballSize + 5) + 'px;\n    width:62px;\n    font-size:' + panel.fontSize + ';\n    font-weight:bold;\n    color:' + textColor + ';\n    ">' + data.valueFormatted + '</span>\n</span> \n';
      elem.html(html);
    }

    function render(incrementRenderCounter) {
      if (!ctrl.data) {
        return;
      }

      data = ctrl.data;
      panel = ctrl.panel;

      if (setElementHeight()) {
        addThermometer();
      }
      if (incrementRenderCounter) {
        ctrl.renderingCompleted();
      }
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
