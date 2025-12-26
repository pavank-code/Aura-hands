
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

class HandDetectionService {
  private landmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private isInitializing = false;

  /**
   * Initializes the MediaPipe HandLandmarker.
   * Ensures VIDEO mode and detection of up to 2 hands.
   */
  async initialize(): Promise<boolean> {
    if (this.landmarker) {
      console.log("[HandDetection] Landmarker already initialized.");
      return true;
    }
    
    if (this.isInitializing) {
      console.log("[HandDetection] Initialization already in progress...");
      return false;
    }
    
    this.isInitializing = true;
    console.group("HandDetection Service Initialization");
    console.log("[HandDetection] Loading FilesetResolver...");

    try {
      // Using a stable CDN version for WASM files
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm"
      );
      
      console.log("[HandDetection] FilesetResolver loaded. Creating HandLandmarker...");

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO", // Optimized for continuous camera stream
        numHands: 2,          // Support for two-handed gestures
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      console.log("[HandDetection] HandLandmarker initialized successfully in VIDEO mode.");
      console.groupEnd();
      return true;
    } catch (error) {
      console.error("[HandDetection] Failed to initialize MediaPipe:", error);
      console.groupEnd();
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  setVideo(video: HTMLVideoElement) {
    this.video = video;
  }

  /**
   * Runs detection on the current video frame.
   */
  detect(timestamp: number) {
    if (!this.landmarker || !this.video || this.video.readyState < 2) return null;
    return this.landmarker.detectForVideo(this.video, timestamp);
  }

  /**
   * Heuristic to determine if a hand is 'open' based on normalized landmark distances.
   */
  calculateHandOpenness(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length === 0) return false;
    
    // Landmarks: 0: Wrist, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20].map(i => landmarks[i]);
    
    const distances = tips.map(tip => {
      return Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + 
        Math.pow(tip.y - wrist.y, 2)
      );
    });
    
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    // Higher threshold means more 'open' fingers required
    return avgDist > 0.22;
  }
}

export const handDetectionService = new HandDetectionService();
