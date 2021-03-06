//const webcamTrackingInterval = 20;
class webcam {
  constructor(
    videoElem,
    canvasElem,
    constraints,
    postponement = 3000,
    debug = false
  ) {
    /* コンストラクタ */
    this.video = videoElem;
    this.canvas = canvasElem;
    this.constraints = {
      audio: false,
      video: { width: { exact: 320 }, height: { exact: 240 } }
    };
    this.context = this.canvas.getContext("2d");
    this.track = new clm.tracker({
      useWebGL: true
    });
    this.postponement = postponement;
    this.trackingLimiitTime = undefined;
    this.isTracked = false;
    this.debug = debug;
  }

  start(elem) {
    var _this = this;

    function adjustVideo() {
      // 映像が画面幅いっぱいに表示されるように調整
      var ratio = window.innerWidth / _this.video.videoWidth;

      _this.video.width = window.innerWidth;
      _this.video.height = _this.video.videoHeight * ratio;
      _this.canvas.width = _this.video.width;
      _this.canvas.height = _this.video.height;
    }

    function startTracking() {
      // トラッキング開始
      _this.track.start(_this.video);
      drawLoop(_this);
    }

    function drawLoop() {
      // 描画をクリア
      _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
      // videoをcanvasにトレース
      _this.context.drawImage(
        _this.video,
        0,
        0,
        _this.canvas.width,
        _this.canvas.height
      );

      if (_this.track.getCurrentPosition()) {
        // 顔のパーツの現在位置が存在
        if (_this.debug) {
          console.log("cCam:now Track");
        }
        if (!_this.trackingLimiitTime) {
          _this.trackingLimiitTime = new Date();
          _this.trackingLimiitTime = _this.trackingLimiitTime.setMilliseconds(
            _this.trackingLimiitTime.getMilliseconds() + _this.postponement
          );
        }
        _this.isTracked = true;
        if (_this.debug) {
          _this.track.draw(_this.canvas);
        }
      } else {
        if (
          !_this.trackingStartime ||
          new Date().getDate() >= _this._this.trackingLimiitTime.getDate()
        ) {
          _this.isTracked = false;
          _this.trackingStartime = undefined;
        }
      }
      if (elem) {
        elem.innerHTML = _this.isTracked;
      }
      requestAnimationFrame(drawLoop);
    }

    this.track.init(pModel);

    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then((stream) => {
        this.video.srcObject = stream;
        // 動画のメタ情報のロードが完了したら実行
        this.video.onloadedmetadata = function () {
          adjustVideo(_this);
          startTracking(_this);
        };
      })
      .catch((err) => {
        window.alert(err.name + ": " + err.message);
      });
  }

  get isTracking() {
    return this.isTracked;
  }
}
