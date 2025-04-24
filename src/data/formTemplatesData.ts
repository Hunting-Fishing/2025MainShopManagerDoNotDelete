
// Sample form template data for demonstration purposes
export const formTemplateData = [
  {
    id: '1',
    name: 'Vehicle Inspection Form',
    description: 'A comprehensive vehicle inspection checklist',
    version: 1,
    category: 'inspection',
    is_published: true,
    created_at: '2023-01-15T10:30:00Z',
    sections: [
      {
        id: 's1',
        title: 'Vehicle Information',
        description: 'Basic vehicle details',
        displayOrder: 1,
        fields: [
          {
            id: 'f1',
            label: 'VIN',
            fieldType: 'text',
            required: true,
            placeholder: 'Enter vehicle identification number',
            displayOrder: 1,
            validationRules: {
              minLength: 17,
              maxLength: 17
            }
          },
          {
            id: 'f2',
            label: 'Make',
            fieldType: 'text',
            required: true,
            placeholder: 'Vehicle manufacturer',
            displayOrder: 2
          },
          {
            id: 'f3',
            label: 'Model',
            fieldType: 'text',
            required: true,
            placeholder: 'Vehicle model',
            displayOrder: 3
          },
          {
            id: 'f4',
            label: 'Year',
            fieldType: 'number',
            required: true,
            placeholder: 'Vehicle year',
            displayOrder: 4,
            validationRules: {
              min: 1900,
              max: 2030
            }
          },
          {
            id: 'f5',
            label: 'Mileage',
            fieldType: 'number',
            required: true,
            placeholder: 'Current vehicle mileage',
            displayOrder: 5
          }
        ]
      },
      {
        id: 's2',
        title: 'Exterior Inspection',
        description: 'Inspection of vehicle exterior components',
        displayOrder: 2,
        fields: [
          {
            id: 'f6',
            label: 'Body Condition',
            fieldType: 'select',
            required: true,
            displayOrder: 1,
            options: [
              { label: 'Excellent', value: 'excellent' },
              { label: 'Good', value: 'good' },
              { label: 'Fair', value: 'fair' },
              { label: 'Poor', value: 'poor' }
            ]
          },
          {
            id: 'f7',
            label: 'Paint Condition',
            fieldType: 'select',
            required: true,
            displayOrder: 2,
            options: [
              { label: 'Excellent', value: 'excellent' },
              { label: 'Good', value: 'good' },
              { label: 'Fair', value: 'fair' },
              { label: 'Poor', value: 'poor' }
            ]
          },
          {
            id: 'f8',
            label: 'Windshield',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 3,
            helpText: 'Check if windshield is intact with no cracks'
          },
          {
            id: 'f9',
            label: 'Lights Functional',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 4,
            helpText: 'Check if all exterior lights are working'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Customer Satisfaction Survey',
    description: 'Post-service customer feedback form',
    version: 2,
    category: 'feedback',
    is_published: true,
    created_at: '2023-02-20T14:45:00Z',
    sections: [
      {
        id: 's3',
        title: 'Service Quality',
        description: 'Rate your satisfaction with our service',
        displayOrder: 1,
        fields: [
          {
            id: 'f10',
            label: 'Overall Satisfaction',
            fieldType: 'rating',
            required: true,
            displayOrder: 1,
            helpText: 'Rate your overall satisfaction with our service'
          },
          {
            id: 'f11',
            label: 'Technician Professionalism',
            fieldType: 'rating',
            required: true,
            displayOrder: 2
          },
          {
            id: 'f12',
            label: 'Service Timeliness',
            fieldType: 'rating',
            required: true,
            displayOrder: 3
          }
        ]
      },
      {
        id: 's4',
        title: 'Additional Feedback',
        description: 'Please provide any additional comments',
        displayOrder: 2,
        fields: [
          {
            id: 'f13',
            label: 'Comments',
            fieldType: 'textarea',
            required: false,
            displayOrder: 1,
            placeholder: 'Share your thoughts about our service'
          },
          {
            id: 'f14',
            label: 'Would you recommend us?',
            fieldType: 'radio',
            required: true,
            displayOrder: 2,
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
              { label: 'Maybe', value: 'maybe' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Maintenance Checklist',
    description: 'Standard maintenance checklist form',
    version: 1,
    category: 'maintenance',
    is_published: true,
    created_at: '2023-03-10T09:15:00Z',
    sections: [
      {
        id: 's5',
        title: 'Fluids Check',
        description: 'Verification of all vehicle fluids',
        displayOrder: 1,
        fields: [
          {
            id: 'f15',
            label: 'Engine Oil',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 1
          },
          {
            id: 'f16',
            label: 'Transmission Fluid',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 2
          },
          {
            id: 'f17',
            label: 'Brake Fluid',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 3
          },
          {
            id: 'f18',
            label: 'Coolant',
            fieldType: 'checkbox',
            required: true,
            displayOrder: 4
          }
        ]
      }
    ]
  }
];

// Export for backwards compatibility
export const formTemplates = formTemplateData;
