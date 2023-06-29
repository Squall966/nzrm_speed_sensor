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

        let sprintPos = {
          start_x: -100,
          start_y: 604,
          end_x: 66,
          duration: 0.5,
        };
        let rugbyPos = {
          start_x: -100,
          start_y: 674,
          end_x: 1255,
          duration: 0.75,
        };
        let kiwiPos = {
          start_x: -100,
          start_y: 131,
          end_x: 1215,
          duration: 0.7,
        };
        mainApp.littleIconsAnimation(sprintPos, rugbyPos, kiwiPos);
        $("#surface-video").trigger("play");
      },
    },
    {
      namespace: "surface-speed",
      beforeEnter(data) {
        console.log("### Surface SPEED Page should init here");
        surface.topSpeedPageInit();

        let sprintPos = {
          start_x: -100,
          start_y: 424,
          end_x: 86,
          duration: 0.5,
        };
        let rugbyPos = {
          start_x: -100,
          start_y: 674,
          end_x: 1255,
          duration: 0.75,
        };
        let kiwiPos = {
          start_x: -100,
          start_y: 440,
          end_x: 1205,
          duration: 0.7,
        };
        mainApp.littleIconsAnimation(sprintPos, rugbyPos, kiwiPos);
      },
    },
    {
      namespace: "tv-home",
      beforeEnter(data) {
        let sprintPos = {
          start_x: -100,
          start_y: 727,
          end_x: 230,
          duration: 0.5,
        };
        let rugbyPos = {
          start_x: -100,
          start_y: 738,
          end_x: 1636,
          duration: 0.75,
        };
        let kiwiPos = {
          start_x: -100,
          start_y: 140,
          end_x: 1572,
          duration: 0.7,
        };
        mainApp.littleIconsAnimation(sprintPos, rugbyPos, kiwiPos);
        $("#tv-video").trigger("play");
      },
    },
    {
      namespace: "tv-get-ready",
      beforeEnter(data) {
        console.log("### TV GET READY page should init here");
        tv.init();
        // tv.startTimerCircleAnimation();

        let sprintPos = {
          start_x: -100,
          start_y: 508,
          end_x: 221,
          duration: 0.5,
        };
        let rugbyPos = {
          start_x: -100,
          start_y: 954,
          end_x: 1674,
          duration: 0.75,
        };
        let kiwiPos = {
          start_x: -100,
          start_y: 540,
          end_x: 1436,
          duration: 0.7,
        };
        mainApp.littleIconsAnimation(sprintPos, rugbyPos, kiwiPos);
      },
    },
    {
      namespace: "tv-speed",
      beforeEnter(data) {
        console.log("### TV SPEED Page should init here");
        tv.randomFunFact();
        tv.displayTopSpeed();
        tv.speedPageTimeOut();

        let sprintPos = {
          start_x: -100,
          start_y: 139,
          end_x: 178,
          duration: 0.5,
        };
        let rugbyPos = {
          start_x: -100,
          start_y: 949,
          end_x: 147,
          duration: 0.75,
        };
        let kiwiPos = {
          start_x: -100,
          start_y: 531,
          end_x: 1575,
          duration: 0.7,
        };
        mainApp.littleIconsAnimation(sprintPos, rugbyPos, kiwiPos);

        if (mainApp.listening_duration && mainApp.listening_duration > 0) {
          if (mainApp.listening_duration_timeout) {
            clearTimeout(mainApp.listening_duration_timeout);
            mainApp.listening_duration_timeout = null;
          }

          console.log(
            `### Listening Duration activate for ${mainApp.listening_duration} seconds ###`
          );

          mainApp.listening_duration_timeout = setTimeout(() => {
            /**
             * Need to fire a socket signal
             */
            // mainApp.stopSendingSpeed = true;
            window.nzrm.send("stop-sending-speed", true);
            console.warn("### Stop sending speed ###");
            clearTimeout(mainApp.listening_duration_timeout);
            mainApp.listening_duration_timeout = null;
          }, mainApp.listening_duration * 1000);
        }
      },
    },
    {
      namespace: "error-message",
      beforeEnter(data) {
        setTimeout(() => {
          console.log("### Error Page timeout, go home ###");
          window.nzrm.send("go-home", "gohome");
        }, mainApp.error_page_timeout * 1000);
        console.log("### Error message page init ###");
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
