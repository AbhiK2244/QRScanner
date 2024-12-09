import { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library"; // Import the ZXing library

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null); // State to store scanned data
  const [isScanning, setIsScanning] = useState(false); // State to manage scanner visibility
  const videoRef = useRef(null); // Reference for the video element

  // Initialize ZXing scanner when the component mounts
  useEffect(() => {
    if (isScanning) {
      const codeReader = new BrowserMultiFormatReader(); // Create a new ZXing scanner instance
      codeReader
        .listVideoInputDevices() // List video input devices (camera)
        .then((videoInputDevices) => {
          if (videoInputDevices.length > 0) {
            codeReader.decodeFromVideoDevice(
              videoInputDevices[0].deviceId, // Choose the first available camera
              videoRef.current, // Bind the video element
              (result, err) => {
                if (result) {
                  handleScan(result.getText()); // Handle successful scan
                }
                if (err) {
                  console.error("Error scanning QR code:", err); // Handle scanning errors
                }
              }
            );
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));

      // Cleanup when component unmounts or scanning is stopped
      return () => {
        codeReader.reset();
      };
    }
  }, [isScanning]);

  // Handle the scanned data
  const handleScan = (data) => {
    if (data) {
      // Parse the UPI URL (remove the upi://pay? prefix)
      const params = new URLSearchParams(data.replace("upi://pay?", ""));
      const payeeUPI = params.get("pa"); // Payee UPI ID
      const payeeName = params.get("pn"); // Payee Name
      const amount = params.get("am") || ""; // Payment Amount
      const currency = params.get("cu") || "INR"; // Currency (default INR)
      const note = params.get("tn") || "Payment via Money Tracker App"; // Payment Note

      // Update the state with the scanned data
      setScannedData({
        payeeUPI,
        payeeName,
        amount,
        currency,
        note,
      });

      setIsScanning(false); // Stop scanning after successful scan
    }
  };

  // Toggle scanning state
  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false); // Stop scanning
  };

  // Redirect to UPI app for payment
  const redirectToUPI = () => {
    if (scannedData) {
      const { payeeUPI, amount, note } = scannedData;
      const upiUrl = `upi://pay?pa=${payeeUPI}&pn=Merchant&mc=0000&tid=123456&tr=123456&tn=${note}&am=${amount}&cu=INR`;

      // Open UPI payment app
      window.location.href = upiUrl;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Scan UPI QR Code</h2>

      {/* Show Start Scanning Button if not currently scanning */}
      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Start Scanning QR Code
        </button>
      ) : (
        <div>
          {/* Video element for QR scanning */}
          <video ref={videoRef} style={{ width: "100%" }} />
          <button
            onClick={stopScanning}
            className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Stop Scanning
          </button>
        </div>
      )}

      {/* Display the scanned data */}
      {scannedData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Scanned Details:</h3>
          <p><strong>Payee Name:</strong> {scannedData.payeeName}</p>
          <p><strong>Payee UPI ID:</strong> {scannedData.payeeUPI}</p>
          <p><strong>Note:</strong> {scannedData.note}</p>
          <p><strong>Amount:</strong> ₹{scannedData.amount}</p>
          
          {/* Button to redirect to UPI payment app */}
          <button
            onClick={redirectToUPI}
            className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Pay via UPI
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
