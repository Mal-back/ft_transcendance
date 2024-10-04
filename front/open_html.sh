open home.html
open class.html
find pages -name "*.html" | while read -r file; do xdg-open "$file"; done
