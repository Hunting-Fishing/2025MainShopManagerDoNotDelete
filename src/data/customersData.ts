
import { Customer, getCustomerFullName } from "@/types/customer";
import { workOrders } from "./workOrdersData";

// Extract unique customers from work orders to create initial customer data
const extractCustomersFromWorkOrders = (): Customer[] => {
  const uniqueCustomers = new Map<string, Customer>();
  
  workOrders.forEach(order => {
    if (!uniqueCustomers.has(order.customer)) {
      const [firstName, ...lastNameParts] = order.customer.split(' ');
      const lastName = lastNameParts.join(' ');
      
      // Create a new customer from work order data
      uniqueCustomers.set(order.customer, {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        first_name: firstName,
        last_name: lastName || '',
        email: `${order.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `(${Math.floor(100 + Math.random() * 900)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        address: order.location || 'Address not provided',
        shop_id: 'DEFAULT-SHOP-ID',
        created_at: new Date(2023, 0, 1 + Math.floor(Math.random() * 365)).toISOString(),
        updated_at: new Date().toISOString(),
        name: order.customer,
        dateAdded: new Date(2023, 0, 1 + Math.floor(Math.random() * 365)).toISOString().split('T')[0],
        status: 'active',
        lastServiceDate: order.date
      });
    } else {
      // Update last service date if newer
      const customer = uniqueCustomers.get(order.customer)!;
      const orderDate = new Date(order.date);
      const currentLastServiceDate = customer.lastServiceDate ? new Date(customer.lastServiceDate) : new Date(0);
      
      if (orderDate > currentLastServiceDate) {
        customer.lastServiceDate = order.date;
      }
    }
  });
  
  return Array.from(uniqueCustomers.values());
};

// Create our customers data
export const customers: Customer[] = [
  ...extractCustomersFromWorkOrders(),
  // Add some additional customers with more detailed information
  {
    id: "CUST-5643",
    first_name: "Riverfront",
    last_name: "Office Park",
    email: "manager@riverfrontoffice.com",
    phone: "(555) 823-9102",
    address: "2200 Riverside Drive, Suite 400",
    shop_id: 'DEFAULT-SHOP-ID',
    created_at: "2022-03-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    name: "Riverfront Office Park",
    company: "Riverfront Properties LLC",
    notes: "Large commercial property with multiple HVAC systems. Requires quarterly maintenance.",
    dateAdded: "2022-03-15",
    lastServiceDate: "2023-07-22",
    status: "active"
  },
  {
    id: "CUST-7821",
    first_name: "Mountain View",
    last_name: "Apartments",
    email: "maintenance@mountainview.com",
    phone: "(555) 492-3377",
    address: "1550 Summit Road",
    shop_id: 'DEFAULT-SHOP-ID',
    created_at: "2022-06-10T00:00:00Z",
    updated_at: new Date().toISOString(),
    name: "Mountain View Apartments",
    company: "Peak Living Properties",
    notes: "120 unit residential complex. Contact main office before servicing individual units.",
    dateAdded: "2022-06-10",
    lastServiceDate: "2023-08-05",
    status: "active"
  },
  {
    id: "CUST-8901",
    first_name: "Oceanside",
    last_name: "Hotel",
    email: "facilities@oceansidehotel.com",
    phone: "(555) 672-1290",
    address: "8730 Beach Boulevard",
    shop_id: 'DEFAULT-SHOP-ID',
    created_at: "2021-11-20T00:00:00Z",
    updated_at: new Date().toISOString(),
    name: "Oceanside Hotel",
    company: "Coastal Hospitality Group",
    notes: "Premium client. Requires 24/7 emergency support.",
    dateAdded: "2021-11-20",
    lastServiceDate: "2023-09-01",
    status: "active"
  }
];

// Find a customer by ID
export const findCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

// Find a customer by name
export const findCustomerByName = (name: string): Customer | undefined => {
  return customers.find(customer => customer.name === name);
};

// Get all customers
export const getAllCustomers = (): Customer[] => {
  return customers;
};
