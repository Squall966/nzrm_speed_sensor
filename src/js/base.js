/*! NZ Grass-fed Difference by Squall Lion@2022 |  This Class uses JQuery  */
class Base {
  constructor() {
    this.idleTimer = null;
    this.idleCount = 0;
    this.idleTimeoutCount = 30; // idleTimeoutCount * idleTimeoutDuration(10) is the actual seconds DEFAULT: 30
    this.idleTimeoutDuration = 10; // idleTimeoutDuration * 1000  DEFAULT: 10
    this.consoleIdleTimer = false;

    this.masterHtml = $("html");

    this.timerCircleTl;
  }

  init() {
    const self = this;
    console.log("### Base init");

    const resetTimer = () => {
      self.idleCount = 0;
      console.log(`Idle timer count: `, self.idleCount);
    };
    // document.querySelector("html").removeEventListener("click", resetTimer);
    document.querySelector("html").addEventListener("click", resetTimer, false);
  }

  goHome(refresh = false) {
    barba.go("index.html");
    if (refresh) window.location.reload();
  }

  startIdleTimer(timeout = this.idleTimeoutCount, goHome = true) {
    const self = this;
    if (!self.idleTimer) {
      console.log(`### Idle Timer starts. Timer: ${timeout}`);
      self.idleTimer = setInterval(() => {
        self.idleCount += 1;

        if (self.idleCount == self.idleTimeoutCount - 1) {
          self.startTimerCircleAnimation();
        }

        if (self.idleCount >= timeout) {
          if (goHome) {
            /** FOR BARBA JS */
            if (barba.history.current.ns == "home") {
              window.location.reload();
            } else {
              self.goHome();
            }
          } else {
            self.goIdle(true);
          }
          self.stopIdleTimer();
        }
        if (self.consoleIdleTimer) console.log(`### Idle timer: ${self.idleCount} `);
      }, self.idleTimeoutDuration * 1000);
    }
  }

  stopIdleTimer() {
    const self = this;
    if (self.idleTimer) {
      console.log("### Idle timer stops");
      clearInterval(self.idleTimer);
      self.idleTimer = null;
      self.idleCount = 0;
    }
  }

  resetTimer = () => {
    const self = this;
    self.idleCount = 0;
    console.log(`Idle timer reset: `, self.idleCount);
  };

  lockHtml(ele) {
    ele = ele == null ? $("html") : ele;
    $(ele).addClass("interaction-off");
  }

  releaseHtml(ele) {
    ele = ele == null ? $("html") : ele;
    $(ele).removeClass("interaction-off");
  }

  timerCircleAnimation() {
    const _this = this;
    const defaultText = 10;

    _this.timerCircleTl = new ProgressBar.Circle("#progress", {
      color: "#00539a",
      duration: defaultText * 1000,
      strokeWidth: 3.5,
      text: {
        value: defaultText,
        className: "timeout-timer-digit",
      },
    });

    _this.timerCircleTl.set(1);

    $("#timeout-popup-container").hide();

    console.log("### Timer circle animation set ###");
  }

  startTimerCircleAnimation() {
    const _this = this;
    const defaultText = 10;

    if (!_this.timerCircleTl) return false;

    $("#timeout-popup-container").fadeIn();

    _this.timerCircleTl.animate(
      0,
      {
        step: function (state, circle) {
          $(".timeout-timer-digit").html(Math.round(circle.value() * 10));
        },
      },
      function () {
        console.log("DONE@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        _this.timerCircleTl.set(1);
        _this.timerCircleTl.setText(defaultText);
      }
    );

    console.log("### Timer circle animation starts ###");
  }

  stopTimerCircleAnimation() {
    const _this = this;
    if (_this.timerCircleTl) {
      _this.resetTimer();
      // _this.timerCircleTl.stop();
      $("#timeout-popup-container").fadeOut(function () {
        // _this.timerCircleTl.set(1);
        // _this.timerCircleTl.setText(defaultText);
      });
    }
  }
}
