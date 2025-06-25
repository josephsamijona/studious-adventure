// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config();

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logger pour déboguer les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Créer le transporteur d'email
const createTransporter = () => {
  // Vérifier que les informations SMTP sont configurées
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ ATTENTION: Variables d\'environnement EMAIL_USER et/ou EMAIL_PASS non définies!');
  }

  // Créer le transporteur avec Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Mot de passe d'application Google
    }
  });
};

// Route pour vérifier la santé du serveur
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

// Route pour envoyer un email
app.post('/api/email/send', async (req, res) => {
  try {
    // Extraire les données du formulaire
    const { name, email, phone, message } = req.body;
    
    // Valider les données requises
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les champs nom, email et message sont obligatoires' 
      });
    }
    
    // Créer le transporteur
    const transporter = createTransporter();
    
    // Configurer les options d'email
    const mailOptions = {
      from: `"LIMAJS MOTORS" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER, // Par défaut, envoyer à soi-même
      replyTo: email,
      subject: `Nouveau message de ${name} via le formulaire de contact`,
      text: `
Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact du site web.
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
  <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Nouveau message de contact</h2>
  
  <div style="margin-bottom: 20px;">
    <p><strong>Nom:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
    ${phone ? `<p><strong>Téléphone:</strong> <a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></p>` : ''}
  </div>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #333;">Message:</h3>
    <p style="white-space: pre-line;">${message}</p>
  </div>
  
  <div style="font-size: 12px; color: #6b7280; border-top: 1px solid #e1e1e1; padding-top: 10px; margin-top: 20px;">
    <p>Ce message a été envoyé depuis le formulaire de contact du site web LIMAJS MOTORS.</p>
  </div>
</div>
      `
    };
    
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    // Succès
    console.log('Email envoyé:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      messageId: info.messageId
    });
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur d\'envoi d\'email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route pour envoyer une confirmation à l'utilisateur
app.post('/api/email/confirm', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email requis pour envoyer une confirmation'
      });
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"LIMAJS MOTORS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Nous avons bien reçu votre message',
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
  <h2 style="color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Merci pour votre message, ${name}!</h2>
  
  <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
  
  <p>Notre équipe examinera votre demande et vous répondra dans les plus brefs délais.</p>
  
  <div style="margin: 30px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 3px;">
    <p><strong>Heures d'ouverture:</strong></p>
    <p>Bureaux administratifs: Lundi - Vendredi (8h00 - 17h00), Samedi (8h00 - 12h00)</p>
    <p>Service client: Lundi - Vendredi (7h30 - 18h00), Samedi (8h00 - 16h00)</p>
  </div>
  
  <p>Si vous avez besoin d'une assistance immédiate, n'hésitez pas à nous appeler au <a href="tel:+50941704234" style="color: #3b82f6;">+509 41 70 4234</a>.</p>
  
  <p style="margin-top: 30px;">Cordialement,</p>
  <p><strong>L'équipe LIMAJS MOTORS</strong></p>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1e1e1; font-size: 12px; color: #6b7280; text-align: center;">
    <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
    <p>LIMAJS MOTORS - Génipailler, 3e Section Milot, Haïti</p>
  </div>
</div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      message: 'Email de confirmation envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur d\'envoi de confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de confirmation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// En mode production, servir les fichiers statiques du build React
if (process.env.NODE_ENV === 'production') {
  console.log('Mode production: Configuration pour servir les fichiers statiques');
  
  // Vérifier si le dossier dist existe
  const distPath = path.join(__dirname, '../dist');
  
  try {
    // Vérification synchrone pour simplifier
    if (fs.existsSync(distPath) && fs.statSync(distPath).isDirectory()) {
      console.log(`✅ Dossier dist trouvé à: ${distPath}`);
      
      // Servir les fichiers statiques
      app.use(express.static(distPath));
      
      // IMPORTANT: Placer cette route après toutes les routes API
      // Pour toutes les autres requêtes, renvoyer vers l'app React
      app.get('*', (req, res) => {
        console.log(`Redirection vers React pour: ${req.path}`);
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.error(`❌ ERREUR: Dossier dist non trouvé ou n'est pas un répertoire: ${distPath}`);
      console.error('Assurez-vous d\'avoir exécuté "npm run build" avant de démarrer le serveur en production');
    }
  } catch (err) {
    console.error(`❌ ERREUR lors de la vérification du dossier dist:`, err);
  }
}

// Démarrer le serveur avec gestion d'erreurs
try {
  app.listen(PORT, () => {
    console.log(`
=========================================
🚀 Serveur démarré sur le port ${PORT}
📝 Mode: ${process.env.NODE_ENV || 'development'}
📧 Service email: ${process.env.EMAIL_USER ? 'Configuré' : 'Non configuré'}
=========================================
    `);
  });
} catch (error) {
  console.error('ERREUR CRITIQUE AU DÉMARRAGE DU SERVEUR:', error);
}

// Gérer les erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});