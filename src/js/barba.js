const startGameListener = (page_to_go = null) => {
  console.log("### Start game listener");
  mainApp.ipcListener("start-game", (e, msg) => {
    if (msg) {
      console.log("### Game starts ###");
      console.log("### Page to go? ", page_to_go);
      if (page_to_go) {
        barba.go(`${page_to_go}.html`);
      }
    }
  });
};

barba.init({
  transitions: [
    {
      name: "opacity-transition",
      // sync: true,
      async leave(data) {
        // console.log("### Next container: " + data.current.namespace);
        // console.log(data);
        base.lockHtml();
        return gsap.to(data.current.container, {
          opacity: 0,
        });
      },
      async enter(data) {
        // console.log("### Current container: " + data.next.namespace);
        return gsap.from(data.next.container, {
          opacity: 0,
          onComplete: () => {
            base.releaseHtml();
          },
        });
      },
    },
  ],
  views: [
    {
      namespace: "surface-home",
      beforeEnter(data) {
        mainApp.keyBinding();
      },
    },
    {
      namespace: "surface-speed",
      beforeEnter(data) {
        console.log("### Surface SPEED Page should init here");
        surface.topSpeedPageInit();
      },
    },
    {
      namespace: "tv-home",
      beforeEnter(data) {},
    },
    {
      namespace: "tv-get-ready",
      beforeEnter(data) {
        console.log("### TV GET READY page should init here");
        tv.init();
        // tv.startTimerCircleAnimation();
      },
    },
    {
      namespace: "tv-speed",
      beforeEnter(data) {
        console.log("### TV SPEED Page should init here");
        tv.randomFunFact();
        tv.displayTopSpeed();
        tv.speedPageTimeOut();
      },
    },
    {
      namespace: "demo",
      beforeEnter(data) {
        console.log("### Main app should init here");
        mainApp.init();
      },
    },
  ],
});

function delay(n) {
  n = n || 2000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

function fadeIn(ele) {
  gsap.from(ele, {
    opacity: 0,
    // duration: 0.1,
    delay: 0.5,
  });
}
