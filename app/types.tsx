export type Option = "Good" | "Bad" | "N/A" | "";
export type ChecklistRow = {
  id: string;
  label: string;
  note?: string; // e.g., "Critical -- MSHA"
  value: Option;
};

export const CHECKLIST_ROWS: ChecklistRow[] = [
  { id: "engine_oil", label: "Engine Oil Level:", value: "" },
  { id: "coolant_level", label: "Coolant Level:", value: "" },
  { id: "coolant_hoses", label: "Coolant Hoses:", value: "" },
  { id: "belts", label: "Belts: Condition/Adjustment:", value: "" },
  { id: "air_filter", label: "Air Filter Restriction:", value: "" },
  { id: "batteries", label: "Batteries and Cables:", value: "" },
  { id: "trans_oil", label: "Trans, Oil Level:", value: "" },
  { id: "hydraulic_oil", label: "Hydraulic Oil Level:", value: "" },
  { id: "hydraulic_leaks", label: "Hydraulic Leaks:", value: "" },
  { id: "leaks", label: "Leaks:", value: "" },
  { id: "tires_wheels", label: "Tires, Wheels, Chains:", value: "" },
  {
    id: "wheel_lugs",
    label: "Wheel Lugs:",
    note: "Critical -- MSHA",
    value: "",
  },
  { id: "track_rollers", label: "Track Rollers:", value: "" },
  { id: "track_adjustment", label: "Track Adjustment:", value: "" },
  { id: "track_chains", label: "Track Chains and Sprockets:", value: "" },
  { id: "bucket_blade", label: "Bucket/Blade:", value: "" },
  { id: "cutting_edges", label: "Cutting Edges/Teeth:", value: "" },
  { id: "grease", label: "Grease Complete:", value: "" },
  {
    id: "structural_cracks",
    label: "Structural Cracks:",
    note: "Medium -- MSHA",
    value: "",
  },
  {
    id: "missing_hardware",
    label: "Missing Loose Hardware:",
    note: "Medium -- MSHA",
    value: "",
  },

  // Operational Safety Checks
  { id: "operators_manual", label: "Operators Manual:", value: "" },
  { id: "seat_belt", label: "Seat Belt:", note: "Critical -- MSHA:", value: "" },
  {
    id: "fire_extinguisher",
    label: "Fire Extinguisher:",
    note: "Critical -- MSHA",
    value: "",
  },
  {
    id: "glass_mirrors",
    label: "Glass and Mirrors:",
    note: "Medium -- MSHA",
    value: "",
  },
  { id: "wipers", label: "Wipers and Washers", value: "" },
  {
    id: "backup_alarm",
    label: "Back Up Alarm:",
    note: "Critical -- MSHA",
    value: "",
  },
  { id: "horn", label: "Horn:", note: "Critical -- MSHA:", value: "" },
  {
    id: "backup_camera",
    label: "Back Up Camera Working:",
    note: "Medium -- MSHA",
    value: "",
  },
  {
    id: "service_brakes",
    label: "Service and Park Brakes:",
    note: "Critical -- MSHA",
    value: "",
  },
  { id: "steering", label: "Steering:", note: "Critical -- MSHA:", value: "" },
  {
    id: "aux_steering",
    label: "Auxiliary Steering/Brakes working:",
    note: "Critical -- MSHA",
    value: "",
  },
  { id: "guards", label: "Guards:", note: "Critical -- MSHA:", value: "" },
  { id: "controls", label: "All Controls Work Properly:", value: "" },
  { id: "gauges", label: "All Gauges Working Properly:", value: "" },
  {
    id: "lights",
    label: "Lights, Flashers, Beacons:",
    note: "Medium -- MSHA",
    value: "",
  },
  { id: "housekeeping", label: "Housekeeping:", value: "" },
  { id: "ladders", label: "Ladders, Steps, and Platforms:", value: "" },
  { id: "heater", label: "Heater, Defroster, AC:", value: "" },
];


export const OPTION_COLORS = {
    "Good": "bg-green-600 border-green-600",
    "Bad": "bg-red-600 border-red-600",
    "N/A": "bg-slate-800 border-slate-800",
    // "N/A NONE", "Critical", "Medium", "Low"
    "N/A NONE": "bg-slate-800 border-slate-800",
    "Critical": "bg-red-600 border-red-600",
    "Medium": "bg-yellow-500 border-yellow-500",
    "Low": "bg-green-600 border-green-600",
}