export interface TwinEntry {
  id: string;
  timestamp: number; // Date.now()
  weightKg: number;
  hba1cPercent: number; // e.g. 6.4
  fastingGlucoseMgDl: number; // e.g. 110
  sleepHours: number; // avg per night
  exerciseMinutesPerWeek: number;
  dietQuality: number; // 1-5 self rating, 5 = very healthy
}

export interface TwinScores {
  metabolic: number; // 0-100
  activity: number; // 0-100
  nutrition: number; // 0-100
  composite: number; // 0-100
}

export interface SimulationInput {
  weightDeltaKg: number;
  exerciseDeltaMinutes: number;
  dietDeltaPoints: number; // -4..+4 shift in dietQuality
  sleepDeltaHours?: number;
}

export interface SimulationChangeData {
  simulatedEntry: TwinEntry;
  simScores: TwinScores;
  deltas: {
    metabolic: number;
    activity: number;
    nutrition: number;
    composite: number;
  };
  sliderDeltas: {
    weightKg: number;
    exerciseMinutes: number;
    dietPoints: number;
    sleepHours: number;
  };
  isModified: boolean;
}

