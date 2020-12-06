class handWashReady extends funcBase {
  start() {
    //演出
    super.start();
  }

  isOutOfRange() {
    if (!super.isVlRangeIn() || !super.isCamGetCurrentPosition()) {
      return true;
    } else {
      return false;
    }
  }
}
