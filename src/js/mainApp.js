class MainApp extends Base {
  constructor() {
    super();
    this.port;
    this.textEncoder;
    this.writableStreamClosed;
    this.writer;
    this.historyIndex = -1;
    this.lineHistory = [];

    this.connect_to_serial = false;

    this.top_speed = 0;
    this.top_speed_meter;

    this.reader;
    this.readableStreamClosed;

    this.topSpeedSignalToggle = false;

    this.resetSpeedTimer = null;
    this.resetSpeedTimeout = 10;

    // For DEMO ONLY
    this.mph;
    this.kmh;
    this.clear_display_timeout = 3000;

    this.disableSerialForDev = false;
  }
  init() {
    console.log("### Main app class init ###");

    this.mph = document.querySelector("#mph");
    this.kmh = document.querySelector("#kmh");
    this.top_speed_meter = document.querySelector("#top-speed-meter");

    /** Reset and initialise */
    this.resetTopSpeed();

    console.log("### Is the kiosk connected to serial? ", this.connect_to_serial);

    this.startSendingSignal();
  }

  resetTopSpeed() {
    // reset top speed
    this.top_speed = 0;

    /** 
     * ### Commmented for DEV
    if (!this.top_speed_meter) return false; 
    this.top_speed_meter.innerHTML = this.top_speed + " km/h";
    */

    window.nzrm.send("reset-top-speed", 1);
    console.log(`### TOP SPEED is reset: ${this.top_speed}`);

    this.topSpeedSignalToggle = false;
    console.warn("### Speed signal sending ended ###");

    if (this.resetSpeedTimer) {
      this.clearSpeedTimer();
    }
  }

  async dialogMessage(msg) {
    const result = await window.dialog.show(msg);
    if (result) window.location.reload();
  }

  async demoInit() {
    const _this = this;
  }

  async closeSerialPort() {
    /**
     * With error:
     * !!! Cannot close serial port!: TypeError: Failed to execute 'close' on 'SerialPort': Cannot abort a locked stream
     */
    const _this = this;
    try {
      if (_this.reader && _this.readableStreamClosed) {
        _this.reader.cancel();
        await _this.readableStreamClosed.catch(() => {
          // Ignore the error
        });
        await _this.reader.close();
        await _this.port.close();

        console.info("### Port is closed!! ###");
      }
    } catch (error) {
      console.log("!!! Cannot close serial port!: " + error);
      console.log("!!! Please go home and refresh the app!!! For DEV ONLY!!");
    }
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
       * A very good reference if we want to use Electron with Serial port web api
       * https://gist.github.com/jkleinsc/284893c7f01d3cb4559508ca06919481#file-main-js-L21
       *
       */
      if (_this.port) {
        console.log("### PORT exist, do not request again! Only listening... ###");
        return false; // if the port is ready, return;
      }
      _this.port = await navigator.serial.requestPort();

      // var ports = await navigator.serial.getPorts();
      // console.log(ports);
      // _this.port = ports[0];

      if (_this.port) {
        console.log(`### Port is connected:`);
        console.log(_this.port);

        await _this.port.open({
          baudRate: 9600,
          flowControl: "none",
        });

        console.log(`### Port is opened:`);

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
      console.error("Serial Connection Failed: " + error);
    }
  }

  async listenToPort() {
    const _this = this;

    const textDecoder = new TextDecoderStream();
    _this.readableStreamClosed = _this.port.readable.pipeTo(textDecoder.writable);
    _this.reader = textDecoder.readable.getReader();

    // const reader = _this.port.readable.getReader();

    // Listen to data coming from the serial device.
    let readable_value = [];
    while (true) {
      const { value, done } = await _this.reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        console.log("[readLoop] DONE", done);
        _this.reader.releaseLock();
        break;
      }
      // value is a string.
      // appendToTerminal(value);

      // console.log(`### Value from sensor: ${parseInt(value)}`);
      // console.log(`### Value from sensor: ${value}`);
      if (parseInt(value) > 0) {
        readable_value = [...readable_value, parseInt(value)];
      }
      if (value == "y") {
        /**
         * The end of the data is a "y", so we know we have got a full data now
         * we should update the display and reset the array
         */
        // console.log(readable_value);
        const final_value = readable_value.join("");
        _this.displaySpeed(final_value);
        readable_value = [];
      }
    }
  }

  displaySpeed(value) {
    const _this = this;

    if (value == " " || !value) {
      // console.log("### No value!");
      return false;
    }

    if (parseInt(value) > 0) {
      const kmhVal = Math.floor(parseInt(value) * 1.61);

      if (_this.mph && _this.kmh) {
        _this.mph.innerHTML = `${value} mph`;
        _this.kmh.innerHTML = `${kmhVal} km/h`;

        if (kmhVal > _this.top_speed) {
          _this.top_speed = kmhVal;

          if (_this.top_speed_meter) {
            _this.top_speed_meter.innerHTML = _this.top_speed + " km/h";
          }

          /**
           * I should be checking the toggle and sending the data here
           */
          console.log("### Is send top speed? ", _this.topSpeedSignalToggle);
          if (_this.topSpeedSignalToggle) {
            window.nzrm.send("top_speed", _this.top_speed);
            console.log("### Top Speed Sent! ###");
          }

          console.log(`### TOP SPEED: ${_this.top_speed}`);
        }

        setTimeout(() => {
          _this.mph.innerHTML = `0 mph`;
          _this.kmh.innerHTML = `0 km/h`;
        }, _this.clear_display_timeout);
      }
    }
  }

  ipcListener(eventName, callback) {
    // window.nzrm.on(eventName, (e, a) => {
    //   callback(e, a);
    // });
    window.nzrm.on(eventName, callback);
  }

  startSendingSignal() {
    const _this = this;

    $("html").on("keydown", (e) => {
      if (e.key == "s" || e.key == "S") {
        e.preventDefault();
        _this.topSpeedSignalToggle = true;
        _this.startResetSpeedTimer();
        console.log("### Start sending the top speed signal ###");

        /**
         * Send the Start Game signal
         */
        window.nzrm.send("start-game", 1);

        if (this.disableSerialForDev) {
          console.warn("### Serial port disable for dev ###");
        } else {
          /**
           * Request port requires a user gesture
           */
          if (!this.connect_to_serial) this.connectSerial();
        }
      }
    });
  }

  startResetSpeedTimer() {
    const _this = this;

    if (!_this.resetSpeedTimer) {
      _this.resetSpeedTimer = setTimeout(() => {
        _this.resetTopSpeed();
        console.log("### Reset speed timer opened. ###");
      }, _this.resetSpeedTimeout * 1000);
    }
  }

  clearSpeedTimer() {
    clearTimeout(this.resetSpeedTimer);
    this.resetSpeedTimer = null;
    console.log("### Reset speed timer closed. ###");
  }

  startTimerCircleAnimation() {
    var circle = new ProgressBar.Circle("#progress", {
      color: "#FCB03C",
      duration: 3000,
      // easing: "easeInOut",
    });

    circle.animate(1);
  }
}
