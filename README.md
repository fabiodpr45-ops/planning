# planning

Application web simple de planning pour :
- gérer une base ouvriers,
- gérer une base chantiers,
- gérer une base sous-traitants,
- créer des affectations chantier + ouvrier + sous-traitant,
- consulter plusieurs vues du planning.

## Pages
- `login.html` : page d'accueil/connexion (`DPR45` / `Isolation45`)
- `dashboard.html` : gestion des bases de données
- `planning.html` : affectations et vues du planning

## Lancer en local (mode web)
```bash
python3 -m http.server 8000
```
Puis ouvrir <http://localhost:8000>.

## EXE fonctionnel Windows
Un lanceur desktop est fourni dans `app.py` et ouvre automatiquement l'application dans le navigateur.

### 1) Build de l'exe
Sous Windows (cmd):
```bat
build_exe.bat
```

Cela génère :
- `dist\PlanningDPR45\PlanningDPR45.exe`

### 2) Exécuter
Double-clique sur `PlanningDPR45.exe`.

Le programme :
- démarre un serveur local sur `127.0.0.1` (port 8000+),
- ouvre automatiquement la page `index.html`.

### 3) Options utiles
Depuis un terminal :
```bat
PlanningDPR45.exe --no-browser
PlanningDPR45.exe --port 8010
PlanningDPR45.exe --duration 60
```
