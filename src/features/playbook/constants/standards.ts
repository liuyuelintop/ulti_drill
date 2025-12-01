export type LengthUnit = "yards" | "meters";

export interface FieldDimensions {
  length: number; // Total length including endzones
  width: number;
  endzoneLength: number;
  brickMark: number; // Distance from goal line
}

export interface FieldStandard {
  id: string;
  name: string;
  unit: LengthUnit;
  dimensions: FieldDimensions;
}

export const FIELD_STANDARDS: Record<string, FieldStandard> = {
  WFDF: {
    id: "WFDF",
    name: "WFDF (International)",
    unit: "meters",
    dimensions: {
      length: 100, // 100m total
      width: 37,   // 37m wide
      endzoneLength: 18, // 18m deep
      brickMark: 18, // 18m from goal line (commonly used, official rule varies by year/event but 18m is standard)
    },
  },
  USAU: {
    id: "USAU",
    name: "USA Ultimate",
    unit: "yards",
    dimensions: {
      length: 110, // 70 + 20 + 20 = 110 yards
      width: 40,
      endzoneLength: 20,
      brickMark: 20, // 20 yards from goal line
    },
  },
  AUDL: {
    id: "AUDL",
    name: "UFA (Pro)",
    unit: "yards",
    dimensions: {
      length: 120, // 80 + 20 + 20 = 120 yards
      width: 53.33, // 53 1/3 yards
      endzoneLength: 20,
      brickMark: 20,
    },
  },
};

export const DEFAULT_STANDARD = FIELD_STANDARDS.WFDF;
