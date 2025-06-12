import argparse

def append_to_file(file_path, new_string):
    # Open the file in append mode
    with open(file_path, 'a', encoding='utf-8') as file:
        # Write the new string followed by a newline character
        file.write(new_string + '\n')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Append a new quote to a text file.")
    
    # Add arguments for file path and new string (optional)
    parser.add_argument('file_path', type=str, help='Path to the text file')
    parser.add_argument('--new_string', type=str, help='New quote to append')
    
    args = parser.parse_args()
    
    if not args.new_string:
        args.new_string = input("Please enter the new quote: ")
    
    append_to_file(args.file_path, args.new_string)
    print(f"The new quote '{args.new_string}' has been appended to {args.file_path}.")