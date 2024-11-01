for file in css/*; do
    filename=$(basename "$file")
    if [ -f "css copy/$filename" ]; then
        echo "Comparing $filename:"
        diff "$file" "css copy/$filename"
        echo
    else
        echo "$filename does not exist in dir2"
    fi
done