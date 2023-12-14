class MainApp extends Base {
  constructor() {
    super();
    this.port;
    this.textEncoder;
    this.writableStreamClosed;
    this.writer;
    this.historyIndex = -1;
    this.lineHistory = [];

    this.html;

    this.connect_to_serial = false;

    this.top_speed = 0;
    this.top_speed_meter;

    this.reader;
    this.readableStreamClosed;

    this.topSpeedSignalToggle = false;

    this.resetSpeedTimer = null;
    this.resetSpeedTimeout = 10;

    this.funFacts = [
      "Usain Bolt's top speed was 44km/h",
      "A cheetah can run up to 120km/h",
      "And a cheetah takes 3 seconds to reach 96km/h",
      "A Tesla Model 3 takes 3.3 seconds to reach 100km/h",
      "Family pets like a Labrador can run up to 56km/h",
      "Over long distances humans can outrun all other animals",
    ];

    this.isButtonActive = false;

    // For DEMO ONLY
    this.mph;
    this.kmh;
    this.clear_display_timeout = 3000;

    this.disableSerialForDev = this.ipcSendSync("get-single-config", "disable_serial_for_dev"); // default should be false

    /**
     * New Featured@26 Jun
     */
    this.maximum_speed_index = this.ipcSendSync("get-single-config", "maximum_speed_index");
    this.current_speed_index = 0;

    this.listening_duration = this.ipcSendSync("get-single-config", "listening_duration"); // 0 = off;
    this.listening_duration_timeout = null;

    this.stopSendingSpeed = true;

    this.error_page_timeout = this.ipcSendSync("get-single-config", "error_page_timeout");
    this.maximum_top_speed = this.ipcSendSync("get-single-config", "maximum_top_speed");

    this.recorded_top_speed;
    this.loading_delay = this.ipcSendSync("get-single-config", "loading_delay");

    this.bufferSize = 1024; //1kB
    this.buffer = new ArrayBuffer(this.bufferSize);

    this.readable_value = [];
  }

  init() {
    console.log("### Main app class init ###");

    this.mph = document.querySelector("#mph");
    this.kmh = document.querySelector("#kmh");
    this.top_speed_meter = document.querySelector("#top-speed-meter");

    /** Reset and initialise */
    this.resetTopSpeed();

    // Listen to the top speed signal
    this.listenToTopSpeed();

    console.log("### Is the kiosk connected to serial? ", this.connect_to_serial);

    // this.startSendingSignal();
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

    // this.topSpeedSignalToggle = false;
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
          console.log("Closing the readable steam and ignore error...");
        });
        await _this.port.close();
        _this.connect_to_serial = false;
        _this.stopSendingSpeed = false;
        _this.resetAllSpeed();
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
        // console.log("### PORT is closed, opening port... ###");
        // await _this.openPort();
        return false; // if the port is ready, return;
      }
      _this.port = await navigator.serial.requestPort();

      // var ports = await navigator.serial.getPorts();
      // console.log(ports);
      // _this.port = ports[0];

      await _this.openPort();
    } catch (error) {
      //   _this.dialogMessage("Serial Connection Failed: " + error);
      console.error("Serial Connection Failed: " + error);

      /**
       * Testing error page
       */
      // setTimeout(() => {
      //   window.nzrm.send("display-error-message", "### Error page testing");
      // }, 3000);

      return false;
    }
  }

  async listenToPort() {
    const _this = this;

    // const textDecoder = new TextDecoderStream();
    // _this.readableStreamClosed = _this.port.readable.pipeTo(textDecoder.writable);

    /* 
    try {
      _this.reader = textDecoder.readable.getReader({ mode: "byob" });
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("BYOB readers are not supported. Fallback to port.readable.getReader()");
        _this.reader = textDecoder.readable.getReader();
      }
    }
    */

    _this.textDecoder = new TextDecoderStream();
    _this.readableStreamClosed = _this.port.readable.pipeTo(_this.textDecoder.writable);
    // const reader = textDecoder.readable
    //   .pipeThrough(new TransformStream(new LineBreakTransformer()))
    //   .getReader();
    _this.reader = _this.textDecoder.readable.getReader();

    // Listen to data coming from the serial device.

    /**
     * Newly added @ Jun 26
     */
    const sendSpeedToDisplay = () => {
      /**
       * New featured@26 Jun
       * Check if the value has been read over certain times
       */
      // console.log("### Readable value ---- ");
      // console.log(readable_value);
      const final_value = _this.readable_value.join("");
      // console.log("### Final value: ", final_value);

      /** Check if the final value is larger than the settings */

      _this.displaySpeed(final_value);
      _this.readable_value = [];
    };

    while (true) {
      const { value, done } = await _this.reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        _this.reader.releaseLock();
        break;
      }

      // if (value !== "" && value !== " ") console.log("Value: ", value);

      if (_this.stopSendingSpeed === false || _this.stopSendingSpeed == "false") {
        if (parseInt(value) >= 0) {
          if (_this.readable_value.length >= 2) return;
          _this.readable_value = [..._this.readable_value, parseInt(value)];
          console.log("Value from the new sensor: ", _this.readable_value);
        }
        if (value == " ") {
          // The end of the data is a " "(blank), so we know we have got a full data now
          // we should update the display and reset the array
          sendSpeedToDisplay();
        }
      } else {
        _this.resetAllSpeed();
        // console.warn(`Stop Sending Speed & reset. Recorded top speed: ${_this.recorded_top_speed}`);
      }
    }

    /* 
    while (true) {
      const { value, done } = await _this.reader.read(new Uint8Array(_this.buffer));
      if (done) {
        // Allow the serial port to be closed later.
        console.log("[readLoop] DONE", done);
        _this.reader.releaseLock();
        break;
      }

      if (value.buffer) {
        _this.buffer = value.buffer;
        console.log("Buffer: ", _this.buffer);
      }

      // if (value && value !== " ") {
      //   console.log("Value: ", value);
      // }
      // value is a string.
      // appendToTerminal(value);

      // console.log(`### Value from sensor: ${parseInt(value)}`);
      console.log(`### Value from sensor: ${value}`);

      // console.log(
      //   `### Check is Stop Sending: ${_this.stopSendingSpeed} || Spd i: ${_this.current_speed_index}`
      // );

      // if (!_this.stopSendingSpeed) {
      //   if (parseInt(value) > 0) {
      //     readable_value = [...readable_value, parseInt(value)];
      //   }
      //   if (value == "y") {
      //      // The end of the data is a "y", so we know we have got a full data now
      //      //we should update the display and reset the array
      //     sendSpeedToDisplay();
      //   }
      // }

      if (!_this.stopSendingSpeed) {
        if (parseInt(value) > 0) {
          readable_value = [...readable_value, parseInt(value)];
          console.log("Value from the new sensor: ", readable_value);
        }
        if (value == " ") {
          // The end of the data is a " "(blank), so we know we have got a full data now
          // we should update the display and reset the array
          sendSpeedToDisplay();
          readable_value = [];
        }
      }
    } // while loop
    */
  }

  displaySpeed(value) {
    const _this = this;

    if (value == " " || !value) {
      return false;
    }

    if (parseInt(value) > 0) {
      const kmhVal = Math.floor(parseInt(value));

      if (kmhVal > _this.top_speed) {
        _this.top_speed = parseInt(kmhVal);

        //I should be checking the toggle and sending the data here
        console.log("### Is send top speed? ", _this.topSpeedSignalToggle);
        if (_this.topSpeedSignalToggle) {
          window.nzrm.send("top_speed", _this.top_speed);
          window.nzrm.send("recored-top-speed", _this.top_speed); // this is for TV.goHome() to check
          console.log("### Top Speed Sent! The top speed is " + _this.top_speed + " ###");
          _this.current_speed_index += 1;
          console.log(
            `### mainApp.current_speed_index increment here: ${_this.current_speed_index} vs LIMIT ${_this.maximum_speed_index} ###`
          );
          if (_this.current_speed_index >= _this.maximum_speed_index) {
            window.nzrm.send("stop-sending-speed", true);
            console.log(`### ${mainApp.current_speed_index} reaches limit, stop sending now!`);
          }

          /**
           * Check if the top speed is over maximum top speed
           * This checker was moved to "tv.gohome()"
           */
          /*
          // console.log(`?????????????? Doggy top speed?????? ${_this.top_speed}`);
          if (_this.top_speed >= _this.maximum_top_speed) {
            console.warn(`### Top speed ${_this.top_speed} is doggy, go to error page ###`);
            // window.nzrm.send("display-error-message", "### Error page testing");
            // return false;
          }
           */
        }
        console.log(`### TOP SPEED: ${_this.top_speed}`);
        console.log(`### RECORDED TOP SPEED: ${_this.recorded_top_speed}`);
      }
    }
  }

  ipcListener(eventName, callback) {
    // window.nzrm.on(eventName, (e, a) => {
    //   callback(e, a);
    // });
    window.nzrm.on(eventName, callback);
  }

  keyBinding() {
    const _this = this;

    if (_this.isButtonActive) return;
    $("html").on("keydown", (e) => _this.startSendingSignal(e, $("html")));
    // $("html").off("keydown");
    _this.isButtonActive = true;
    console.log("### Button activated ###");
  }

  async startSendingSignal(e, ele) {
    const _this = this;

    // $("html").on("keydown", (e) => {
    if (e.key == "s" || e.key == "S") {
      e.preventDefault();
      // _this.topSpeedSignalToggle = true;
      _this.startResetSpeedTimer();
      console.log("### Start sending the top speed signal ###");

      /**
       * Send the Start Game signal
       */
      window.nzrm.send("start-game", 1);

      if (_this.disableSerialForDev) {
        console.warn("### Serial port disable for dev ###");
      } else {
        /**
         * Request port requires a user gesture
         */
        console.warn("### Request port requires a user gesture ###");

        ele.off("keydown");
        _this.isButtonActive = false;
        console.log("### Button deactivated ###");

        console.log("IS Serial CONNECTED?? ", _this.connect_to_serial);
        if (!_this.connect_to_serial) {
          if (!(await _this.connectSerial())) console.warn("### Serial is not connected ###");
        }
      }

      // Clear current speed index on while gane starts
      console.log(
        "### Clear current speed index & reset stop-sending-speed while game starts  ###"
      );
      _this.current_speed_index = 0;
      // window.nzrm.send("stop-sending-speed", false);
      // _this.stopSendingSpeed = false;
    }
    // });
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

  lockHtml() {
    $("html").removeClass("interaction-on");
    $("html").addClass("interaction-off");
  }

  releaseHtml() {
    $("html").removeClass("interaction-off");
    $("html").addClass("interaction-on");
  }

  listenToTopSpeed() {
    const _this = this;

    _this.ipcListener("top-speed-toggle", (e, msg) => {
      if (msg) {
        let toggle;
        if (toggle == "false") _this.topSpeedSignalToggle = false;
        _this.topSpeedSignalToggle = msg;
      }
    });

    _this.ipcListener("top_speed", (e, msg) => {
      const el = $(".top-speed");
      // console.log(el);
      console.log("_this.topSpeedSignalToggle >>", _this.topSpeedSignalToggle);
      if (el && _this.topSpeedSignalToggle == true) {
        // console.log("Helloooooooooooooo  ", msg);
        el.html(msg);
      }
    });

    _this.ipcListener("stop-sending-speed", (e, msg) => {
      if (msg) {
        console.log("Stop sending speed? ", msg);
        if (msg == "false") _this.stopSendingSpeed = false;
        console.log("_this.stopSendingSpeed? ", _this.stopSendingSpeed);
      }
    });

    console.log("### Top speed listener ###");
  }

  ipcSendSync(eventName, argument) {
    return window.nzrm.sendSync(eventName, argument);
  }

  littleIconsAnimation(sprintPos, rugbyPos, kiwiPos) {
    let sprint, rugby, kiwi;
    let el = $(".main-container ");

    /**
     * Position object structure
     * pos = {
     *  start_x: int,
     *  start_y: int,
     *  end_x: int,
     *  duration: int in second
     * }
     */

    const container = $("<div>").addClass("little-icons-container");
    sprint = $("<img>").addClass("sprint-icon-s icon-s").attr("src", "./images/sprint icon.svg");
    rugby = $("<img>").addClass("rugby-icon-s icon-s").attr("src", "./images/rugby ball icon.svg");
    kiwi = $("<img>").addClass("kiwi-icon-s icon-s").attr("src", "./images/kiwi icon.svg");

    gsap.set(sprint, { x: sprintPos.start_x, y: sprintPos.start_y });
    gsap.set(rugby, { x: rugbyPos.start_x, y: rugbyPos.start_y });
    gsap.set(kiwi, { x: kiwiPos.start_x, y: kiwiPos.start_y });

    $(el).append(container.append(sprint, rugby, kiwi));

    let ease = "power4.easeOut";

    gsap.to(sprint, { x: sprintPos.end_x, duration: sprintPos.duration, ease: ease });
    gsap.to(rugby, { x: rugbyPos.end_x, duration: rugbyPos.duration, ease: ease });
    gsap.to(kiwi, { x: kiwiPos.end_x, duration: kiwiPos.duration, ease: ease });
  }

  goLoading() {
    barba.go("loading.html");
  }

  async openPort() {
    const _this = this;

    if (_this.port) {
      console.log(`### Port is connected:`);
      console.log(_this.port.getInfo());

      await _this.port.open({
        baudRate: 9600,
        flowControl: "none",
        bufferSize: _this.bufferSize,
      });

      console.log(`### Port is opened:`);

      let settings = {};

      if (localStorage.dtrOn == "true") settings.dataTerminalReady = true;
      if (localStorage.rtsOn == "true") settings.requestToSend = true;
      if (Object.keys(settings).length > 0) await _this.port.setSignals(settings);

      // _this.textEncoder = new TextEncoderStream();
      // _this.writableStreamClosed = _this.textEncoder.readable.pipeTo(_this.port.writable);
      // _this.writer = _this.textEncoder.writable.getWriter();
      await _this.listenToPort();
    } else {
      console.log("No serial port is detected!");
    }
  }

  resetAllSpeed() {
    const _this = this;
    _this.top_speed = 0;
    _this.recorded_top_speed = 0;
    _this.readable_value = [];
    // console.log("### Reset All Speed ###");
  }
}
