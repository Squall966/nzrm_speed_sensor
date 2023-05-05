class Tv {
  constructor() {
    this.progressBar = null;
    this.progressBarEl;
    this.progressBarDefaultText = 3;
    this.progressBarTimerDigit;
    this.body;
    this.tl = gsap.timeline({ defaults: { duration: 1, display: "flex" } });
    this.getReadyTimeout = 3;
    this.funFact;
    this.speedPageDelay = 10;
    this.speedPageTimer;
  }

  init() {
    const _this = this;
    _this.progressBarSetup();

    _this.body = $(".get-ready-text");
    /**
     * Get ready fade in
     */
    _this.tl.to(_this.body, { alpha: 1 });
    _this.tl.to(_this.body, { alpha: 0, display: "none", delay: _this.getReadyTimeout });
    _this.tl.to(_this.progressBarEl, {
      alpha: 1,
      onComplete: () => _this.startTimerCircleAnimation(true),
    });

    console.log("### TV class init###");
  }

  goHome() {
    console.log("### TV go home signal, the home should be 'index_tv.html' ###");
    barba.go("index_tv.html");
  }

  progressBarSetup() {
    const _this = this;
    _this.progressBarTimerDigit = "progress-bar-timer-digit";

    _this.progressBar = new ProgressBar.Circle("#progress", {
      color: "#211E1A",
      // duration: _this.progressBarDefaultText * 1000,
      strokeWidth: 4,
      trailWidth: 4,
      trailColor: "#865C27",
      text: {
        value: _this.progressBarDefaultText,
        className: _this.progressBarTimerDigit,
      },
    });

    _this.progressBarEl = $("#progress");
  }

  startTimerCircleAnimation(isNavigate = true) {
    const _this = this;

    _this.progressBar.animate(
      1,
      {
        duration: _this.progressBarDefaultText * 1000,
        step: function (state, circle) {
          $(`.${_this.progressBarTimerDigit}`).html(
            _this.progressBarDefaultText - Math.floor(circle.value() * _this.progressBarDefaultText)
          );
        },
      },
      function () {
        console.log("### Progress bar animated done, proceed to next page. ###");
        console.log(`### Top Speed now: ${mainApp.top_speed} ###`);
        if (isNavigate) barba.go("speed_tv.html");
      }
    );

    console.log("### Progress bar animation started ###");
  }

  randomFunFact() {
    const _this = this;

    let facts = mainApp.funFacts;
    let index = Math.round(Math.random() * facts.length);
    _this.funFact = facts[index];
    $(".content").html(_this.funFact);
  }

  displayTopSpeed() {
    $(".top-speed").html(mainApp.top_speed);
  }

  speedPageTimeOut() {
    const _this = this;

    if (_this.speedPageTimer) return;
    _this.speedPageTimer = setTimeout(() => {
      clearTimeout(_this.speedPageTimer);
      _this.speedPageTimer = null;

      console.warn("!!! GO HOME turned off for DEV !!!");
      // window.nzrm.send("go-home", true);
    }, _this.speedPageDelay * 1000);
  }
}
