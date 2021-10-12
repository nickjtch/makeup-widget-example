# widget-example

This project highlights the usage of the designhubz **makeup** web SDK.

## Roadmap

Eventually, *Eyewear* & *Makeup* try-on widgets will be available through the same `designhubz-widget` web SDK.

During initial releases however *designhubz-widget for 'makeup/'* uses a separate deployment path:
``` json
"dependencies": {
  "designhubz-widget": "https://widget.designhubz.com/makeup/designhubz-widget-1.0.1.tgz"
}
```

Also missing is *recommendations* which will be mocked soon (with live results coming after deployment/training as planned)


## Changelog

### 1.0.1 (Initial release)
- Introduces makeup widget functionality
- Introduces `widget.loadProduct(id)` which replaces *`fetchProduct` + `loadVariation`*


## Setup

1. Clone project and open command prompt in root project folder
2. Install libraries by running the following command:

  ```bash
  npm install
  ```

3. Run the project:
  
  ```bash
  npm run start
  ```
  
## Main files Description

1. This project uses our web SDK package: `designhubz-widget`
2. *index.html* : shows an `HTMLDivElement` where the widget (iFrame) will be contained.
3. *src/index.ts* : In this example, we are fetching a specific product, creating and interacting with a widget.

Live demo: [https://dg0iszzfyf3bz.cloudfront.net/widget/makeup/1.0.1/index.html](https://dg0iszzfyf3bz.cloudfront.net/widget/makeup/1.0.1/index.html?v=211012_A)
