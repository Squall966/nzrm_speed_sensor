class App extends Base {
  constructor() {
    super();
    this.slider;
    this.slideInitValue = 70;
    this.dragLine;
    this.indexWhiteSlice;
    this.indexSlideIn;

    this.indexDragLineCircleSize;

    this.showTransitionTextCss = { opacity: 1 };

    this.grassIcA;
    this.grassIcB;

    this.spaceIcA;
    this.spaceIcB;

    this.farmIcA;
    this.farmIcB;

    this.globeIn;

    this.popupValueIc = 5;
    this.popupValueIs = 90;
    this.popupTextTl;
    this.popupTextFlag = false;

    this.resetTimerSet = false;

    this.imangeComparisonFadeOutDelay = 1.5;
    this.dividedImageDelay = 1;

    this.spanBackgroundTimout = null;

    this.spanSize = "8vw";
    this.dragLineHeight = 245; // in percentage
  }

  init() {
    const _this = this;
    _this.slider = $(".slider");
    // _this.slider = $("._home-slider");
    _this.dragLine = $(".drag-line");
    // _this.dragLine = $("._home-drag-line");
    _this.indexWhiteSlice = $("._index-white-slice");
    _this.indexSlideIn = $("._index-slide-in");

    /** Transition in */
    super.lockHtml("html");

    /**
     * Mask the whiteSlice
     */
    const dragLineCircle = _this.dragLine.find("span");
    const container = $(".home-page");
    const vbWidth = _this.indexWhiteSlice.width();
    const vbHeight = _this.indexWhiteSlice.height();
    // const circleR = dragLineCircle.width() / 3.55;
    _this.indexDragLineCircleSize = dragLineCircle.width() / 2;
    let whiteSliceMaskValue = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbWidth} ${vbHeight}" preserveAspectRatio="none"><circle cx="${0}%" cy="50%" r="${_this.indexDragLineCircleSize}" fill="black"/></svg>') 0/100% 100%, linear-gradient(#fff, #fff)`;

    _this.indexWhiteSlice.css("-webkit-mask", whiteSliceMaskValue);

    const tl = gsap.timeline();
    // tl.set(_this.dragLine, { alpha: 1, left: "120%" });
    tl.set(_this.indexSlideIn, { alpha: 1, left: "120%" });

    const aniGroup = $("._home-info-group");
    tl.to(aniGroup, {
      duration: 0.75,
      ease: "power1.inOut",
      opacity: 1,
      delay: 0.25,
      stagger: 0.3,
      // onComplete: () => {
      //   homeInfoCrossFade();
      // },
    });

    tl.to(
      // _this.dragLine,
      _this.indexSlideIn,
      {
        duration: 0.5,
        alpha: 1,
        left: _this.slideInitValue + "%",
        ease: Power3.easeOut,
        onComplete: () => {
          $(".slider").val(_this.slideInitValue);
          // _this.dragLine.css("left", _this.slideInitValue + "%");
          _this.indexSlideIn.css("left", _this.slideInitValue + "%");

          console.log("### Slide To Start");
          _this.slider.on("input", () => {
            _this.slideToStart();
            /**
             * change the span background
             */
            _this.spanBgChangedSimulator($(_this.dragLine).find("span"));
          });

          super.releaseHtml("html");
        },
      },
      "-=.5"
    );

    tl.to(
      $(".home-pulsing"),
      {
        duration: 0.75,
        ease: "power1.inOut",
        opacity: 1,
        onComplete: () => {
          $(".home-pulsing").addClass("pulsing");
        },
      },
      "-=.45"
    );

    // return false;

    /** reset timer */
    if (!_this.resetTimerSet) {
      $("html").on("input click", () => {
        base.idleCount = 0;
        if (!_this.resetTimerSet) _this.resetTimerSet = true;
        console.log("### Timer reset ###");
      });
    }

    /**
     * Touchdown test
     */
    _this.spanBgChangedSimulator(container, dragLineCircle);

    function homeInfoCrossFade() {
      let tl = gsap.timeline({ yoyo: true, duration: 1, repeat: -1, repeatDelay: 4, yoyo: true });
      tl.to($(".home-info-text-1"), { opacity: 0 });
      tl.to($(".home-info-text-2"), { opacity: 1 });
      console.log("### Home info cross fade started. ###");
    }

    if (!base.timerCircleTl) base.timerCircleAnimation();
    $("#timeout-popup-container").fadeOut();
    console.log("### Homepage init ###");
  }

  slideToStart() {
    const _this = this;
    const tl = gsap.timeline({
      duration: 0.5,
      ease: Power3.easeIn,
    });
    let val = $(".slider").val();
    // $("body").css("pointer-events", "none");

    if (val <= 60) {
      console.log("### Transition in");
      _this.slider.remove();
      _this.slider.off("input");
      $("._home-pulsing-inside-dragline").remove();

      tl.to(_this.dragLine, {
        x: -window.innerWidth / 1.3,
      });
      tl.to(
        $(".home-info-group-container"),
        {
          opacity: 0,
          onComplete: () => {
            barba.go("space.html");
            return false;
          },
        },
        "-=.75"
      );
    }

    _this.dragLine.css("left", `${val}%`);

    // function checkProgress(timeline) {
    //   let progress = timeline.progress() * 100;
    //   if (progress >= 80) {
    //   }
    // }
  }

  transitionIn(
    imgCprs,
    obj = {
      endsAt: 88,
      startsFrom: null,
      animationSpeed: 10,
      // revealText: false,
      revealText: `Swipe to <br /> reveal.`,
      removeSpan: false,
      removeDragLineSpan: false,
      removeText: false,
      ending: false,
      textRightOffset: 10, // text@right animating offset in percentage
      textLeftOffset: 10, // text@left animating offset in percentage
      onLeaveEle: null,
      goNextEle: null,
      textRightAlignment: "right",
      imageInNoSlide: false,
      hideDragLine: false,
      transitionTextToWhite: false,
      imageSliderBackToMin: false,
      imageSliderBackToMinReverse: false,
      popupIcClass: null, // pop up class for image comparison
      popupIsClass: null, // pop up class for image slider
      revealTextForIcClass: false,
      isImageSliderSection: false,
      showBLColorLogo: true,
      endingDontFade: false, // for dev
    }
  ) {
    console.log("### Transition in without barba ###");
    const _this = this;
    const initVal = obj.endsAt;
    const slider = $(imgCprs.configs.slider.el);
    const dragLine = $(imgCprs.configs.dragLine.el);
    const topImage = $(imgCprs.configs.topImageEl);
    const imageIn = $(".my-img img");
    // const imageIn = $(imgCprs.container).find(".my-img img");
    let dragLineA = $(imgCprs.container).find(".drag-line");

    console.log("### Hide the lower white logo");
    const lowerWhiteLogo = $("._lower-white-logo");
    if (lowerWhiteLogo) lowerWhiteLogo.remove();
    if (!obj.showBLColorLogo) {
      /** Hide the color logo */
      if ($("._lower-color-logo")) $("._lower-color-logo").fadeOut();
    }

    const tl = gsap.timeline({
      defaults: {
        ease: "power2.in",
      },
    });

    if (!obj.revealText || obj.revealText) {
      console.log("######### DEFINED TEXT");
      /** Define reveal text */
      // const text = `Slide to <br /> reveal.`;
      const text = obj.revealText;
      const textEl = document.createElement("div");
      textEl.classList.add("_reveal-text", "pulsing");
      textEl.innerHTML = text;
      $(textEl).css({
        position: "absolute",
        transform: `rotate(-${imgCprs.configs.dragLine.rotateValue}deg)`,
        left: "1110%",
        top: "53%",
      });

      dragLineA.append(textEl);

      if (obj.removeText) {
        // console.log($(imgCprs.container).find("._reveal-text"));
        // console.log(imgCprs.container);
        $(imgCprs.container).find("._reveal-text").fadeOut();
      }
    }

    if (obj.revealTextForIcClass) {
      console.log("### Define the Slide left and right text >>> ", obj.revealTextForIcClass);

      const text = obj.revealTextForIcClass;
      const textEl = document.createElement("div");
      const dragLine = $(`${obj.popupIcClass.container}`).find(".drag-line");
      textEl.classList.add("_reveal-text", "pulsing");
      textEl.innerHTML = text;
      $(textEl).css({
        position: "absolute",
        transform: `rotate(-${obj.popupIcClass.configs.dragLine.rotateValue}deg) translate(110%, 15%)`,
      });

      dragLine.append(textEl);
    }

    /**
     * Remove the original span
     */
    // if (obj.removeDragLineSpan) {
    //   $(imgCprs.container).find(".drag-line span").remove();
    //   // $(imgCprs.container).find(".drag-line").remove();
    // }

    if (obj.removeSpan) {
      /** Maximize the drag line */
      $(imgCprs.container).find(".drag-line span").remove();
      $(imgCprs.container).find(".drag-line").remove();
      // dragLineA.find("span").fadeOut(() => {
      //   dragLineA.find("span").remove();
      //   dragLineA.append("<span>");
      //   dragLineA.find("span").addClass("_stroke-span");
      // });
    }

    /** set up image in */
    if (obj.imageInNoSlide) {
      tl.set(imageIn, { x: 0, opacity: 0 });
    } else {
      tl.set(imageIn, {
        opacity: 0,
        // x: -50,
      });
    }

    /** Animating */
    obj.ending ? ending() : null; // ending animation
    let sliderValue = obj.startsFrom ? obj.startsFrom : imgCprs.configs.slider.initValue;
    let animation, animationIntiVal, animationSpeed;

    if (obj.isImageSliderSection) {
      console.log("### Image slider section! ###");
      animationIntiVal = -150;
      animationSpeed = 3;
    } else {
      animationIntiVal = initVal;
      animationSpeed = obj.animationSpeed;
    } // check if the section is imageSlider?

    animation = setInterval(() => {
      sliderValue -= 1;
      if (sliderValue <= animationIntiVal) {
        clearInterval(animation);
        return false;
      }
      slider.val(sliderValue);
      dragLine.css("left", sliderValue + "%");
      topImage.css(
        "clip-path",
        `polygon(0 0, 
        ${sliderValue + imgCprs.configs.rotateValue}% 0,
        ${sliderValue - imgCprs.configs.rotateValue}% 100%,  0 100%)`
      );

      /**
       *
       * Drag Line span masking
       *
       */
      imgCprs.spanMasking(sliderValue);
    }, animationSpeed);

    /**
     *
     * Small color logo in
     *
     */
    if (obj.showBLColorLogo) {
      smallLogoIn({
        url: "NZMP_BL_Corner.png",
        className: "_lower-color-logo",
        hideColorLogo: false,
      });
    }

    function ending() {
      console.log("### transition text animation here from ENDING()###");

      const transitionText = $(imgCprs.container).parent().find(".transition-text");
      const transitionTextRight = $(imgCprs.container).parent().find(".transition-text-right");
      const transitionTextLeft = $(imgCprs.container).parent().find(".transition-text-left");

      transitionText.addClass("_removeAtTheEnding");
      transitionTextRight.addClass("_removeAtTheEnding");
      transitionTextLeft.addClass("_removeAtTheEnding");
      $(imgCprs.container).addClass("_removeAtTheEnding");

      let offset = obj.textRightOffset ? obj.textRightOffset : 15;
      let textLeftOffset = obj.textLeftOffset ? obj.textLeftOffset : 15;

      // if (obj.transitionTextToWhite) {
      //   transitionText.css("color", "white");
      // }

      if (obj.isImageSliderSection) {
        console.info("### This is an image Slider section, transition style B");

        transitionTextRight.addClass("_imageSliderTransition");
        transitionTextLeft.addClass("_imageSliderTransition");

        tl.set(transitionTextRight, {
          right: `${offset}%`,
          color: "white",
          display: "block",
          textAlign: obj.textRightAlignment,
          opacity: 1,
        });

        tl.set(transitionTextLeft, {
          left: textLeftOffset + "%",
          color: "white",
          display: "block",
          textAlign: "left",
        });

        tl.set($("._imageSliderTransition"), {
          x: window.innerWidth,
        });

        tl.to(
          transitionText,
          {
            left: "-70%",
          },
          "-=.25"
        );

        tl.to(
          $("._imageSliderTransition"),
          {
            x: 0,
            ease: Power3.easeOut,
            duration: 0.5,
          },
          "-=.15"
        );
        // tl.to(
        //   imageIn,
        //   {
        //     opacity: 1,
        //     x: 0,
        //   },
        //   "-=.5"
        // );
      } else {
        console.info("### This is an image Comparison section, transition style A");

        transitionText.html("The difference is");

        tl.set(transitionTextRight, {
          right: 10,
          color: "white",
          display: "block",
          textAlign: obj.textRightAlignment,
        });

        tl.set(transitionTextLeft, {
          left: 0,
          color: "white",
          display: "block",
          textAlign: "left",
        });

        tl.to(
          transitionText,
          {
            x: -350,
          },
          "-=.25"
        );

        tl.to(transitionTextRight, {
          right: `${offset}%`,
          opacity: 1,
        });

        tl.to(transitionText, {
          left: "-15%",
          duration: 1,
          ease: Power3.easeIn,
          // opacity: 0,
          delay: _this.dividedImageDelay,
        });

        /**
         * Move $(".thier-space-white-cover") to left then make imageIn opacity 1
         *
         */
        console.info(`### Move $(".bottom-container-white-cover") to left then make imageIn opacity 1`);
        const whiteCover = topImage.find($(".bottom-container-white-cover"));
        if (whiteCover) {
          tl.set(imageIn, { opacity: 1 });
          tl.to(whiteCover, {
            left: "44.7%",
            duration: 1,
            ease: Power3.easeOut,
          });
        }

        // tl.to(
        //   imageIn,
        //   {
        //     opacity: 0,
        //     x: 0,
        //   },
        //   "-=.5"
        // );
      } // console.info("### This is an image Comparison section, transition style A");

      if (obj.hideDragLine) {
        tl.to(
          dragLineA,
          {
            opacity: 0,
            onComplete: () => $(imgCprs.container).find(".my-img").css("background-color", "rgba(255,255,255,0)"),
          },
          "-=.5"
        );
      }

      /**
       *
       *
       * Graph SECTION SPECIFIC
       *
       *
       */
      function theEndOfAnimation() {
        if (obj.onLeaveEle) {
          $(imgCprs.container).css("z-index", "100");
          // obj.onLeaveEle.show();
          obj.onLeaveEle.css("visibility", "visible");
          if (obj.imageSliderBackToMin) {
            console.log("### Image slider slides itself back to minimum! ###");

            console.log(`### If intro? ::: ${obj.imageSliderBackToMinReverse}`);

            obj.imageSliderBackToMin.imageSliderBackTo(obj.imageSliderBackToMin.container, ".slide-images", {
              value: "min",
              animationSpeed: 20,
              imageGoForward: obj.imageSliderBackToMinReverse,
            });
          }
        } // show the 2nd container in HTML

        /** Pop up text setup for image comparison part */
        if (obj.popupIcClass) _this.popupImageComp(obj.popupIcClass);

        if (obj.popupIsClass) _this.popupImageSlider(obj.popupIsClass);
      }
      let graph_init_bg = $("#graph-init-text-bg");
      if (graph_init_bg) {
        graph_init_bg.addClass("_removeAtTheEnding");
        tl.set(graph_init_bg, {
          x: window.innerWidth,
          opacity: 1,
          zIndex: 9998,
        });
      }

      tl.to(
        transitionTextLeft,
        {
          left: `${textLeftOffset}%`,
          opacity: 1,
          ease: Power3.easeOut,
          onComplete: () => {
            if (graph_init_bg) return false;
            theEndOfAnimation();
          },
        },
        "-=.7"
      );

      if (graph_init_bg) {
        tl.to(
          graph_init_bg,
          {
            duration: 0.75,
            left: "-100%",
            opacity: 1,
            ease: Power3.easeOut,
            onComplete: () => {
              theEndOfAnimation();
            },
          },
          "-=.2"
        );
      }

      if (obj.endingDontFade) return false;

      /**
       *
       * Drag line span masking for Container B
       *
       */
      if (obj.popupIcClass) {
        // let value = $(obj.popupIcClass.container).find(".drag-line");
        // console.log(value);
        obj.popupIcClass.spanMasking(51);
      }

      tl.to($("._removeAtTheEnding"), {
        delay: _this.imangeComparisonFadeOutDelay,
        duration: 0.75,
        opacity: 0,
        onComplete: () => {
          if (obj.goNextEle) {
            obj.goNextEle.css("z-index", "999");

            let goBackEle = $(".go-back");
            if (goBackEle) goBackEle.css("z-index", "999");
          }
          $.when($("._removeAtTheEnding").remove()).done(() => {
            smallLogoIn({
              url: "NZMP_BR_Corner.png",
              className: "_lower-white-logo",
              hideColorLogo: true,
            });

            if (!obj.isImageSliderSection) titleBugsIn($(".title-bug-left"), $(".title-bug-right"));
          });
        },
      });
    } // ending

    function smallLogoIn(
      image = {
        url: "NZMP_BR_Corner.png",
        className: "_lower-white-logo'",
        hideColorLogo: true,
      }
    ) {
      // $(".main-container").append("<img class='_lower-white-logo'>");
      if (image.hideColorLogo && $("._lower-color-logo")) $("._lower-color-logo").fadeOut();
      $(".main-container").append(`<img class='${image.className}'>`);
      const logo = $(`.${image.className}`);
      logo.attr("src", "./images/" + image.url);

      gsap.set(logo, { opacity: 0 });
      gsap.to(logo, { opacity: 1, duration: 0.5 });

      base.releaseHtml("html");

      console.log("### Small NZMP logo in ###");
    }

    function titleBugsIn(textLeft, textRight) {
      /**
       * Title "BUGS" added@2023 changes
       */
      let className = "_title-bug";

      textLeft.addClass(className);
      textLeft.css("left", "8%");

      textRight.addClass(className);
      textRight.css("right", "8%");

      const configs = {
        top: "unset",
        bottom: "14%",
        fontSize: "2rem",
        fontWeight: "bold",
      };
      gsap.set($(`.${className}`), configs);
      gsap.to($(`.${className}`), {
        duration: 0.75,
        ease: Power3.easeOut,
        opacity: 1,
      });

      console.log("### Title bugs in");
    }
  }

  grassViewInit() {
    const _this = this;

    /** Transition text to the middle */
    const transitionText = $(".grass-page .transition-text");
    transitionText.css(_this.showTransitionTextCss);

    _this.grassIcA = new ImageComparison(".container-a", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/home-page-arrow-green.svg",
        spanWidth: "30", // in percentage
      },
      slider: {
        el: ".slider-test",
        // initValue: 89,
        initValue: 112, // cover the whole page
      },
    });

    /** Check transition text display value */
    transitionText.css("display", "block");

    // _this.grassIcA.addEventListener("slide-back-to-80", (e) => {
    _this.grassIcA.addEventListener("sliding", (e) => {
      let val = 70;
      if (e.detail.bottomValue <= val) {
        $(".slider")[0].remove();
        _this.transitionIn(_this.grassIcA, {
          endsAt: 50,
          startsFrom: val,
          animationSpeed: 20,
          removeSpan: true,
          removeText: true,
          ending: true,
          onLeaveEle: $(_this.grassIcB.container),
          goNextEle: $(_this.grassIcB.container).find(".go-next"),
          popupIcClass: _this.grassIcB,
          showBLColorLogo: false,
          revealTextForIcClass: `Slide left <br/>and right.`,
          // endingDontFade: true,
        });
      }
    });

    // $(".container-b").hide();
    $(".container-b").css("visibility", "hidden");

    _this.grassIcB = new ImageComparison(".container-b", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/dual-arrow.svg",
        spanWidth: "65", // in percentage
        spanLeftOffset: "0",
        spanTopOffset: "0",
      },
      slider: {
        el: ".slider-test",
        initValue: 88,
      },
    });

    // _this.grassIcB.addEventListener("sliding", (e) => {
    //   let value = e.detail.bottomValue;
    //   console.log(`Bottom Val: ${value}`);
    // });

    /**
    _this.grassIcB.addEventListener("slide-to-20", (e) => {
      let value = e.detail.value;
      value == 5 ? window.dialog.show("Body text pops up.") : null;
    });
    // _this.grassIcB.addEventListener("slide-to-min", () => {
    //   window.dialog.show("Body text pops up.");
    // });
    */
    console.log("### Grass page init ###");
  } // end of grassViewInit

  globeViewInit() {
    const _this = this;

    // return false;

    /** Transition text to the middle */
    const transitionText = $(".globe-page .transition-text");
    transitionText.css(_this.showTransitionTextCss);

    _this.globeIn = new ImageComparison(".container-globe", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/home-page-arrow-green.svg",
        spanWidth: "30", // in percentage
      },
      slider: {
        el: ".slider-test",
        // initValue: 89,
        initValue: 112, // cover the whole page
      },
    });

    /** Check transition text display value */
    transitionText.css("display", "block");

    // $(".globe-page").hide();
    // $(".globe-sliding-container").hide();
    $(".globe-sliding-container").css("visibility", "hidden");
    console.log("### Globe view init. ###");
  } // end of globeView

  globeViewStarts() {
    const _this = this;
    console.log("### Globe Page Starts. ###");

    const imageSlider = new ImageSlider(".globe-sliding-container", {
      sliderEl: ".slider",
      imageContainer: ".slide-images",
      imagePath: "./images/graph",
      imageNamePrefix: "LowCarbonGraph_Slider_00",
      imageType: "jpeg",
      // imageNamePrefix: "Globe",
      // imageType: "jpeg",
      // subImageSeqPrefix: "Overlay",
      // subImageSeqType: "png",
      introSequenceImagePrefix: "LowCarbonGraph_Intro_00",
      introSequenceImageType: "jpeg",
    });

    const pulsingText = $(".tos-globe");
    imageSlider.addEventListener("sliding", (e) => {
      let val = e.detail.value;
      if (val >= 8) {
        pulsingText.fadeOut();
      } else {
        pulsingText.fadeIn();
      }
    });

    // dev
    // $(".transition-text").remove();
    // return false;
    _this.transitionIn(_this.globeIn);

    // return false;
    _this.globeIn.addEventListener("sliding", (e) => {
      let val = 70;
      const target = _this.globeIn;
      if (e.detail.bottomValue < val) {
        $(".slider")[0].remove();
        _this.transitionIn(target, {
          endsAt: 50,
          startsFrom: val,
          animationSpeed: 10,
          removeSpan: true,
          removeText: true,
          ending: true,
          imageInNoSlide: true,
          hideDragLine: true,
          textRightOffset: 8,
          textLeftOffset: 8,
          textRightAlignment: "center",
          onLeaveEle: $(".globe-sliding-container"),
          // goNextEle: $(target.container).find(".go-next"),
          transitionTextToWhite: true,
          imageSliderBackToMin: imageSlider, // give it the image sldier Instance so the JS function can execute
          imageSliderBackToMinReverse: true, // For the slider with infro sequence
          popupIsClass: imageSlider,
          isImageSliderSection: true,
          showBLColorLogo: false,
          endingDontFade: false, // for dev
        });
      }
    });

    const subImage = $(".sub-slide-images>img");
    subImage.hide();

    imageSlider.addEventListener("on-start", (e) => {
      subImage.fadeIn();
    });
  }

  butterViewInit() {
    const _this = this;

    // return false;

    /** Transition text to the middle */
    const transitionText = $(".butter-page .transition-text");
    transitionText.css(_this.showTransitionTextCss);

    if (_this.globeIn) _this.globeIn = null;
    _this.globeIn = new ImageComparison(".container-butter", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/home-page-arrow-green.svg",
        spanWidth: "30", // in percentage
      },
      slider: {
        el: ".slider-test",
        // initValue: 89,
        initValue: 112, // cover the whole page
      },
    });

    /** Check transition text display value */
    transitionText.css("display", "block");

    // $(".butter-sliding-container").hide();
    $(".butter-sliding-container").css("visibility", "hidden");
    console.log("### Butter view init. ###");
  } // end of globeView

  butterViewStarts() {
    const _this = this;
    console.log("### Butter Page Starts. ###");

    const imageSlider = new ImageSlider(".butter-sliding-container", {
      sliderEl: ".slider",
      imageContainer: ".slide-images",
      imagePath: "./images/butter-sequence",
      imageNamePrefix: "butter",
      imageType: "jpg",
    });

    // dev
    // $(".transition-text").remove();
    // return false;
    _this.transitionIn(_this.globeIn);

    // return false;
    // _this.globeIn.addEventListener("slide-back-to-80", (e) => {
    _this.globeIn.addEventListener("sliding", (e) => {
      let val = 70;
      const target = _this.globeIn;
      if (e.detail.bottomValue <= val) {
        $(".slider")[0].remove();
        _this.transitionIn(target, {
          endsAt: 50,
          startsFrom: val,
          animationSpeed: 10,
          removeSpan: true,
          removeText: true,
          ending: true,
          imageInNoSlide: true,
          hideDragLine: true,
          textRightOffset: 8,
          textLeftOffset: 8,
          textRightAlignment: "center",
          onLeaveEle: $(".butter-sliding-container"),
          // goNextEle: $(target.container).find(".go-next"),
          transitionTextToWhite: true,
          imageSliderBackToMin: imageSlider, // give it the image sldier Instance so the JS function can execute
          popupIsClass: imageSlider,
          isImageSliderSection: true,
          showBLColorLogo: false,
          endingDontFade: false, // for dev
        });
      }
    });
  }

  slideToViewImages() {
    const _this = this;

    const globeMaster = $(".globe-sliding-container");
    const slider = globeMaster.find(".slider");
    const imageContainer = globeMaster.find(".slide-images").find("img");

    // ./images/globe-sequence/Globe099.jpg
    slider.on("input", () => {
      _this.imageReplacementbySlider(imageContainer, { sliderValue: $(".slider").val() });
    });
  } /** slideToViewImages */

  imageReplacementbySlider(
    ele,
    obj = {
      sliderValue: null,
    }
  ) {
    let val = obj.sliderValue < 10 ? "0" + obj.sliderValue : obj.sliderValue;
    ele.attr("src", `./images/globe-sequence/Globe0${val}.jpg`);
  } /** imageReplacementbySlider */

  imageSliderBackTo(
    ele,
    imageContainer,
    configs = {
      value: 0,
    }
  ) {
    const _this = this;
    let currentValue = ele.val();
    let targetValue = configs.value === "min" ? ele.prop("min") : currentValue;

    console.log("HELLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");

    /**
     * Animating
     */
    super.lockHtml("html");
    // setTimeout(() => {
    let ani = setInterval(() => {
      currentValue -= 1;
      // console.log(currentValue);
      if (currentValue <= targetValue) {
        clearInterval(ani);
        super.releaseHtml("html");
      }
      if (imageContainer) {
        _this.imageReplacementbySlider(imageContainer, { sliderValue: currentValue });
        ele.val(currentValue);
      }
    }, 15);
    // }, imangeComparisonFadeOutDelay * 1000);
  } /** imageSliderBackTo */

  popupImageComp(cls = null) {
    if (!cls) return false;

    const _this = this;
    const target = $(cls.container).find(".popup-text");
    const slider = $(cls.container).find(".slider");

    // console.log($(cls.container));

    if (_this.popupTextTl) _this.popupTextTl.kill();
    _this.popupTextTl = gsap.timeline({ duration: 0.3, ease: "power2.inOut" });

    if (cls.container == ".container-b-farm") {
      _this.popupTextTl.set(target, { y: -target.height(), bottom: "unset", top: "-1%" });
    } else {
      _this.popupTextTl.set(target, { y: target.height() });
    }

    // console.log(_this.popupTextTl);
    // console.log("target", target);
    // console.log("height", target.height());

    cls.addEventListener("sliding", (e) => {
      if (_this.popupTextTl.isActive()) return false;

      const bottomValue = e.detail.bottomValue;

      pop(bottomValue);
    });

    slider[0].onchange = () => {
      pop(slider.val());
    };

    function pop(val) {
      if (val < _this.popupValueIc && !_this.popupTextFlag) {
        _this.popupTextFlag = true;
        console.log("### POP UP!!");

        _this.popupTextTl.to(target, { y: 0 });

        // console.log("popup val: ", val);
      }

      if (val > _this.popupValueIc + 10 && _this.popupTextFlag) {
        _this.popupTextFlag = false;
        console.log("### Pop aWay!");

        let popAwayValue = cls.container == ".container-b-farm" ? -target.height() : target.height();
        _this.popupTextTl.to(target, { y: popAwayValue });
        // console.log("popup val: ", val);
      }
    }

    console.log("### Pop Up text setup for Image comparison library ###");
  } /** popupImageComp */

  popupImageSlider(cls = null) {
    if (!cls) return false;

    const _this = this;
    const target = $(cls.container).find(".popup-text");
    const slider = $(cls.container).find(".slider");

    // console.log(target);
    // console.log(slider);

    if (_this.popupTextTl) _this.popupTextTl.kill();
    _this.popupTextTl = gsap.timeline({ duration: 0.3, ease: "power2.inOut" });

    // console.log(target.height());
    // console.log(_this.popupTextTl);

    _this.popupTextTl.set(target, { y: -target.height() });

    cls.addEventListener("sliding", (e) => {
      let val = e.detail.value;
      popup(val);
    });

    slider[0].onchange = () => {
      popup(slider.val());
    };

    function popup(val = null) {
      if (!val) return false;

      if (val >= _this.popupValueIs && !_this.popupTextFlag) {
        _this.popupTextFlag = true;
        console.log("### POP UP!!");
        _this.popupTextTl.to(target, { y: 0 });
        console.log("popup val: ", val);
      }

      if (val <= _this.popupValueIs - 1 && _this.popupTextFlag) {
        _this.popupTextFlag = false;
        console.log("### Pop aWay!");
        _this.popupTextTl.to(target, { y: -target.height() });
        console.log("popup val: ", val);
      }
    }
  } /** popupImageSlider */

  spaceViewInit() {
    const _this = this;

    /** Transition text to the middle */
    const transitionText = $(".space-page .transition-text");
    transitionText.css(_this.showTransitionTextCss);

    _this.spaceIcA = new ImageComparison(".container-a-space", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/home-page-arrow-green.svg",
        spanWidth: "30", // in percentage
      },
      slider: {
        el: ".slider-test",
        // initValue: 89,
        initValue: 112, // cover the whole page
      },
    });

    /** Check transition text display value */
    transitionText.css("display", "block");

    // _this.spaceIcA.addEventListener("slide-back-to-80", (e) => {
    _this.spaceIcA.addEventListener("sliding", (e) => {
      let val = 70;
      if (e.detail.bottomValue <= val) {
        $(".slider")[0].remove();
        _this.transitionIn(_this.spaceIcA, {
          endsAt: 50,
          startsFrom: val,
          animationSpeed: 20,
          removeSpan: true,
          removeText: true,
          ending: true,
          onLeaveEle: $(_this.spaceIcB.container),
          goNextEle: $(_this.spaceIcB.container).find(".go-next"),
          popupIcClass: _this.spaceIcB,
          textRightOffset: 12,
          removeDragLineSpan: true,
          showBLColorLogo: false,
          revealTextForIcClass: `Slide left <br/>and right.`,
        });
      }
    });

    // $(".container-b-space").hide();
    $(".container-b-space").css("visibility", "hidden");

    _this.spaceIcB = new ImageComparison(".container-b-space", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/dual-arrow.svg",
        spanWidth: "65", // in percentage
        spanLeftOffset: "0",
        spanTopOffset: "0",
      },
      slider: {
        el: ".slider-test",
        initValue: 88,
      },
    });

    console.log("### Space page init ###");
  } //

  farmViewInit() {
    const _this = this;

    /** Transition text to the middle */
    const transitionText = $(".farm-page .transition-text");
    transitionText.css(_this.showTransitionTextCss);

    _this.farmIcA = new ImageComparison(".container-a-farm", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/home-page-arrow-green.svg",
        spanWidth: "30", // in percentage
      },
      slider: {
        el: ".slider-test",
        // initValue: 89,
        initValue: 112, // cover the whole page
      },
    });

    /** Check transition text display value */
    transitionText.css("display", "block");

    // _this.farmIcA.addEventListener("slide-back-to-80", (e) => {
    _this.farmIcA.addEventListener("sliding", (e) => {
      let val = 70;
      if (e.detail.bottomValue <= val) {
        $(".slider")[0].remove();
        _this.transitionIn(_this.farmIcA, {
          endsAt: 50,
          startsFrom: val,
          animationSpeed: 20,
          removeSpan: true,
          removeText: true,
          ending: true,
          onLeaveEle: $(_this.farmIcB.container),
          goNextEle: $(_this.farmIcB.container).find(".go-next"),
          popupIcClass: _this.farmIcB,
          showBLColorLogo: false,
          revealTextForIcClass: `Slide left <br/>and right.`,
          // textRightOffset: 3,
        });
      }
    });

    // $(".container-b-farm").hide();
    $(".container-b-farm").css("visibility", "hidden");

    _this.farmIcB = new ImageComparison(".container-b-farm", {
      topImageEl: ".my-img",
      rotateValue: 12,
      offset: 20,
      dragLine: {
        el: ".drag-line-test",
        rotateValue: 19.8,
        spanSize: _this.spanSize,
        height: _this.dragLineHeight, // in percentage
        spanColor: "rgba(255,255,255,0)",
        spanImageUrl: "../src/images/dual-arrow.svg",
        spanWidth: "65", // in percentage
        spanLeftOffset: "0",
        spanTopOffset: "0",
      },
      slider: {
        el: ".slider-test",
        initValue: 88,
      },
    });

    console.log("### Farm page init ###");
  } //

  endingViewInit() {
    const _this = this;
    const slider = $(".ending-slider");
    const container = $(".ending-white-cover-container");
    const whiteCover = $(".ending-white-cover");
    // const whiteCover = $(".ending-mask-test");
    const maskingEle = $(".white-masking");
    const endingPulsingText = $(".ending-pulsing");
    const circle = container.find("span");
    const circleSize = circle.height();
    const sliderInitVal = 113;
    // const targetSliderVal = 75;
    const targetSliderVal = 75;
    let maskValue;

    let coverIn = null;
    let coverInCount = 113;

    /** Transition in */
    super.lockHtml("html");
    const aniGroup = $("._ending-info-group");
    gsap.to(aniGroup, {
      duration: 0.75,
      ease: "power1.inOut",
      opacity: 1,
      delay: 0.25,
      stagger: 0.3,
      onComplete: () => {
        $(".ending-pulsing").addClass("pulsing");
      },
    });

    // delay the slide in
    setTimeout(() => {
      $("#ending-white-cover-bandage").show();
      coverIn = setInterval(() => {
        coverInCount -= 1;
        maskingEle.css("right", 100 - coverInCount + "%");
        circle.css("left", coverInCount + "%");
        endingPulsingText.css("right", 90 - coverInCount + "%");

        /**
         * MASKING #####
         */
        maskValue = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${container.width()} ${container.height()}" preserveAspectRatio="none"><circle cx="${coverInCount}%" cy="50%" r="${circleSize / 1.85}" fill="black"/></svg>') 0/100% 100%, linear-gradient(#fff, #fff)`;
        whiteCover.css("-webkit-mask", maskValue);

        if (coverInCount <= targetSliderVal) {
          slider.val(coverInCount);

          $("#ending-white-cover-bandage").hide();
          super.releaseHtml("html");
          clearInterval(coverIn);
          coverIn = null;
        }
        // console.log(`### Cover count > ${coverInCount}`);
      }, 10);
    }, 2500);

    /**
    slider.val(sliderInitVal);
    maskingEle.css("right", 100 - sliderInitVal + "%");
    circle.css("left", sliderInitVal + "%");
    endingPulsingText.css("right", 90 - sliderInitVal + "%");
     */

    /**
     * MASKING REF #####
     */
    // let maskValue = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${container.width()} ${container.height()}" preserveAspectRatio="none"><circle cx="${sliderInitVal}%" cy="50%" r="${circleSize / 1.85}" fill="black"/></svg>') 0/100% 100%, linear-gradient(#fff, #fff)`;
    // whiteCover.css("-webkit-mask", maskValue);

    slider.on("input", () => slideToRestart());

    function slideToRestart() {
      // console.log(`### Ending slider value >>> ${slider.val()}`);
      maskingEle.css("right", 100 - slider.val() + "%");
      circle.css("left", slider.val() + "%");

      /**
       * background color change
       */
      // _this.spanBgChangedSimulator(circle);

      maskValue = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${container.width()} ${container.height()}" preserveAspectRatio="none"><circle cx="${slider.val()}%" cy="50%" r="${circleSize / 1.85}" fill="black"/></svg>') 0/100% 100%, linear-gradient(#fff, #fff)`;
      whiteCover.css("-webkit-mask", maskValue);

      endingPulsingText.css("right", 90 - slider.val() + "%");

      if (slider.val() <= 55) {
        // barba.go("index.html");
        window.location.href = "index.html";
      }
    }

    _this.spanBgChangedSimulator($(".ending-page"), circle);

    console.log("### Ending view has been init! ###");
  } // Ending view Init

  spanBgChangedSimulator(ele, circle) {
    // const _this = this;

    // const span = _this.dragLine.querySelector("span");
    // console.log(ele);

    $(ele).on("touchstart", () => {
      $(circle).css("background", "#62bd18");
    });
    $(ele).on("touchend", () => {
      $(circle).css("background", "none");
    });

    /**
    if (ele) {
      ele.css("background", "#62bd18");
      if (_this.spanBackgroundTimout) {
        clearTimeout(_this.spanBackgroundTimout);
        _this.spanBackgroundTimout = null;
      }
      if (!_this.spanBackgroundTimout) {
        setTimeout(() => {
          ele.css("background", "none");
          clearTimeout(_this.spanBackgroundTimout);
          _this.spanBackgroundTimout = null;
        }, 500);
      }
    }
     */
  }
}
