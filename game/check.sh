for file in css-to-merge/*; do
    filename=$(basename "$file")
    if [ -f "css/$filename" ]; then
        echo "Comparing $filename:"
        diff "$file" "css/$filename"
        echo
    else
        echo "$filename does not exist in dir2"
    fi
done