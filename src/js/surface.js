class Surface {
  constructor() {
    this.funFactsContainer;
    this.tl = gsap.timeline();
    // this.topSpeedEl;
  }

  init() {
    const _this = this;

    _this.funFactsContainer = $(".fun-facts-container");
    // console.log(_this.funFactsContainer);

    _this.funFactsInit();

    console.log("### Surface Class init ###");
  }

  goHome() {
    console.log("### Surface go home signal, the home should be 'index_surface.html' ###");
    barba.go("index_surface.html");
  }

  funFactsInit() {
    const _this = this;
    _this.funFactOnClick();
  }

  funFactsAfterEnter(reverse = false) {
    const _this = this;
    if (!reverse) {
      $(".prompt-container").fadeOut();
      _this.tl.to($(".logo.surface"), { duration: 1, alpha: 1, display: "flex" });
    } else {
      $(".prompt-container").fadeIn();
      _this.tl.to($(".logo.surface"), { duration: 0.5, alpha: 0, display: "none" });
      _this.funFactOnClick();
    }
  }

  closeFunFactsContainer() {
    const _this = this;

    _this.tl.to(_this.funFactsContainer, {
      duration: 0.5,
      top: "80vh",
      ease: "power2.out",
      onComplete: () => _this.funFactsAfterEnter(true),
    });
  }

  funFactOnClick() {
    const _this = this;
    _this.funFactsContainer.on("click", () => {
      console.log("### Show random fun facts! ###");

      _this.tl.to(_this.funFactsContainer, {
        duration: 0.5,
        top: "7.5vh",
        ease: "power2.out",
        onComplete: () => _this.funFactsAfterEnter(),
      });

      _this.funFactsContainer.off("click");
    });
  }

  topSpeedPageInit() {
    let top_speed = mainApp.top_speed;
    $(".top-speed").html(top_speed);
  }
} // Surface Class
