// Importer les modules nécessaires
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import emailRoutes from './api/email.js';

// Configurer dotenv pour charger les variables d'environnement
dotenv.config();

// Obtenir le répertoire actuel (équivalent à __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pour le logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware pour parser le JSON et gérer CORS
app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/email', emailRoutes);

// En mode production, servir les fichiers statiques du build React
if (process.env.NODE_ENV === 'production') {
  // Définir le chemin vers les fichiers statiques
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Pour toutes les autres routes non-API, renvoyer vers l'app React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Route pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Le serveur fonctionne correctement',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne est survenue' 
      : err.message
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
=========================================
🚀 Serveur démarré sur le port ${PORT}
📝 Mode: ${process.env.NODE_ENV || 'development'}
📧 Service email: ${process.env.EMAIL_USER ? 'Configuré' : 'Non configuré'}
=========================================
  `);
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  // En production, vous pourriez vouloir redémarrer l'application
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});