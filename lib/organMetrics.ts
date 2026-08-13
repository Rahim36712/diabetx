import type { OrganId } from "@/components/ThreeDigitalTwinCanvas";
import type { TwinEntry, TwinScores } from "@/lib/types";

export type PhysiologyLayer = "anatomy" | "blood_flow" | "metabolic_load" | "signaling";
export type OrganKey = Exclude<OrganId, "all" | "metabolic">;

export interface DetailMetric {
  label: string;
  value: string;
  unit?: string;
  quality: number;
  direction: "higher" | "lower";
  note: string;
}

export interface OrganMetricBundle {
  id: OrganKey;
  label: string;
  shortLabel: string;
  description: string;
  modelScore: number;
  status: "steady" | "watch" | "strained";
  metrics: DetailMetric[];
}

export interface SystemMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  quality: number;
  note: string;
}

export const ORGAN_ORDER: OrganKey[] = ["pancreas", "liver", "heart", "kidneys", "vascular"];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function status(score: number): OrganMetricBundle["status"] {
  if (score >= 76) return "steady";
  if (score >= 58) return "watch";
  return "strained";
}

function glycemicPressure(entry: TwinEntry) {
  return clamp(((entry.fastingGlucoseMgDl - 78) / 92) * 56 + ((entry.hba1cPercent - 5) / 4.5) * 44);
}

function sleepRecovery(entry: TwinEntry) {
  return clamp(100 - Math.abs(entry.sleepHours - 8) * 19);
}

function activityReserve(entry: TwinEntry) {
  return clamp((entry.exerciseMinutesPerWeek / 150) * 100);
}

