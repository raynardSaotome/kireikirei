class funcBase {
  constructor(flagment, elem, debug = false) {
    /* コンストラクタ */
    this.vl = flagment.vl;
    this.flow = flagment.flow;
    this.cam = flagment.cam;
    this.isStart = false;
    this.funcStartTime = undefined;
    this.effectElem = elem;
    this.effectDisplaied = false;
    this.effectTimeourId = 0;
  }

  isWaterFlow() {
    return this.flow.isFlow;
  }

  isVlRangeIn() {
    return this.vl.isVlRangeIn;
  }

  isCamGetCurrentPosition() {
    return this.cam.isTracking;
  }

  start() {
    var _this = this;
    if (!this.effectElem) {
      $(this.effectElem).fadeIn("normal", () => {
        _this.effectTimeourId = window.setTimeout(() => {
          _this.effectDisplaied = true;
        }, 3000);

        _this.isStart = true;
      });
    } else {
      this.isStart = true;
    }
    this.funcStartTime = new Date();
  }

  isYetStart() {
    return this.isStart;
  }

  stop() {
    window.clearTimeout(this.effectTimeourId);
    var _this = this;
    if (!this.effectElem) {
      $(this.effectElem).fadeOut("fast", () => {
        _this.isStart = false;
      });
    } else {
      _this.isStart = false;
    }
  }
}
