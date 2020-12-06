class waiting extends funcBase {
  start() {
    //effect
    super.start();
  }

  isParsonHandWashReady() {
    if (
      !super.isWaterFlow() &&
      super.isVlRangeIn() &&
      super.isCamGetCurrentPosition()
    ) {
      return true;
    } else {
      return false;
    }
  }
}
