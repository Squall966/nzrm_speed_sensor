class Flag extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let flag = this.attributes.flag.value; // Define the attribute and get data
    let caption = this.attributes.caption.value;
    this.innerHTML = `
        <img src="./images/${flag}" />
        <div class="_caption">${caption}</div>
    `;
  }
}

customElements.define("flag-symbol", Flag);
