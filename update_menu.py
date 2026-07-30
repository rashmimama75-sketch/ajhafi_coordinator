import os

html_dir = r"c:\Users\rashm\.gemini\antigravity-ide\scratch\goat-suraksha-dashboard"

# Standard target content
targets = [
    # Non-active sidebar item
    (
        """                <a href="settings.html" class="nav-item" id="navSettings">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Settings</span>
                </a>""",
        """                <a href="settings.html" class="nav-item" id="navSettings">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>"""
    ),
    # Active sidebar item
    (
        """                <a href="settings.html" class="nav-item active" id="navSettings">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Settings</span>
                </a>""",
        """                <a href="settings.html" class="nav-item active" id="navSettings">
                    <i class="fa-solid fa-user"></i>
                    <span>Profile</span>
                </a>"""
    ),
    # Top navbar in privacy-policy.html
    (
        """<a href="settings.html" class="nav-link-item">Settings</a>""",
        """<a href="settings.html" class="nav-link-item">Profile</a>"""
    )
]

for filename in os.listdir(html_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(html_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        modified = False
        for target, replacement in targets:
            if target in content:
                content = content.replace(target, replacement)
                modified = True
        
        if modified:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filename}")
