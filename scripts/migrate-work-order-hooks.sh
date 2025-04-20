
#!/bin/bash

echo "Starting work order hooks migration..."

# Create workOrders directory if it doesn't exist
mkdir -p src/hooks/workOrders

# Check if work-orders directory exists
if [ -d "src/hooks/work-orders" ]; then
  echo "Found work-orders directory, migrating files..."
  
  # Move files if they don't already exist in workOrders
  for file in src/hooks/work-orders/*; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      if [ ! -f "src/hooks/workOrders/$filename" ]; then
        echo "Moving $filename to workOrders directory"
        mv "$file" "src/hooks/workOrders/$filename"
      else
        echo "File $filename already exists in workOrders, removing duplicate from work-orders"
        rm "$file"
      fi
    fi
  done
  
  # Check if the directory is empty before removing
  if [ -z "$(ls -A src/hooks/work-orders)" ]; then
    echo "Removing empty work-orders directory"
    rmdir src/hooks/work-orders
  else
    echo "work-orders directory is not empty, please review remaining files"
  fi
else
  echo "work-orders directory not found, nothing to migrate"
fi

echo "Migration complete!"

