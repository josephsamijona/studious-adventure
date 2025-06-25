// Importer les modules nécessaires
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Créer et configurer le transporteur d'email
const createTransporter = () => {
  // Vérifier que les informations SMTP sont configurées
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('ERREUR: Variables d\'environnement EMAIL_USER et/ou EMAIL_PASS non définies!');
  }

  // Créer le transporteur avec Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Utiliser un mot de passe d'application Google
    },
    tls: {
      rejectUnauthorized: false // Utile dans certains environnements restreints
    }
  });
};

// Route pour tester la configuration SMTP
router.get('/test', async (req, res) => {
  try {
    const transporter = createTransporter();
    
    // Vérifier la connexion au service SMTP
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Configuration SMTP vérifiée avec succès',
      email: process.env.EMAIL_USER
    });
  } catch (error) {
    console.error('Erreur de vérification SMTP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion au serveur SMTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route principale pour envoyer un email
router.post('/send', async (req, res) => {
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
    
    // Enregistrer l'ID du message pour référence
    console.log('Email envoyé:', info.messageId);
    
    // Renvoyer une réponse de succès
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
router.post('/confirm', async (req, res) => {
  try {
    // Extraire les données
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom et email requis pour envoyer une confirmation'
      });
    }
    
    const transporter = createTransporter();
    
    // Options pour l'email de confirmation
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
    
    // Envoyer l'email de confirmation
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

export default router;