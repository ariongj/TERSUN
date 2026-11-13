/** Types for the plain-JS three.js viewer (viewer.js, shared with the classic static site). */
export type SystemType = 'bioclimatic' | 'glassroof' | 'awning' | 'guillotine' | 'slide' | 'zip';
export type ViewerMode = 'studio' | 'day' | 'night';
export type ViewerView = 'corner' | 'front' | 'side' | 'top' | 'inside';

export interface ViewerOptions {
  /** dimensions in cm */
  w: number;
  d?: number;
  h: number;
  /** frame colour (hex) */
  color?: string;
  /** fabric colour (hex) for awning / ZIP */
  fabric?: string;
  layout?: string;
  mount?: 'free' | 'wall';
  side?: 'none' | 'zip' | 'guillotine' | 'slide' | 'panel';
  tracks?: number;
  led?: boolean;
  position?: string;
  /** louvre angle in degrees (bioclimatic) */
  angle?: number;
  /** 0–1: opening of glass / screens */
  open?: number;
  /** 0–1: awning extension */
  extension?: number;
  /** 0–1: side closure opening */
  sideOpen?: number;
  /** label texts shown on the dimension lines */
  dims?: { w?: string | null; d?: string | null; h?: string | null };
}

export interface Viewer {
  update(type: SystemType, o: ViewerOptions): void;
  setMode(mode: ViewerMode): void;
  setNight(on: boolean): void;
  setView(view: ViewerView): void;
  setDims(on: boolean): void;
  setProps(on: boolean): void;
  /** Time of day for the Day scene, in hours (6–20): moves the sun and its shadows. */
  setTime(hours: number): void;
  /** Rain on/off (Day and Night scenes). It stays dry under a closed roof. */
  setRain(on: boolean): void;
  setFurniture(kind: 'lounge' | 'dining' | 'none'): void;
  setAutoRotate(on: boolean): void;
  resetView(): void;
  /** False until the first frame has been drawn (shaders compile in the background first). */
  isReady(): boolean;
  /** PNG data URL of the current picture at full resolution, with the dimension texts when they are shown. */
  snapshot(): string;
  dispose(): void;
}

export interface CreateViewerOptions {
  keepView?: boolean;
  labels?: { w?: boolean };
  /** the visitor took the camera (embedded: once a drag has ended, not on a swipe that scrolled the page) */
  onInteract?: () => void;
  /** called once, when the first frame is on the canvas */
  onReady?: () => void;
  /** >1 frames the system closer */
  zoom?: number;
  /**
   * Embedded in a scrolling page (the homepage band): no zoom or pan, so the wheel scrolls the page; on touch
   * screens a vertical swipe scrolls the page and a horizontal drag turns the model; no opening glide, the
   * first frame is the framing of the view.
   */
  embed?: boolean;
}

export function createViewer(container: HTMLElement, options?: CreateViewerOptions): Viewer;
export function webglAvailable(): boolean;
