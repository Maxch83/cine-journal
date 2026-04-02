import glob

html_files = glob.glob('*.html')
for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Remplacer index.html dans href par films.html (cas généraux de la navbar ou back links)
        content = content.replace('href="index.html"', 'href="films.html"')
        
        # Rendre le logo Navbar cliquable vers index.html (le HUB)
        content = content.replace('<div class="navbar-logo">', '<a href="index.html" class="navbar-logo" style="text-decoration:none;" title="Retour au Portail Maxime Chapman">')
        
        # Remplacer la fermeture
        content = content.replace('</span> CinéJournal\n    </div>', '</span> CinéJournal\n    </a>')
        content = content.replace('</span>CinéJournal</div>', '</span>CinéJournal</a>')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated", file)
    except Exception as e:
        print("Error with", file, e)

print('Mise à jour terminée.')
