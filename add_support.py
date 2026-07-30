import os

html_dir = r"c:\Users\rashm\.gemini\antigravity-ide\scratch\goat-suraksha-dashboard"

for filename in os.listdir(html_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if already added
        if 'support.js' not in content:
            if "</body>" in content:
                content = content.replace("</body>", '<script src="support.js"></script>\n</body>')
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Added support.js to {filename}")
            else:
                print(f"No </body> tag found in {filename}")
        else:
            print(f"support.js already in {filename}")
