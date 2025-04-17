
// Equipment and specialized machinery skills organized by category
export const equipmentSkills = {
  constructionEquipment: {
    name: 'Construction / Earthmoving Equipment',
    skills: [
      'Bobcat Skid Steer',
      'Mini Excavator',
      'Backhoe Loader',
      'Bulldozer',
      'Grader',
      'Compact Track Loader'
    ]
  },
  materialHandling: {
    name: 'Material Handling & Lifting',
    skills: [
      'Forklift – Propane',
      'Forklift – Electric',
      'Telehandler',
      'Crane Operation',
      'Scissor Lift',
      'Boom Lift / Cherry Picker'
    ]
  },
  utilityEquipment: {
    name: 'Utility / Support Equipment',
    skills: [
      'Air Compressor System',
      'Hydraulic Systems',
      'Generator Maintenance',
      'Tow Motor',
      'Salt Spreader / Plow Setup',
      'Pressure Washer System'
    ]
  },
  otherEquipment: {
    name: 'Other Common Equipment',
    skills: [
      'Farm Tractor',
      'Street Sweeper',
      'Water Truck',
      'Dump Truck'
    ]
  }
};

export const getAllEquipmentSkills = () => {
  return Object.values(equipmentSkills)
    .flatMap(category => category.skills)
    .sort();
};

