
// Vehicle manufacturers categorized by region
export const vehicleManufacturers = {
  northAmerican: [
    'Buick',
    'Cadillac',
    'Chevrolet',
    'Chrysler',
    'Dodge',
    'Ford',
    'GMC',
    'Lincoln',
    'Pontiac',
    'Ram',
    'Saturn'
  ],
  
  european: [
    'Alfa Romeo',
    'Audi',
    'Bentley',
    'BMW',
    'Fiat',
    'Jaguar',
    'Lamborghini',
    'Land Rover',
    'Maserati',
    'Mercedes-Benz',
    'Mini',
    'Opel',
    'Peugeot',
    'Porsche',
    'Renault',
    'Rolls-Royce',
    'SEAT',
    'Smart',
    'Škoda',
    'Vauxhall',
    'Volkswagen',
    'Volvo'
  ],
  
  asian: [
    'Acura',
    'Genesis',
    'Honda',
    'Hyundai',
    'Infiniti',
    'Kia',
    'Lexus',
    'Mazda',
    'Mitsubishi',
    'Nissan',
    'Subaru',
    'Suzuki',
    'Toyota'
  ],
  
  electricAndOther: [
    'Ferrari',
    'Fisker',
    'Lucid',
    'Polestar',
    'Rivian',
    'Tesla'
  ]
};

// Update getAllVehicleManufacturers to only include vehicle manufacturers
export const getAllVehicleManufacturers = () => {
  return [
    ...vehicleManufacturers.northAmerican,
    ...vehicleManufacturers.european,
    ...vehicleManufacturers.asian,
    ...vehicleManufacturers.electricAndOther
  ].sort((a, b) => a.localeCompare(b));
};
