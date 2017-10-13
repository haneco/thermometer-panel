import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';

export default function link(scope, elem, attrs, ctrl) {
  var data, panel;
  elem = elem.find('.thermometer-panel');
  var $tooltip = $('<div id="tooltip">');

  ctrl.events.on('render', function() {
    render(false);
  });

  function setElementHeight() {
    try {
      let height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }
      height -= 5 + (panel.title ? 24 : 9);
      elem.css('height', height + 'px');
      return true;
    } catch(e) {
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

    const min = panel.minValue;
    const max = panel.maxValue;
    const currentValue = data.value;

    const color = panel.colorGauge ? ctrl.getColor() : '#ff0000';
    const textColor = panel.colorValue ? ctrl.getColor() : 'inherit';
    
    let percentage = (currentValue - min) / (max - min) * 100;
    percentage = Math.min(percentage, 100);
    percentage = Math.max(percentage, 0);

    const ballSize = Math.max(Math.floor(height * 0.25), 20);
    const barWidth = ballSize * 0.4;
    const borderWidth = barWidth / 6;
    const boxShadowWidth = barWidth / 6;
    const colorBarWidth = barWidth - (borderWidth + boxShadowWidth) * 2;
    const html = `
<span style="
  margin:10px auto;
  width:${ballSize}px;
  height:100%;
  min-height:30px;
  display:block;
  position:relative;
">
  <!-- ball -->
  <span style="
    width:${ballSize}px;
    height:${ballSize}px;
    display:block;
    position:absolute;
    top:calc(100% - ${ballSize}px);
    background:${color};
    border-radius:${ballSize}px;
    border:${borderWidth}px solid #fff;
    box-shadow:inset 0 0 0 ${boxShadowWidth}px #000;
    "></span>
  <!-- bar -->
  <span style="
    width:${barWidth}px;
    height:calc(100% - ${ballSize - borderWidth - boxShadowWidth / 3}px);
    display:block;
    background:#333;        
    border-radius:${barWidth}px ${barWidth}px 0 0;
    border:${borderWidth}px solid #fff;
    border-bottom:none;
    position:relative;
    left:${ballSize / 2 - barWidth / 2}px;
    box-shadow:inset 0 0 0 ${boxShadowWidth}px #000;
  "></span>
  <!-- color bar bottom -->
  <span style="
    width:${colorBarWidth}px;
    height:${ballSize / 2}px;
    display:block;
    position:absolute;
    bottom:${ballSize / 2}px;
    left:${ballSize / 2 - barWidth / 2 + boxShadowWidth + borderWidth}px;
    background:${color};
  "></span>
  <!-- color bar wrapper -->
  <span style="
    width:${colorBarWidth}px;
    height:calc(100% - ${ballSize + 10}px);
    display:block;
    position:absolute;
    bottom:${ballSize}px;
    left:${ballSize / 2 - barWidth / 2 + boxShadowWidth + borderWidth}px;
  ">
    <span style="
      width:${colorBarWidth}px;    
      height:${percentage}%;
      display:block;
      position:absolute;
      bottom:0;
      left:0;
      background:${color};
    "></span>
  </span>
  <span style="
    position:absolute;
    top:calc(50% - 1em);
    left:${ballSize + 5}px;
    width:62px;
    font-size:${panel.fontSize};
    font-weight:bold;
    color:${textColor};
    ">${data.valueFormatted}</span>
</span> 
`;
    elem.html(html);
  }

  function render(incrementRenderCounter) {
    if (!ctrl.data) { return; }

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

