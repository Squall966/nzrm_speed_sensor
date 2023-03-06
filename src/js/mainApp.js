class MainApp extends Base {
  constructor() {
    super();
    this.port;
    this.textEncoder;
    this.writableStreamClosed;
    this.writer;
    this.historyIndex = -1;
    this.lineHistory = [];
  }
  init() {
    console.log("### Main app class init ###");
    this.connectSerial();
  }

  async dialogMessage(msg) {
    const result = await window.dialog.show(msg);
    if (result) window.location.reload();
  }

  async demoInit() {
    const _this = this;
    const mph = document.querySelector("#mph");
    const kmh = document.querySelector("#kmh");
  }

  async connectSerial() {
    const _this = this;
    try {
      console.log("### Trying to connect to a serial port...");

      /**
       *
       * Firstly, use requestport to prompt user to select a port via requestPort(), once a port is selected
       * we can use get ports by using getPorts() automatically
       *
       */
      //   _this.port = await navigator.serial.requestPort();

      var ports = await navigator.serial.getPorts();
      _this.port = ports[0];
      //   console.log(ports);
      if (_this.port) {
        //     console.log(_this.port);
        await _this.port.open({ baudRate: 9600, flowControl: "none" });

        let settings = {};

        if (localStorage.dtrOn == "true") settings.dataTerminalReady = true;
        if (localStorage.rtsOn == "true") settings.requestToSend = true;
        if (Object.keys(settings).length > 0) await _this.port.setSignals(settings);

        _this.textEncoder = new TextEncoderStream();
        _this.writableStreamClosed = _this.textEncoder.readable.pipeTo(_this.port.writable);
        _this.writer = _this.textEncoder.writable.getWriter();
        await _this.listenToPort();
      } else {
        console.log("No serial port is detected!");
      }
    } catch (error) {
      //   _this.dialogMessage("Serial Connection Failed: " + error);
      console.log("Serial Connection Failed: " + error);
    }
  }

  async listenToPort() {
    const _this = this;
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = _this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    // Listen to data coming from the serial device.
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        console.log("[readLoop] DONE", done);
        reader.releaseLock();
        break;
      }
      // value is a string.
      // appendToTerminal(value);

      if (parseInt(value) > 0) {
        const kmhVal = Math.floor(parseInt(value) * 1.61);
        mph.innerHTML = `${value} mph`;
        kmh.innerHTML = `${kmhVal} km/h`;

        setTimeout(() => {
          mph.innerHTML = `0 mph`;
          kmh.innerHTML = `0 km/h`;
        }, 1000);
      }
    }
  }
}
