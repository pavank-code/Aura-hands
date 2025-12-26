
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

class HandDetectionService {
  private landmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private isInitializing = false;

  /**
   * Initializes the MediaPipe HandLandmarker.
   * Configured with GPU delegate and float16 model for high-performance real-time tracking.
   */
  async initialize(): Promise<boolean> {
    if (this.landmarker) {
      return true;
    }
    
    if (this.isInitializing) {
      return false;
    }
    
    this.isInitializing = true;

    try {
      // Load vision tasks with stable WASM binaries
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm"
      );
      
      // Explicitly utilizing GPU delegate for hardware acceleration
      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.4,
        minHandPresenceConfidence: 0.4,
        minTrackingConfidence: 0.4
      });
      
      console.debug("[HandDetection] Core initialized with GPU acceleration and optimized thresholds.");
      return true;
    } catch (error) {
      console.error("[HandDetection] Initialization error:", error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  setVideo(video: HTMLVideoElement) {
    this.video = video;
  }

  detect(timestamp: number) {
    if (!this.landmarker || !this.video || this.video.readyState < 2) return null;
    return this.landmarker.detectForVideo(this.video, timestamp);
  }

  calculateHandOpenness(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length === 0) return false;
    
    // Simple heuristic: compare finger tips distance from wrist
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20].map(i => landmarks[i]);
    
    const distances = tips.map(tip => {
      return Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + 
        Math.pow(tip.y - wrist.y, 2)
      );
    });
    
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    // Threshold adjusted for better responsiveness on most hand sizes
    return avgDist > 0.22;
  }
}

export const handDetectionService = new HandDetectionService();
