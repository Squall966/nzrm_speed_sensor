class Tv {
  constructor() {}

  init() {
    console.log("### TV class init###");
  }

  goHome() {
    console.log("### TV go home signal, the home should be 'index_tv.html' ###");
    barba.go("index_tv.html");
  }
}
