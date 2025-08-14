#!/usr/bin/env python3
"""
Sample Python code demonstrating various operations with names
"""

def main():
    # List of sample names
    names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"]
    
    print("Original list of names:")
    print(names)
    print()
    
    # Sort names alphabetically
    sorted_names = sorted(names)
    print("Names sorted alphabetically:")
    print(sorted_names)
    print()
    
    # Filter names that start with vowels
    vowels = ['A', 'E', 'I', 'O', 'U']
    vowel_names = [name for name in names if name[0].upper() in vowels]
    print("Names starting with vowels:")
    print(vowel_names)
    print()
    
    # Create a dictionary with names and their lengths
    name_lengths = {name: len(name) for name in names}
    print("Names and their lengths:")
    for name, length in name_lengths.items():
        print(f"{name}: {length} characters")
    print()
    
    # Find the longest and shortest names
    longest_name = max(names, key=len)
    shortest_name = min(names, key=len)
    print(f"Longest name: {longest_name} ({len(longest_name)} characters)")
    print(f"Shortest name: {shortest_name} ({len(shortest_name)} characters)")
    print()
    
    # Add a new name
    new_name = "Isabella"
    names.append(new_name)
    print(f"Added new name: {new_name}")
    print("Updated list:")
    print(names)
    print()
    
    # Count names with specific letter
    letter_to_count = 'a'
    names_with_letter = [name for name in names if letter_to_count.lower() in name.lower()]
    print(f"Names containing the letter '{letter_to_count}':")
    print(names_with_letter)
    print(f"Count: {len(names_with_letter)}")

if __name__ == "__main__":
    main()
