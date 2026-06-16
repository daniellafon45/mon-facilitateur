export type DashboardShaderProps = {
  animate?: "on" | "off";
  brightness?: number;
  cAzimuthAngle?: number;
  cDistance?: number;
  cPolarAngle?: number;
  cameraZoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  envPreset?: "city" | "dawn" | "lobby";
  grain?: "on" | "off";
  lightType?: "3d" | "env";
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  reflection?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  shader?: string;
  type?: "plane" | "waterPlane" | "sphere";
  uAmplitude?: number;
  uDensity?: number;
  uFrequency?: number;
  uSpeed?: number;
  uStrength?: number;
  uTime?: number;
  wireframe?: boolean;
};

export type DashboardThemeId =
  | "aigue-marine"
  | "soleil-bleu"
  | "violet-rose"
  | "orbite"
  | "flamme"
  | "brume"
  | "coucher";

export type DashboardAppearance = "light" | "dark";

export interface DashboardTheme {
  id: DashboardThemeId;
  label: string;
  appearance: DashboardAppearance;
  preview: [string, string, string];
  shader: DashboardShaderProps;
}

export const DASHBOARD_THEMES: DashboardTheme[] = [
  {
    id: "aigue-marine",
    label: "Aigue-marine",
    appearance: "light",
    preview: ["#94ffd1", "#6bf5ff", "#ffffff"],
    shader: {
      animate: "on",
      brightness: 1.2,
      cAzimuthAngle: 170,
      cDistance: 4.4,
      cPolarAngle: 70,
      cameraZoom: 1,
      color1: "#94ffd1",
      color2: "#6bf5ff",
      color3: "#ffffff",
      envPreset: "city",
      grain: "off",
      lightType: "3d",
      positionX: 0,
      positionY: 0.9,
      positionZ: -0.3,
      reflection: 0.1,
      rotationX: 45,
      rotationY: 0,
      rotationZ: 0,
      shader: "defaults",
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.2,
      uFrequency: 0,
      uSpeed: 0.2,
      uStrength: 3.4,
      uTime: 0,
      wireframe: false,
    },
  },
  {
    id: "soleil-bleu",
    label: "Soleil bleu",
    appearance: "light",
    preview: ["#ffffff", "#ffbb00", "#0700ff"],
    shader: {
      animate: "on",
      brightness: 1.1,
      cAzimuthAngle: 0,
      cDistance: 7.1,
      cPolarAngle: 140,
      cameraZoom: 17.3,
      color1: "#ffffff",
      color2: "#ffbb00",
      color3: "#0700ff",
      envPreset: "city",
      grain: "off",
      lightType: "3d",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      shader: "defaults",
      type: "sphere",
      uAmplitude: 1.4,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 1,
      uTime: 0,
      wireframe: false,
    },
  },
  {
    id: "violet-rose",
    label: "Violet rose",
    appearance: "dark",
    preview: ["#5606ff", "#fe8989", "#000000"],
    shader: {
      animate: "on",
      brightness: 1.1,
      cAzimuthAngle: 180,
      cDistance: 3.9,
      cPolarAngle: 115,
      cameraZoom: 1,
      color1: "#5606ff",
      color2: "#fe8989",
      color3: "#000000",
      envPreset: "city",
      grain: "off",
      lightType: "3d",
      positionX: -0.5,
      positionY: 0.1,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 235,
      shader: "defaults",
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 2.4,
      uTime: 0.2,
      wireframe: false,
    },
  },
  {
    id: "orbite",
    label: "Orbite",
    appearance: "dark",
    preview: ["#ff7a33", "#33a0ff", "#ffc53d"],
    shader: {
      animate: "on",
      brightness: 1.5,
      cAzimuthAngle: 60,
      cDistance: 7.1,
      cPolarAngle: 90,
      cameraZoom: 15.3,
      color1: "#ff7a33",
      color2: "#33a0ff",
      color3: "#ffc53d",
      envPreset: "dawn",
      grain: "off",
      lightType: "3d",
      positionX: 0,
      positionY: -0.15,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      shader: "defaults",
      type: "sphere",
      uAmplitude: 1.4,
      uDensity: 1.1,
      uFrequency: 5.5,
      uSpeed: 0.1,
      uStrength: 0.4,
      uTime: 0,
      wireframe: false,
    },
  },
  {
    id: "flamme",
    label: "Flamme",
    appearance: "dark",
    preview: ["#ff6a1a", "#c73c00", "#FD4912"],
    shader: {
      animate: "on",
      brightness: 1.2,
      cAzimuthAngle: 180,
      cDistance: 2.4,
      cPolarAngle: 95,
      cameraZoom: 1,
      color1: "#ff6a1a",
      color2: "#c73c00",
      color3: "#FD4912",
      envPreset: "city",
      grain: "off",
      lightType: "3d",
      positionX: 0,
      positionY: -2.1,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 225,
      shader: "defaults",
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1.8,
      uFrequency: 5.5,
      uSpeed: 0.2,
      uStrength: 3,
      uTime: 0.2,
      wireframe: false,
    },
  },
  {
    id: "brume",
    label: "Brume",
    appearance: "light",
    preview: ["#ebedff", "#f3f2f8", "#dbf8ff"],
    shader: {
      animate: "on",
      brightness: 1.2,
      cAzimuthAngle: 180,
      cDistance: 2.9,
      cPolarAngle: 120,
      cameraZoom: 1,
      color1: "#ebedff",
      color2: "#f3f2f8",
      color3: "#dbf8ff",
      envPreset: "city",
      grain: "off",
      lightType: "3d",
      positionX: 0,
      positionY: 1.8,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: -90,
      shader: "defaults",
      type: "waterPlane",
      uAmplitude: 0,
      uDensity: 1,
      uFrequency: 5.5,
      uSpeed: 0.3,
      uStrength: 3,
      uTime: 0.2,
      wireframe: false,
    },
  },
  {
    id: "coucher",
    label: "Coucher",
    appearance: "dark",
    preview: ["#ff5005", "#dbba95", "#d0bce1"],
    shader: {
      animate: "on",
      brightness: 1.2,
      cAzimuthAngle: 180,
      cDistance: 3.6,
      cPolarAngle: 90,
      cameraZoom: 1,
      color1: "#ff5005",
      color2: "#dbba95",
      color3: "#d0bce1",
      envPreset: "city",
      grain: "on",
      lightType: "3d",
      positionX: -1.4,
      positionY: 0,
      positionZ: 0,
      reflection: 0.1,
      rotationX: 0,
      rotationY: 10,
      rotationZ: 50,
      shader: "defaults",
      type: "plane",
      uAmplitude: 1,
      uDensity: 1.3,
      uFrequency: 5.5,
      uSpeed: 0.4,
      uStrength: 4,
      uTime: 0,
      wireframe: false,
    },
  },
];

export const DEFAULT_DASHBOARD_THEME_ID: DashboardThemeId = "brume";

export function getDashboardTheme(id: DashboardThemeId | null): DashboardTheme | null {
  if (!id) return null;
  return DASHBOARD_THEMES.find((t) => t.id === id) ?? null;
}
