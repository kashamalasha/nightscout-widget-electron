#!/bin/bash

# Check if an array string is provided as an argument
if [ $# -eq 0 ]; then
  echo "Usage: $0 '( \"element1\" \"element2\" ... \"elementN\" )'"
  exit 1
fi

# Get the array string argument
array_string="$1"

# Remove leading and trailing spaces and parentheses
array_string="${array_string#(}"
array_string="${array_string%)}"

# Convert the array string to an actual array
IFS=', ' read -ra elements <<< "$array_string"

# Iterate over the array elements
echo "Iterating over the elements:"
for el in "${elements[@]}"; do
  echo "$el"
done

# You can perform other operations with the elements here
