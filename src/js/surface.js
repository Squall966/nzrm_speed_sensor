class Surface {
  constructor() {
    this.funFactsContainer;
    this.tl = gsap.timeline();
    // this.topSpeedEl;

    this.facts = [
      "Surface-10m",
      "surface_0000s_0000_Human",
      "surface_0000s_0001_pets",
      "surface_0000s_0002_Tesla",
      "surface_0000s_0003_cheetah-2",
      "surface_0000s_0004_cheetah-1",
      "surface_0000s_0005_usain-bolt",
    ];

    this.fact;
    this.isFunFactsActive = false;
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
    if (this.isFunFactsActive) this.closeFunFactsContainer();
    // window.nzrm.send("top-speed-toggle", "false");
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
      _this.tl.to($(".logo.surface"), {
        duration: 1,
        alpha: 1,
        display: "flex",
        onComplete: () => {
          mainApp.releaseHtml();
        },
      });
      _this.funFactImageShow();
      _this.isFunFactsActive = true;
    } else {
      $(".prompt-container").fadeIn();
      _this.tl.to($(".logo.surface"), {
        duration: 0.5,
        alpha: 0,
        display: "none",
        onComplete: () => {
          mainApp.releaseHtml();
        },
      });
      _this.isFunFactsActive = false;
      _this.funFactOnClick();
    }
  }

  closeFunFactsContainer() {
    const _this = this;
    mainApp.lockHtml();

    _this.funFactImageHide();

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
      mainApp.lockHtml();

      _this.tl.to(_this.funFactsContainer, {
        duration: 0.5,
        top: "7.5vh",
        ease: "power2.out",
        onComplete: () => _this.funFactsAfterEnter(),
      });

      const facts = _this.facts;
      let index = Math.round(Math.random() * facts.length) - 1;
      if (index < 0) index = 0;
      if (index > facts.length - 1) index = facts.length - 1;
      _this.fact = facts[index];
      $(".fun-fact-image").attr("src", `./images/${_this.fact}.png`);
      console.log("### Fun facts image set / reset ###");

      _this.funFactsContainer.off("click");
    });
  }

  topSpeedPageInit() {
    // let top_speed = mainApp.top_speed;
    $(".top-speed").html("0");
  }

  funFactImageShow() {
    // this.tl.to($(".fun-fact-image"), { alpha: 1, duration: 0.7, display: "flex" });
    gsap.to($(".fun-fact-image"), { alpha: 1, duration: 0.7, display: "flex", delay: 0.2 });
  }

  funFactImageHide() {
    this.tl.to($(".fun-fact-image"), { alpha: 0, duration: 0.7, display: "none" });
  }
} // Surface Class
