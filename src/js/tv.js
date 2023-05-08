class Tv {
  constructor() {
    this.progressBar = null;
    this.progressBarEl;
    this.progressBarDefaultText = mainApp.ipcSendSync(
      "get-single-config",
      "get_ready_time_out_progress_bar"
    );
    this.progressBarTimerDigit;
    this.body;
    this.tl = gsap.timeline({ defaults: { duration: 1, display: "flex" } });
    this.getReadyTimeout = mainApp.ipcSendSync("get-single-config", "get_ready_time_out_text");
    this.funFact;
    this.speedPageDelay = mainApp.ipcSendSync("get-single-config", "top_speed_page_delay");
    this.speedPageTimer;
    this.progressBarDelay = mainApp.ipcSendSync("get-single-config", "progress_bar_delay");
  }

  init() {
    const _this = this;
    _this.progressBarSetup();

    _this.body = $(".get-ready-text");
    /**
     * Get ready fade in
     */
    _this.tl.to(_this.body, { alpha: 1 });
    _this.tl.to(_this.body, {
      alpha: 0,
      display: "none",
      delay: _this.getReadyTimeout,
      duration: 0.3,
    });
    _this.tl.to(_this.progressBarEl, {
      alpha: 1,
      duration: 0.3,
      onComplete: () => _this.startTimerCircleAnimation(true),
    });

    console.log("### TV class init ###");
  }

  goHome() {
    console.log("### TV go home signal, the home should be 'index_tv.html' ###");
    window.nzrm.send("top-speed-toggle", "false");
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
          let int =
            _this.progressBarDefaultText -
            Math.floor(circle.value() * _this.progressBarDefaultText);
          let display_text = int;

          if (int <= 0) display_text = "GO";
          $(`.${_this.progressBarTimerDigit}`).html(display_text);
        },
      },
      function () {
        console.log("### Progress bar animated done, proceed to next page. ###");
        console.log(`### Top Speed now: ${mainApp.top_speed} ###`);

        // Delay a second before going to next page
        setTimeout(() => {
          if (isNavigate) barba.go("speed_tv.html");
          window.nzrm.send("top-speed-toggle", true);
          console.log("### Top Speed Signal Toggle = ", mainApp.topSpeedSignalToggle);
        }, _this.progressBarDelay * 1000);
      }
    );

    console.log("### Progress bar animation started ###");
  }

  randomFunFact() {
    const _this = this;

    let facts = mainApp.funFacts;
    let index = Math.round(Math.random() * facts.length) - 1;

    if (index < 0) index = 0;
    if (index > facts.length - 1) index = facts.length - 1;

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

      // console.warn("!!! GO HOME turned off for DEV !!!");
      window.nzrm.send("go-home", true);
      window.nzrm.send("reset-top-speed", true);
    }, _this.speedPageDelay * 1000);
  }
}
