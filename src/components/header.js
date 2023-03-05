class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
            <meta charset="UTF-8" />
            <meta name="author" content="Squall Lion" />
            <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <title>Master Card App A</title>
            <link rel="stylesheet" href="./css/styles.min.css" />
            <script src="./js/top_scripts.js"></script>
        `;
  }
}

customElements.define("main-header", Header);