export function getOrganMetrics(entry: TwinEntry, scores: TwinScores): OrganMetricBundle[] {
  const glycemic = glycemicPressure(entry);
  const recovery = sleepRecovery(entry);
  const activity = activityReserve(entry);
  const diet = clamp(entry.dietQuality * 20);
  const insulinReserve = clamp(scores.metabolic * 0.62 + recovery * 0.18 + activity * 0.12 + diet * 0.08);
  const liverBuffering = clamp(scores.metabolic * 0.48 + scores.nutrition * 0.32 + activity * 0.2);
  const cardiacReadiness = clamp(scores.activity * 0.6 + scores.metabolic * 0.18 + recovery * 0.22);
  const kidneyContext = clamp(scores.metabolic * 0.46 + scores.nutrition * 0.26 + recovery * 0.18 + activity * 0.1);
  const vascularResilience = clamp(scores.metabolic * 0.56 + scores.activity * 0.28 + diet * 0.16 - glycemic * 0.08);

  return [
    {
      id: "pancreas",
      label: "Pancreas",
      shortLabel: "Insulin signaling",
      description: "Modelled beta-cell workload and insulin-response context derived from logged glucose, HbA1c, sleep, activity, and diet inputs.",
      modelScore: round(insulinReserve),
      status: status(insulinReserve),
      metrics: [
        { label: "Insulin-response index", value: String(round(insulinReserve)), unit: "/100", quality: insulinReserve, direction: "higher", note: "Educational composite" },
        { label: "Beta-cell demand", value: String(round(glycemic)), unit: "/100", quality: 100 - glycemic, direction: "lower", note: "Higher reflects more glucose demand" },
        { label: "Recovery support", value: String(round(recovery)), unit: "/100", quality: recovery, direction: "higher", note: "Sleep-aligned signal" },
      ],
    },
    {
      id: "liver",
      label: "Liver",
      shortLabel: "Glucose buffering",
      description: "Modelled glucose-storage and fuel-flexibility context based on metabolic score, nutrition quality, and movement inputs.",
      modelScore: round(liverBuffering),
      status: status(liverBuffering),
      metrics: [
        { label: "Glucose-buffering index", value: String(round(liverBuffering)), unit: "/100", quality: liverBuffering, direction: "higher", note: "Educational composite" },
        { label: "Fuel flexibility", value: String(round(clamp(activity * 0.58 + diet * 0.42))), unit: "/100", quality: clamp(activity * 0.58 + diet * 0.42), direction: "higher", note: "Movement + nutrition signal" },
        { label: "Release-load context", value: String(round(glycemic)), unit: "/100", quality: 100 - glycemic, direction: "lower", note: "Higher reflects glycemic pressure" },
      ],
    },
    {
      id: "heart",
      label: "Heart",
      shortLabel: "Cardiovascular readiness",
      description: "Modelled activity, recovery, and metabolic context. This view does not measure heart rate or diagnose cardiovascular conditions.",
      modelScore: round(cardiacReadiness),
      status: status(cardiacReadiness),
      metrics: [
        { label: "Readiness index", value: String(round(cardiacReadiness)), unit: "/100", quality: cardiacReadiness, direction: "higher", note: "Educational composite" },
        { label: "Recovery rhythm", value: String(round(recovery)), unit: "/100", quality: recovery, direction: "higher", note: "Sleep-aligned signal" },
        { label: "Movement reserve", value: String(round(activity)), unit: "/100", quality: activity, direction: "higher", note: "Weekly activity signal" },
      ],
    },
    {
      id: "kidneys",
      label: "Kidneys",
      shortLabel: "Filtration context",
      description: "Modelled metabolic and glycemic context only. It does not estimate filtration rate, kidney function, or hydration status.",
      modelScore: round(kidneyContext),
      status: status(kidneyContext),
      metrics: [
        { label: "Metabolic context", value: String(round(kidneyContext)), unit: "/100", quality: kidneyContext, direction: "higher", note: "Educational composite" },
        { label: "Glucose exposure", value: String(round(glycemic)), unit: "/100", quality: 100 - glycemic, direction: "lower", note: "Derived glycemic pressure" },
        { label: "Recovery support", value: String(round(recovery)), unit: "/100", quality: recovery, direction: "higher", note: "Sleep-aligned signal" },
      ],
    },
    {
      id: "vascular",
      label: "Vascular network",
      shortLabel: "Microvascular context",
      description: "Modelled circulation and glycemic-exposure context derived from metabolic, activity, nutrition, and glucose inputs.",
      modelScore: round(vascularResilience),
      status: status(vascularResilience),
      metrics: [
        { label: "Flow resilience", value: String(round(vascularResilience)), unit: "/100", quality: vascularResilience, direction: "higher", note: "Educational composite" },
        { label: "Glycemic exposure", value: String(round(glycemic)), unit: "/100", quality: 100 - glycemic, direction: "lower", note: "Derived pressure signal" },
        { label: "Activity support", value: String(round(activity)), unit: "/100", quality: activity, direction: "higher", note: "Weekly activity signal" },
      ],
    },
  ];
}

export function getSystemMetrics(entry: TwinEntry, scores: TwinScores): SystemMetric[] {
  const glycemic = glycemicPressure(entry);
  const recovery = sleepRecovery(entry);
  const activity = activityReserve(entry);
  const insulinResponse = clamp(scores.metabolic * 0.7 + recovery * 0.15 + activity * 0.15);
  const resilience = clamp((scores.metabolic + scores.activity + scores.nutrition) / 3);
  return [
    { id: "glycemia", label: "Glycemic pressure", value: String(round(glycemic)), unit: "/100", quality: 100 - glycemic, note: "Lower modelled load is preferred" },
    { id: "insulin", label: "Insulin response", value: String(round(insulinResponse)), unit: "/100", quality: insulinResponse, note: "Modelled response reserve" },
    { id: "recovery", label: "Recovery signal", value: String(round(recovery)), unit: "/100", quality: recovery, note: "Sleep alignment with 8 hours" },
    { id: "movement", label: "Movement reserve", value: String(round(activity)), unit: "/100", quality: activity, note: "Weekly activity relative to 150 minutes" },
    { id: "resilience", label: "System resilience", value: String(round(resilience)), unit: "/100", quality: resilience, note: "Composite model context" },
  ];
}

export function organMetricFor(metrics: OrganMetricBundle[], id: OrganId) {
  return metrics.find((metric) => metric.id === id) ?? metrics[0];
}
