
let icons = {
  "bullseye": {
    "width": 496,
    "height": 512,
    "path": "M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"
  },
  "level-down-alt": {
    "width": 320,
    "height": 512,
    "path": "M313.553 392.331L209.587 504.334c-9.485 10.214-25.676 10.229-35.174 0L70.438 392.331C56.232 377.031 67.062 352 88.025 352H152V80H68.024a11.996 11.996 0 0 1-8.485-3.515l-56-56C-4.021 12.926 1.333 0 12.024 0H208c13.255 0 24 10.745 24 24v328h63.966c20.878 0 31.851 24.969 17.587 40.331z"
  },
  "tachometer-alt": {
    "width": 576,
    "height": 512,
    "path": "M288 32C128.94 32 0 160.94 0 320c0 52.8 14.25 102.26 39.06 144.8 5.61 9.62 16.3 15.2 27.44 15.2h443c11.14 0 21.83-5.58 27.44-15.2C561.75 422.26 576 372.8 576 320c0-159.06-128.94-288-288-288zm0 64c14.71 0 26.58 10.13 30.32 23.65-1.11 2.26-2.64 4.23-3.45 6.67l-9.22 27.67c-5.13 3.49-10.97 6.01-17.64 6.01-17.67 0-32-14.33-32-32S270.33 96 288 96zM96 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm48-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm246.77-72.41l-61.33 184C343.13 347.33 352 364.54 352 384c0 11.72-3.38 22.55-8.88 32H232.88c-5.5-9.45-8.88-20.28-8.88-32 0-33.94 26.5-61.43 59.9-63.59l61.34-184.01c4.17-12.56 17.73-19.45 30.36-15.17 12.57 4.19 19.35 17.79 15.17 30.36zm14.66 57.2l15.52-46.55c3.47-1.29 7.13-2.23 11.05-2.23 17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.38-.01-20.89-6.28-26.57-15.22zM480 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"
  },
  "weight": {
    "width": 512,
    "height": 512,
    "path": "M448 64h-25.98C438.44 92.28 448 125.01 448 160c0 105.87-86.13 192-192 192S64 265.87 64 160c0-34.99 9.56-67.72 25.98-96H64C28.71 64 0 92.71 0 128v320c0 35.29 28.71 64 64 64h384c35.29 0 64-28.71 64-64V128c0-35.29-28.71-64-64-64zM256 320c88.37 0 160-71.63 160-160S344.37 0 256 0 96 71.63 96 160s71.63 160 160 160zm-.3-151.94l33.58-78.36c3.5-8.17 12.94-11.92 21.03-8.41 8.12 3.48 11.88 12.89 8.41 21l-33.67 78.55C291.73 188 296 197.45 296 208c0 22.09-17.91 40-40 40s-40-17.91-40-40c0-21.98 17.76-39.77 39.7-39.94z"
  },
}

class FontAwesome {
  constructor(props) {
    this.icons = icons;
  }

  getPathFromName(name) {
    if (Object.keys(this.icons).indexOf(name) >= 0) {
      return this.icons[name].path
    }
    return ''
  }
  getSvgFromName(name) {
    if (Object.keys(this.icons).indexOf(name) >= 0) {
      let element = this.icons[name];
      let img = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\""
        + element.width.toString() + "px\" height=\""
        + element.height.toString() + "px\"><path fill=\""
        + '#000000' + "\" d=\""
        + element.path + "\"/></svg>"
      return { img, dims: { w: element.width} }
    }
    return
  }

  getSvgRatioFromName(name) {
    if (Object.keys(this.icons).indexOf(name) >= 0) {
      const base = this.icons[name].svg[this.icons[name].styles[0]];
      const r = 55;
      const w = Math.min(r * base.width / base.height, r);
      const h = Math.min(r * base.height / base.width, r);
      return {
        w: w.toString() + '%',
        h: h.toString() + '%',
      }
    }
    return {
      w: '80%',
      h: '80%',
    }
  }

  getSvgFromLabel(label) {
    //todo
  }

  getList() {
    let list = [];
    let keys = Object.keys(this.icons);
    keys.forEach((key) => {
      let item = {};
      let tmp = this.icons[key];
      item.label = tmp.label;
      item.styles = tmp.styles;
      item.search = tmp.search.terms
      item.key = key
      list.push(item)
    });
    return list;
  }
};

export default FontAwesome;