class Tv {
  constructor() {
    this.progressBar = null;
    this.progressBarDefaultText = 5;
  }

  init() {
    console.log("### TV class init###");
  }

  goHome() {
    console.log("### TV go home signal, the home should be 'index_tv.html' ###");
    barba.go("index_tv.html");
  }

  startTimerCircleAnimation() {
    const _this = this;
    const progressBarTimerDigit = "progress-bar-timer-digit";

    _this.progressBar = new ProgressBar.Circle("#progress", {
      color: "#FCB03C",
      duration: _this.progressBarDefaultText * 1000,
      strokeWidth: 4,
      text: {
        value: _this.progressBarDefaultText,
        className: progressBarTimerDigit,
      },
    });

    _this.progressBar.animate(1, {
      step: function (state, circle) {
        $(`.${progressBarTimerDigit}`).html(
          _this.progressBarDefaultText - Math.floor(circle.value() * _this.progressBarDefaultText)
        );
      },
      function() {
        console.log("DONE@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        // _this.progressBar.set(1);
        _this.progressBar.setText(_this.progressBarDefaultText);
      },
    });

    console.log("### Progress bar animation started ###");
  }
}
