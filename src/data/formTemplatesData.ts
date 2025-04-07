
import { FormTemplate, FormUpload, FormCategory } from "@/types/form";

// Form Templates
export const formTemplates: FormTemplate[] = [
  {
    id: "template-1",
    name: "Vehicle Inspection Form",
    description: "Standard vehicle inspection checklist for service entry",
    category: "Inspections",
    content: {
      sections: [
        {
          title: "Customer Information",
          fields: [
            { id: "name", label: "Customer Name", type: "text", required: true },
            { id: "phone", label: "Phone Number", type: "text", required: true }
          ]
        },
        {
          title: "Vehicle Information",
          fields: [
            { id: "make", label: "Make", type: "text", required: true },
            { id: "model", label: "Model", type: "text", required: true },
            { id: "year", label: "Year", type: "number", required: true },
            { id: "vin", label: "VIN", type: "text", required: true }
          ]
        }
      ]
    },
    created_by: "Admin User",
    created_at: "2023-05-15T14:30:00Z",
    updated_at: "2023-05-15T14:30:00Z",
    version: 1,
    is_published: true,
    tags: ["inspection", "vehicle", "checklist"]
  },
  {
    id: "template-2",
    name: "Service Agreement",
    description: "Standard service agreement for customer signature",
    category: "Agreements",
    content: {
      sections: [
        {
          title: "Terms and Conditions",
          fields: [
            { id: "terms", label: "Terms", type: "textarea", required: false }
          ]
        },
        {
          title: "Customer Signature",
          fields: [
            { id: "signature", label: "Signature", type: "text", required: true },
            { id: "date", label: "Date", type: "date", required: true }
          ]
        }
      ]
    },
    created_by: "Admin User",
    created_at: "2023-06-10T09:15:00Z",
    updated_at: "2023-06-15T11:30:00Z",
    version: 2,
    is_published: true,
    tags: ["agreement", "legal", "signature"]
  },
  {
    id: "template-3",
    name: "Customer Intake Form",
    description: "New customer information collection",
    category: "Customer Management",
    content: {
      sections: [
        {
          title: "Personal Information",
          fields: [
            { id: "firstName", label: "First Name", type: "text", required: true },
            { id: "lastName", label: "Last Name", type: "text", required: true },
            { id: "email", label: "Email", type: "text", required: true },
            { id: "phone", label: "Phone", type: "text", required: true }
          ]
        },
        {
          title: "Additional Information",
          fields: [
            { id: "referralSource", label: "How did you hear about us?", type: "select", required: false, 
              options: ["Google", "Friend", "Social Media", "Other"] }
          ]
        }
      ]
    },
    created_by: "Admin User",
    created_at: "2023-07-20T16:45:00Z",
    updated_at: "2023-07-20T16:45:00Z",
    version: 1,
    is_published: true,
    tags: ["intake", "customer", "onboarding"]
  },
  {
    id: "template-4",
    name: "Work Authorization",
    description: "Authorization form for repair work",
    category: "Agreements",
    content: {
      sections: [
        {
          title: "Work Details",
          fields: [
            { id: "workDescription", label: "Work Description", type: "textarea", required: true },
            { id: "estimatedCost", label: "Estimated Cost", type: "number", required: true }
          ]
        },
        {
          title: "Authorization",
          fields: [
            { id: "authorizeName", label: "Name", type: "text", required: true },
            { id: "authorizeSignature", label: "Signature", type: "text", required: true },
            { id: "authorizeDate", label: "Date", type: "date", required: true }
          ]
        }
      ]
    },
    created_by: "Admin User",
    created_at: "2023-08-05T10:20:00Z",
    updated_at: "2023-08-05T10:20:00Z",
    version: 1,
    is_published: true,
    tags: ["authorization", "work", "repair"]
  }
];

// Form Uploads
export const formUploads: FormUpload[] = [
  {
    id: "upload-1",
    filename: "customer-satisfaction-survey.pdf",
    filetype: "PDF",
    filesize: "245 KB",
    file_url: "/uploads/customer-satisfaction-survey.pdf",
    uploaded_by: "Admin User",
    uploaded_at: "2023-09-12T08:30:00Z"
  },
  {
    id: "upload-2",
    filename: "equipment-warranty-form.docx",
    filetype: "DOCX",
    filesize: "132 KB",
    file_url: "/uploads/equipment-warranty-form.docx",
    uploaded_by: "Admin User",
    uploaded_at: "2023-10-03T14:15:00Z"
  },
  {
    id: "upload-3",
    filename: "hvac-maintenance-agreement.pdf",
    filetype: "PDF",
    filesize: "1.2 MB",
    file_url: "/uploads/hvac-maintenance-agreement.pdf",
    uploaded_by: "Admin User",
    uploaded_at: "2023-10-15T09:45:00Z"
  }
];

// Form Categories
export const formCategories: FormCategory[] = [
  {
    id: "cat-1",
    name: "Inspections",
    description: "Forms for conducting equipment and vehicle inspections",
    count: 3,
    created_at: "2023-05-10T00:00:00Z"
  },
  {
    id: "cat-2",
    name: "Agreements",
    description: "Service agreements and contracts for customer signature",
    count: 4,
    created_at: "2023-05-10T00:00:00Z"
  },
  {
    id: "cat-3",
    name: "Customer Management",
    description: "Forms related to customer intake and management",
    count: 2,
    created_at: "2023-06-15T00:00:00Z"
  },
  {
    id: "cat-4",
    name: "Maintenance",
    description: "Maintenance checklists and schedules",
    count: 1,
    created_at: "2023-07-20T00:00:00Z"
  }
];
