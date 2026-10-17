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
  setAutoRotate(on: boolean): void;
  resetView(): void;
  snapshot(): string;
  dispose(): void;
}

export function createViewer(container: HTMLElement, options?: { keepView?: boolean; labels?: { w?: boolean }; onInteract?: () => void; /** >1 frames the system closer */ zoom?: number }): Viewer;
export function webglAvailable(): boolean;
