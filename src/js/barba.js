/*! NZ Grass-fed Difference by Squall Lion@2022 |  This Class uses JQuery */
barba.init({
  transitions: [
    {
      name: "opacity-transition",
      // sync: true,
      async leave(data) {
        console.log("### Next container: " + data.current.namespace);
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
      namespace: "home",
      beforeEnter(data) {
        console.log("### Home Page should init here");
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
