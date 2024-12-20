import React, { useEffect } from 'react';
import javascriptBarcodeReader from 'javascript-barcode-reader';

export function Scanner({ image, onDetected }) {

async function handleImage() {
    try {
      const sourceElement = document.getElementById('scanner');

      const code = await javascriptBarcodeReader({
        image: sourceElement,
        barcode: 'code-128',
      });

      onDetected(code);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (image) {
      handleImage();
    }
    // eslint-disable-next-line
  }, [image]);

  return <img style={{ display: 'none' }} id="scanner" src={image} alt="Código" />;
}
