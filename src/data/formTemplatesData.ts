// Define form template data
export const formTemplateData = [
  {
    id: '1',
    name: 'Vehicle Inspection',
    description: 'Standard vehicle inspection form',
    category: 'Vehicle Inspection',
    content: {
      sections: [
        {
          id: 'section-1',
          title: 'Basic Information',
          description: 'Vehicle and customer information',
          fields: [
            {
              id: 'field-1',
              label: 'Customer Name',
              type: 'text',
              required: true,
              placeholder: 'Enter customer name'
            },
            {
              id: 'field-2',
              label: 'Vehicle Make',
              type: 'text',
              required: true,
              placeholder: 'Enter vehicle make'
            },
            {
              id: 'field-3',
              label: 'Vehicle Model',
              type: 'text',
              required: true,
              placeholder: 'Enter vehicle model'
            },
            {
              id: 'field-4',
              label: 'Vehicle Year',
              type: 'number',
              required: true,
              placeholder: 'Enter vehicle year'
            },
            {
              id: 'field-5',
              label: 'VIN',
              type: 'text',
              required: true,
              placeholder: 'Enter VIN'
            },
            {
              id: 'field-6',
              label: 'Mileage',
              type: 'number',
              required: true,
              placeholder: 'Enter current mileage'
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Visual Inspection',
          description: 'Exterior and interior visual inspection',
          fields: [
            {
              id: 'field-7',
              label: 'Exterior Condition',
              type: 'select',
              required: true,
              options: ['Excellent', 'Good', 'Fair', 'Poor']
            },
            {
              id: 'field-8',
              label: 'Interior Condition',
              type: 'select',
              required: true,
              options: ['Excellent', 'Good', 'Fair', 'Poor']
            },
            {
              id: 'field-9',
              label: 'Notes',
              type: 'textarea',
              required: false,
              placeholder: 'Enter any additional notes'
            }
          ]
        }
      ]
    },
    created_by: 'Admin',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-02-01T00:00:00Z',
    version: 1,
    is_published: true,
    tags: ['inspection', 'vehicle', 'routine']
  },
  {
    id: '2',
    name: 'Oil Change Service',
    description: 'Standard oil change service form',
    category: 'Maintenance',
    content: {
      sections: [
        {
          id: 'section-1',
          title: 'Service Details',
          description: 'Oil change service details',
          fields: [
            {
              id: 'field-1',
              label: 'Oil Type',
              type: 'select',
              required: true,
              options: ['Conventional', 'Synthetic Blend', 'Full Synthetic', 'High Mileage']
            },
            {
              id: 'field-2',
              label: 'Oil Viscosity',
              type: 'select',
              required: true,
              options: ['0W-20', '5W-20', '5W-30', '10W-30', '10W-40', '15W-40', '20W-50']
            },
            {
              id: 'field-3',
              label: 'Oil Filter Brand',
              type: 'text',
              required: true,
              placeholder: 'Enter oil filter brand'
            },
            {
              id: 'field-4',
              label: 'Oil Filter Part Number',
              type: 'text',
              required: false,
              placeholder: 'Enter oil filter part number'
            },
            {
              id: 'field-5',
              label: 'Oil Quantity (Quarts)',
              type: 'number',
              required: true,
              placeholder: 'Enter oil quantity in quarts'
            }
          ]
        }
      ]
    },
    created_by: 'Admin',
    created_at: '2023-01-20T00:00:00Z',
    updated_at: '2023-01-25T00:00:00Z',
    version: 1,
    is_published: true,
    tags: ['oil-change', 'maintenance', 'service']
  },
  {
    id: '3',
    name: 'Brake Service',
    description: 'Comprehensive brake inspection and service form',
    category: 'Repairs',
    content: {
      sections: [
        {
          id: 'section-1',
          title: 'Brake Inspection',
          description: 'Brake system inspection details',
          fields: [
            {
              id: 'field-1',
              label: 'Front Brake Pad Thickness (mm)',
              type: 'number',
              required: true,
              placeholder: 'Enter thickness in mm'
            },
            {
              id: 'field-2',
              label: 'Rear Brake Pad Thickness (mm)',
              type: 'number',
              required: true,
              placeholder: 'Enter thickness in mm'
            },
            {
              id: 'field-3',
              label: 'Front Rotor Condition',
              type: 'select',
              required: true,
              options: ['Good', 'Warped', 'Scored', 'Needs Replacement']
            },
            {
              id: 'field-4',
              label: 'Rear Rotor Condition',
              type: 'select',
              required: true,
              options: ['Good', 'Warped', 'Scored', 'Needs Replacement']
            },
            {
              id: 'field-5',
              label: 'Brake Fluid Condition',
              type: 'select',
              required: true,
              options: ['Good', 'Needs Flush', 'Low', 'Contaminated']
            }
          ]
        }
      ]
    },
    created_by: 'Admin',
    created_at: '2023-01-25T00:00:00Z',
    updated_at: '2023-02-05T00:00:00Z',
    version: 1,
    is_published: true,
    tags: ['brakes', 'service', 'safety']
  },
  {
    id: '4',
    name: 'Tire Service',
    description: 'Tire inspection and service form',
    category: 'Maintenance',
    content: {
      sections: [
        {
          id: 'section-1',
          title: 'Tire Inspection',
          description: 'Tire condition and pressure details',
          fields: [
            {
              id: 'field-1',
              label: 'Front Left Tire Pressure (PSI)',
              type: 'number',
              required: true,
              placeholder: 'Enter pressure in PSI'
            },
            {
              id: 'field-2',
              label: 'Front Right Tire Pressure (PSI)',
              type: 'number',
              required: true,
              placeholder: 'Enter pressure in PSI'
            },
            {
              id: 'field-3',
              label: 'Rear Left Tire Pressure (PSI)',
              type: 'number',
              required: true,
              placeholder: 'Enter pressure in PSI'
            },
            {
              id: 'field-4',
              label: 'Rear Right Tire Pressure (PSI)',
              type: 'number',
              required: true,
              placeholder: 'Enter pressure in PSI'
            },
            {
              id: 'field-5',
              label: 'Tire Rotation Performed',
              type: 'checkbox',
              required: false
            }
          ]
        }
      ]
    },
    created_by: 'Admin',
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-02-10T00:00:00Z',
    version: 1,
    is_published: true,
    tags: ['tires', 'rotation', 'maintenance']
  }
];

// Export form categories
export const formCategories = [
  {
    id: '1',
    name: 'Vehicle Inspection',
    description: 'Forms for vehicle inspections',
    count: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Maintenance',
    description: 'Forms for routine maintenance services',
    count: 2,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Repairs',
    description: 'Forms for repair services',
    count: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Customer Intake',
    description: 'Forms for new customer information',
    count: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];
