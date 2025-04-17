
// Commercial and specialty vehicles categorized by type
export const commercialVehicles = {
  heavyDutyTrucks: [
    'DAF',
    'Mack',
    'MAN',
    'Navistar',
    'Scania',
    'Sterling',
    'Volvo Trucks',
    'Western Star'
  ],
  
  busShuttleManufacturers: [
    'Blue Bird',
    'Gillig',
    'IC Bus',
    'New Flyer',
    'Prevost',
    'Thomas Built Buses'
  ],
  
  recreationalRVManufacturers: [
    'Coachmen',
    'Jayco',
    'Thor Industries',
    'Tiffin Motorhomes',
    'Winnebago'
  ],
  
  utilityWorkTruckBuilders: [
    'Crysteel',
    'Morgan Olson',
    'Reading Truck Group',
    'Spartan Motors',
    'Utilimaster',
    'Workhorse Group'
  ]
};

// Combine all commercial vehicles into a single sorted array
export const getAllCommercialVehicles = () => {
  return [
    ...commercialVehicles.heavyDutyTrucks,
    ...commercialVehicles.busShuttleManufacturers,
    ...commercialVehicles.recreationalRVManufacturers,
    ...commercialVehicles.utilityWorkTruckBuilders
  ].sort();
};
