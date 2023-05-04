class Surface {
  constructor() {}

  init() {
    console.log("### Surface Class init ###");
  }

  goHome() {
    console.log("### Surface go home signal, the home should be 'index_surface.html' ###");
    barba.go("index_surface.html");
  }
}
