import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

import styles from '../Styles/FaceAuthWizard.module.css';

const MODEL_URL = process.env.PUBLIC_URL + '/models';

const FaceAuthWizard = ({ onSuccess, onFail }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [retry, setRetry] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const detectionIntervalRef = useRef(null);

  const loadModels = async () => {
    setStatus('🔄 Loading face recognition models...');
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
        faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`),
        faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
      ]);
      setStatus('✅ Models loaded');
    } catch (err) {
      setStatus('❌ Failed to load models: ' + err.message);
      onFail();
    }
  };

  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setStatus('❌ Failed to access webcam');
      onFail();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Load and process reference image descriptor and keep img for display
  const loadReferenceImage = async () => {
    try {
      const img = await faceapi.fetchImage('/assets/reference.jpg');
      setReferenceImage(img.src || '/assets/reference.jpg'); // For display

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setReferenceDescriptor(detection.descriptor);
        setStatus('📷 Reference face loaded. Position your face in front of camera.');

        // Start continuous detection after a short delay
        setTimeout(startDetectionLoop, 1000);
      } else {
        setStatus('❌ No face detected in reference image');
        onFail();
        stopCamera();
      }
    } catch (err) {
      setStatus('❌ Failed to load reference image');
      onFail();
      stopCamera();
    }
  };

  // Detection loop that runs every 500ms to detect and compare face
  const startDetectionLoop = () => {
    detectionIntervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !video ||
        video.readyState !== 4 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0 ||
        !canvas
      ) {
        setStatus('❌ Video not ready for detection');
        return;
      }

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
      const detection = await faceapi
        .detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        const resizedDetection = faceapi.resizeResults(detection, {
          width: canvas.width,
          height: canvas.height,
        });

        faceapi.draw.drawDetections(canvas, resizedDetection);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

        // Compare descriptor
        if (referenceDescriptor) {
          const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
          if (distance < 0.6) {
            setStatus('✅ Face authenticated');
            stopCamera();
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
            onSuccess();
          } else {
            setStatus('❌ Face not recognized');
            // Do NOT stop camera immediately, allow retry or continuous detection
          }
        }
      } else {
        setStatus('❌ Face not detected');
        // Keep camera running to allow user to try again
      }
    }, 500);
  };

  useEffect(() => {
    const init = async () => {
      setStatus('🔁 Initializing...');
      await loadModels();
      await getVideo();

      if (videoRef.current) {
        videoRef.current.onplaying = () => {
          loadReferenceImage();
        };
      }
    };

    init();

    // Cleanup on unmount or retry
    return () => {
      stopCamera();
    };
  }, [retry]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Face Authentication</h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="320"
            height="240"
            className={styles.video}
            style={{ border: '1px solid #ccc' }}
          />
          <canvas ref={canvasRef} className={styles.canvas} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>

        <div>
          <p>Reference Image:</p>
          {referenceImage ? (
            <img
              src={referenceImage}
              alt="Reference Face"
              width={160}
              height={120}
              style={{ border: '1px solid #ccc', borderRadius: '4px' }}
            />
          ) : (
            <p>Loading reference image...</p>
          )}
        </div>
      </div>

      <p className={styles.status}>{status}</p>
      <button className={styles.retryButton} onClick={() => setRetry(!retry)}>
        🔄 Retry Face Scan
      </button>
    </div>
  );
};

export default FaceAuthWizard;

