import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
export const runDetector = async (input) => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "tfjs",
  };
  const detector = await faceLandmarksDetection.createDetector(
    model,
    detectorConfig
  );
  const estimationConfig = { flipHorizontal: false };
  return detector.estimateFaces(input, estimationConfig);
};
