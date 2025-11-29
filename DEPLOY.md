# 🚀 Guide de Déploiement - Costructor Clone

Votre application est prête à être mise en ligne ! Voici comment la déployer gratuitement et rapidement pour que vos collègues puissent la tester.

## Option Recommandée : Vercel (Le plus simple)

Vercel est la plateforme standard pour les applications React/Vite. C'est gratuit, rapide et très performant.

### Pré-requis
- Un compte [GitHub](https://github.com/) (Gratuit)
- Un compte [Vercel](https://vercel.com/) (Gratuit, connectez-vous avec GitHub)

### Étapes

1. **Pousser le code sur GitHub**
   Si ce n'est pas déjà fait, créez un nouveau "Repository" sur GitHub et poussez votre code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Suivez les instructions de GitHub pour ajouter le 'remote' et faire le 'push'
   ```

2. **Importer dans Vercel**
   - Allez sur votre [Dashboard Vercel](https://vercel.com/dashboard).
   - Cliquez sur **"Add New..."** > **"Project"**.
   - Sélectionnez votre repository GitHub `log-devis-app` (ou le nom que vous lui avez donné).
   - Cliquez sur **"Import"**.

3. **Configurer et Déployer**
   - **Framework Preset** : Vercel détectera automatiquement `Vite`. C'est parfait.
   - **Root Directory** : Laissez `./` (par défaut).
   - **Build Command** : `npm run build` (par défaut).
   - **Output Directory** : `dist` (par défaut).
   - Cliquez sur **"Deploy"**.

4. **C'est en ligne !**
   - Attendez environ 1 minute.
   - Vercel vous donnera une URL du type `https://votre-projet.vercel.app`.
   - Envoyez ce lien à vos collègues !

## Option Alternative : Netlify

1. Créez un compte sur [Netlify](https://www.netlify.com/).
2. Glissez-déposez le dossier `dist` (généré après avoir lancé `npm run build` sur votre machine) directement dans la zone de drop de Netlify.
3. C'est tout !

## ⚠️ Note Importante sur les Données

Cette version de l'application stocke les données **localement dans le navigateur** de chaque utilisateur (localStorage).
- **Ce que vos collègues verront** : L'application vide (ou avec les données de démo). Ils pourront créer leurs propres devis.
- **Ce qu'ils ne verront PAS** : Vos devis à vous. Les données ne sont pas partagées entre les utilisateurs.

Pour partager des données en temps réel, il faudrait ajouter une base de données (backend), ce qui est une étape plus complexe pour une v2.
