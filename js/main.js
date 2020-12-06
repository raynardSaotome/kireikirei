let CHAPT_waiting = 0;
let CHAPT_handWashReady = 1;
let CHAPT_handWashing = 2;
let CHAPT_handWashSuccess = 3;
let CHAPT_handWashFault = 4;
let CHAPT_stopFlow = 5;
let HandWashReady_outOfRange_Wainting = 7000;

var nextChapter = 0;
var previousChapter = 0;
const mainloopInterval = 100;

window.onload = () => {
  function init() {
    var flag = {};
    flag.flow = new waterflowGetter(WATERFLOWSIGPORT, WATERFLOWFLAG, true);
    flag.vl = new VL53L0XGetter(false);
    // カメラはこれから
    var video = document.querySelector("#video");
    var canvas = document.querySelector("#overlay");
    var constraints = {
      audio: false,
      video: { width: { exact: 1280 }, height: { exact: 720 } }
    };
    flag.webcam = new webcam(video, canvas, constraints, true);
    return flag;
  }

  const funcWaiting = (chapter) => {
    //待ち受け
    if (chapter == CHAPT_waiting) {
      if (_waiting.isWaterFlow()) {
        // 水が流れている場合は、水停止に
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_waiting;
      } else {
        if (_waiting.isParsonHandWashReady()) {
          chapter = CHAPT_handWashReady;
        } else if (!_waiting.isYetStart()) {
          //最初に呼ばれた場合のみ、表示処理
          _waiting.start();
        }
      }
    }
  };

  const funcHandWashReady = (chapter) => {
    // 手洗い開始準備案内
    if (chapter == CHAPT_handWashReady) {
      if (_handWashReady.isOutOfRange()) {
        //距離　顔認識反応外
        if (_handWashReady.isWaterFlow()) {
          _handWashReady.stop();
          // 水が流れている場合は、水停止に
          chapter = CHAPT_stopFlow;
          // 呼び出し元を保存
          previousChapter = CHAPT_handWashReady;
        } else {
          //距離　顔認識反応外で水停止
          //人がいないので一定時間で、待ち受けに戻る
          if (_handWashReady.isYetStart) {
            var now = new Date();
            now.setMilliseconds(
              now.getMilliseconds() + HandWashReady_outOfRange_Wainting
            );
            if (now.getDate() > _handWashReady.funcStartTime.getDate()) {
              _handWashReady.stop();
              chapter = CHAPT_waiting;
            }
          }
        }
      } else {
        //距離　顔認識反応内
        if (!_handWashReady.isWaterFlow()) {
          // 水停止中
          if (!_handWashReady.isYetStart()) {
            //最初に呼ばれた場合のみ、処理
            _handWashReady.start();
          }
          // 認識はしているが一定時間手洗い開始しない場合の案内はいるか？
        } else {
          // 本画面の案内開始前に水が出ている場合
          if (!_handWashReady.isYetStart()) {
            //水が流れている場合は、水停止に
            chapter = CHAPT_stopFlow;
            // 呼び出し元を保存
            previousChapter = CHAPT_handWashReady;
          } else {
            // 認識範囲内で案内した後に水が出る
            // 手洗い中へ
            chapter = CHAPT_handWashing;
          }
        }
      }
    }
  };

  const funcHandWashing = (chapter) => {
    if (chapter == CHAPT_handWashing) {
      // 手洗い中
      if (!_handWashing.timeOver()) {
        if (!_handWashing.isYetStart()) {
          _handWashing.start();
        }

        if (_handWashing.isHandWashSuccess() == washSuccess) {
          //手洗い成功へ
          _handWashing.stop();
          chapter = CHAPT_handWashSuccess;
        } else if (_handWashing.isHandWashSuccess() == washFault) {
          //手洗い失敗へ
          _handWashing.stop();
          chapter = CHAPT_handWashFault;
        }
      } else {
        _handWashing.stop();
        //水停止へ
        chapter = CHAPT_stopFlow;
        // 呼び出し元を保存
        previousChapter = CHAPT_handWashing;
      }
    }
  };

  const funcHandWashSuccess = (chapter) => {
    //手洗い成功
    if (chapter == CHAPT_handWashSuccess) {
      if (!_handWashSuccess.isYetStart()) {
        _handWashSuccess.start();
      } else if (_handWashSuccess.effectDisplaied) {
        _handWashing.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
  };

  const funcHandWashFault = (chapter) => {
    //手洗い失敗
    if (chapter == CHAPT_handWashFault) {
      if (!_handWashFault.isYetStart()) {
        _handWashFault.start();
      } else if (_handWashSuccess.effectDisplaied) {
        _handWashFault.stop();
        //演出終了で、待ち受けに
        chapter = CHAPT_waiting;
      }
    }
  };

  const funcStopFlow = (chapter) => {
    //水停止
    if (chapter == CHAPT_stopFlow) {
      if (!_stopFlow.isWaterFlow()) {
        _stopFlow.stop();
        //呼び出しもとによって移動先を変更
        chapter = previousChapter;
      } else if (!_stopFlow.isYetStart()) {
        //最初に呼ばれた場合のみ、処理
        _stopFlow.start();
      }
    }
  };

  const mainloop = () => {
    funcWaiting(nextChapter);
    funcHandWashReady(nextChapter);
    funcHandWashing(nextChapter);
    funcHandWashSuccess(nextChapter);
    funcHandWashFault(nextChapter);
    funcStopFlow(nextChapter);
    window.setTimeout(mainloop, mainloopInterval);
  };

  // main start
  kira();

  nextChapter = CHAPT_waiting;

  var flagment = init();

  (async () => {
    var dist = document.getElementById("ddist");
    await flagment.vl.start(dist);
  })();

  (async () => {
    var dist = document.getElementById("fdist");
    await flagment.flow.start(dist);
  })();

  flagment.webcam.start(
    (() => {
      var dist = document.getElementById("cdist");
      return dist;
    })()
  );

  const _waiting = new waiting(flagment, undefined);
  const _handWashReady = new handWashReady(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashReady");
      return elem;
    })()
  );
  const _handWashing = new handWashing(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashing");
      return elem;
    })()
  );
  const _handWashSuccess = new handWashSuccess(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashSuccess");
      return elem;
    })()
  );
  const _handWashFault = new handWashFault(
    flagment,
    (() => {
      var elem = document.getElementById("elemHandWashFault");
      return elem;
    })()
  );
  const _stopFlow = new stopFlow(
    flagment,
    (() => {
      var elem = document.getElementById("elemStopFlow");
      return elem;
    })()
  );

  window.setTimeout(mainloop, mainloopInterval);
};
