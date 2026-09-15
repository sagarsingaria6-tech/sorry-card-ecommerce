import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './CardScanner.css';

const CardScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanResult) {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        const onScanSuccess = (decodedText) => {
          setScanResult(decodedText);
          html5QrcodeScanner.clear();
          window.location.href = decodedText;
        };

        html5QrcodeScanner.render(() => {}, () => {});
        scannerRef.current = html5QrcodeScanner;
      } catch (err) {
        setError('Failed to start camera');
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, [scanResult]);

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        <h1>Scan Partner's Card 📱</h1>
        <p>Point your camera at the QR code</p>
        <div id="qr-reader"></div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default CardScanner;
