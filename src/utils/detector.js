import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

export const runDetector = async () => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: "tfjs",
  };
  return faceLandmarksDetection.createDetector(model, detectorConfig);
};

export const detect = async (landmarks, input) => {
  const estimationConfig = { flipHorizontal: false };
  return landmarks.estimateFaces(input, estimationConfig);
};
