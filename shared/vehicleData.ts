export interface VehiclePart {
  id: string;
  name: string;
  category: string;
}

export interface VehicleModel {
  name: string;
  parts: VehiclePart[];
}

export interface VehicleBrand {
  name: string;
  models: VehicleModel[];
}

// Common vehicle parts that apply to most vehicles
export const COMMON_VEHICLE_PARTS: VehiclePart[] = [
  // Exterior
  { id: "front-bumper", name: "Front Bumper Guard", category: "Exterior" },
  { id: "rear-bumper", name: "Rear Bumper Guard", category: "Exterior" },
  { id: "side-step", name: "Side Step", category: "Exterior" },
  { id: "side-cladding", name: "Side Cladding", category: "Exterior" },
  { id: "roof-rail", name: "Roof Rail", category: "Exterior" },
  { id: "spoiler", name: "Spoiler", category: "Exterior" },
  { id: "antenna", name: "Antenna", category: "Exterior" },
  { id: "mac-wheel", name: "Mac Wheel / Alloy Wheel", category: "Exterior" },
  
  // Lights
  { id: "head-light", name: "Head Light", category: "Lights" },
  { id: "fog-light", name: "Fog Light", category: "Lights" },
  { id: "drl-light", name: "DRL Light", category: "Lights" },
  { id: "tail-light", name: "Tail Light Show", category: "Lights" },
  { id: "pillar-light", name: "Pillar Light", category: "Lights" },
  { id: "rear-reflector", name: "Rear Reflector", category: "Lights" },
  
  // Body Parts
  { id: "front-grill", name: "Front Grill", category: "Body Parts" },
  { id: "lower-garnish", name: "Lower Garnish ABS & SS", category: "Body Parts" },
  { id: "finger-guard", name: "Finger Guard (Put & Chrome)", category: "Body Parts" },
  { id: "handle-cover", name: "Handle Cover", category: "Body Parts" },
  { id: "mirror-cover", name: "Mirror Cover", category: "Body Parts" },
  { id: "front-abs-guard", name: "Front ABS Guard", category: "Body Parts" },
  
  // Interior
  { id: "floor-mat", name: "Floor Mat (7D/9D)", category: "Interior" },
  { id: "seat-cover", name: "Seat Cover", category: "Interior" },
  { id: "dashboard-cover", name: "Dashboard Cover", category: "Interior" },
  { id: "steering-cover", name: "Steering Cover", category: "Interior" },
  
  // Maintenance
  { id: "front-wiper", name: "Front Wiper", category: "Maintenance" },
  { id: "rear-wiper", name: "Rear Wiper", category: "Maintenance" },
  { id: "air-filter", name: "Air Filter", category: "Maintenance" },
  { id: "oil-filter", name: "Oil Filter", category: "Maintenance" },
];

// Vehicle brands with their models and specific parts
export const VEHICLE_DATA: VehicleBrand[] = [
  {
    name: "Mahindra",
    models: [
      {
        name: "Scorpio Classic",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Scorpio N",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "XUV700",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "XUV500",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "XUV300",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Thar",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Bolero",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Bolero Neo",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Marazzo",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Maruti Suzuki",
    models: [
      {
        name: "Swift",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Baleno",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Dzire",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Vitara Brezza",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Ertiga",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Wagon R",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Alto",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Celerio",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "S-Presso",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Eeco",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Ciaz",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "XL6",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Fronx",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Grand Vitara",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Jimny",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Hyundai",
    models: [
      {
        name: "Creta",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Venue",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "i20",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Verna",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Exter",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Alcazar",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Tucson",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Grand i10 Nios",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Aura",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Kona Electric",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Tata",
    models: [
      {
        name: "Nexon",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Harrier",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Safari",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Punch",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Altroz",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Tiago",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Tigor",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Nexon EV",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Tigor EV",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Kia",
    models: [
      {
        name: "Seltos",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Sonet",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Carens",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "EV6",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Honda",
    models: [
      {
        name: "City",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Amaze",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Elevate",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "CR-V",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Civic",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Toyota",
    models: [
      {
        name: "Innova Crysta",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Fortuner",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Urban Cruiser Hyryder",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Glanza",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Camry",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Hilux",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Innova Hycross",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Renault",
    models: [
      {
        name: "Kiger",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Triber",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Kwid",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Nissan",
    models: [
      {
        name: "Magnite",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "X-Trail",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Volkswagen",
    models: [
      {
        name: "Virtus",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Taigun",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Tiguan",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Skoda",
    models: [
      {
        name: "Slavia",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Kushaq",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Kodiaq",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Superb",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "MG",
    models: [
      {
        name: "Hector",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Astor",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "ZS EV",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Gloster",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Comet EV",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Jeep",
    models: [
      {
        name: "Compass",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Meridian",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Wrangler",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Citroen",
    models: [
      {
        name: "C3",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "C5 Aircross",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "eC3",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Ford",
    models: [
      {
        name: "Endeavour",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "EcoSport",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Figo",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Aspire",
        parts: COMMON_VEHICLE_PARTS,
      },
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
  {
    name: "Other",
    models: [
      {
        name: "Other",
        parts: COMMON_VEHICLE_PARTS,
      },
    ],
  },
];

// Helper functions
export function getBrandByName(brandName: string): VehicleBrand | undefined {
  return VEHICLE_DATA.find(brand => brand.name === brandName);
}

export function getModelsByBrand(brandName: string): VehicleModel[] {
  const brand = getBrandByName(brandName);
  return brand?.models || [];
}

export function getPartsByBrandAndModel(brandName: string, modelName: string): VehiclePart[] {
  const brand = getBrandByName(brandName);
  const model = brand?.models.find(m => m.name === modelName);
  return model?.parts || COMMON_VEHICLE_PARTS;
}

export function getAllBrandNames(): string[] {
  return VEHICLE_DATA.map(brand => brand.name);
}
