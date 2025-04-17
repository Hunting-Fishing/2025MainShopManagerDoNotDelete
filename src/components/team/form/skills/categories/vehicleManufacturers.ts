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
  ],
  
  atvUtv: {
    name: 'ATV / UTV Manufacturers',
    skills: [
      'Polaris',
      'Can-Am (BRP)',
      'Yamaha',
      'Honda',
      'Kawasaki',
      'Suzuki',
      'Arctic Cat',
      'CF Moto',
      'Kymco',
      'Hisun',
      'Segway Powersports',
      'Tracker Off Road',
      'Massimo',
      'Tao Motor',
      'SSR Motorsports',
      'Linhai'
    ]
  },
  
  workUtilityAtvUtv: {
    name: 'Work Utility ATV/UTV',
    skills: [
      'John Deere Gator',
      'Kubota RTV',
      'Bobcat Utility Vehicles',
      'Mahindra ROXOR',
      'Kioti Mechron',
      'Gravely Atlas',
      'JCB Workmax'
    ]
  },
  
  europeanNicheAtvUtv: {
    name: 'European & Niche ATV/UTV',
    skills: [
      'TGB (Taiwan Golden Bee)',
      'Access Motor',
      'GOES',
      'Quadzilla'
    ]
  }
};

// Update the getAllVehicleManufacturers function to include new categories
export const getAllVehicleManufacturers = () => {
  return [
    ...vehicleManufacturers.northAmerican,
    ...vehicleManufacturers.european,
    ...vehicleManufacturers.asian,
    ...vehicleManufacturers.electricAndOther,
    ...vehicleManufacturers.atvUtv.skills,
    ...vehicleManufacturers.workUtilityAtvUtv.skills,
    ...vehicleManufacturers.europeanNicheAtvUtv.skills
  ].sort((a, b) => a.localeCompare(b));
};
