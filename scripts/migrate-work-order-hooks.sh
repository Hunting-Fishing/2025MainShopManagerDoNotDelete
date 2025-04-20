
#!/bin/bash

# Check if work-orders directory exists
if [ -d "src/hooks/work-orders" ]; then
  # Move files if they don't already exist in workOrders
  for file in src/hooks/work-orders/*; do
    filename=$(basename "$file")
    if [ ! -f "src/hooks/workOrders/$filename" ]; then
      mv "$file" "src/hooks/workOrders/$filename"
    fi
  done
  
  # Remove the old directory
  rmdir src/hooks/work-orders
fi
