declare module 'gifshot' {
  export interface Options {
    images?: string[];
    video?: string[] | string;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    gifWidth?: number;
    gifHeight?: number;
    sampleInterval?: number;
    numWorkers?: number;
    filter?: string;
    text?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    fontColor?: string;
    textAlign?: string;
    textBaseline?: string;
    textXCoordinate?: number;
    textYCoordinate?: number;
    progressCallback?: (progress: number) => void;
    completeCallback?: (obj: { image: string; cameraStream: MediaStream | null; error: boolean; errorCode: string; errorMsg: string }) => void;
  }

  export function createGIF(
    options: Options,
    callback: (obj: { image: string; cameraStream: MediaStream | null; error: boolean; errorCode: string; errorMsg: string }) => void
  ): void;

  export function stopVideoStreaming(): void;
  export function isWebCamGIFSupported(): boolean;
  export function isExistingVideoGIFSupported(): boolean;
  export function isScreenshotGIFSupported(): boolean;
}
