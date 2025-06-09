#!/bin/bash

# Script to update all modal backdrop styles with inline CSS

echo "Updating modal backdrop styles..."

# Find all JSX files with modal-backdrop-blur-sm class
find src -name "*.jsx" -type f | while read file; do
    if grep -q "modal-backdrop-blur-sm" "$file"; then
        echo "Updating: $file"
        # Replace the modal backdrop with inline style
        sed -i 's|className="fixed inset-0 [^"]*modal-backdrop-blur-sm[^"]*"|className="fixed inset-0 flex items-center justify-center z-50 p-4"\n      style={{\n        backgroundColor: '\''rgba(0, 0, 0, 0.1)'\'',\n        backdropFilter: '\''blur(4px)'\'',\n        WebkitBackdropFilter: '\''blur(4px)'\''\n      }}|g' "$file"
    fi
done

echo "Modal backdrop updates completed!"
