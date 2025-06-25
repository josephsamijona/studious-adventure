// src/utils/emailService.js
import nodemailer from 'nodemailer';

// Configuration SMTP Gmail
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: import.meta.env.VITE_GMAIL_USER,
    pass: import.meta.env.VITE_GMAIL_APP_PASSWORD,
  },
};

// Email de destination
const DESTINATION_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'mainoffice@limajs.com';

/**
 * Crée un transporteur Nodemailer
 * @returns {Object} - Transporteur configuré
 */
const createTransporter = () => {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    throw new Error('Configuration SMTP manquante. Vérifiez VITE_GMAIL_USER et VITE_GMAIL_APP_PASSWORD.');
  }

  return nodemailer.createTransporter({
    ...SMTP_CONFIG,
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Valide les données du formulaire de contact
 * @param {Object} data - Données du formulaire
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateContactData = (data) => {
  const errors = {};

  // Validation du nom
  if (!data.name || !data.name.trim()) {
    errors.name = 'Le nom est requis';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères';
  }

  // Validation de l'email
  if (!data.email || !data.email.trim()) {
    errors.email = 'L\'email est requis';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Format d\'email invalide';
    }
  }

  // Validation du téléphone (optionnel)
  if (data.phone && data.phone.trim()) {
    const haitianPhoneRegex = /^(\+509|509)?[\s-]?([234789]\d{7})$/;
    const cleanPhone = data.phone.replace(/[\s-]/g, '');
    if (!haitianPhoneRegex.test(cleanPhone)) {
      errors.phone = 'Format de numéro haïtien invalide (+509 XX XX XXXX)';
    }
  }

  // Validation du message
  if (!data.message || !data.message.trim()) {
    errors.message = 'Le message est requis';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
  } else if (data.message.trim().length > 1000) {
    errors.message = 'Le message ne peut pas dépasser 1000 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Crée le contenu HTML de l'email
 * @param {Object} data - Données du contact
 * @returns {string} - HTML de l'email
 */
const createEmailHTML = (data) => {
  const currentDate = new Date().toLocaleString('fr-FR', {
    timeZone: 'America/Port-au-Prince',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau message de contact - LIMAJS MOTORS</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px 20px;
        }
        .field {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .label {
          font-weight: 600;
          color: #2563eb;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .value {
          color: #333;
          font-size: 16px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e9ecef;
        }
        .logo {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
        }
        .highlight {
          background-color: #fff3cd;
          padding: 2px 6px;
          border-radius: 4px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚌 LIMAJS MOTORS</div>
          <h1>Nouveau message de contact</h1>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">👤 Nom complet</div>
            <div class="value">${escapeHtml(data.name)}</div>
          </div>
          
          <div class="field">
            <div class="label">📧 Adresse email</div>
            <div class="value">
              <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">
                ${escapeHtml(data.email)}
              </a>
            </div>
          </div>
          
          ${data.phone ? `
          <div class="field">
            <div class="label">📱 Numéro de téléphone</div>
            <div class="value">
              <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; text-decoration: none;">
                ${formatHaitianPhone(data.phone)}
              </a>
            </div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">💬 Message</div>
            <div class="value">${escapeHtml(data.message)}</div>
          </div>
          
          <div class="field">
            <div class="label">🕒 Date et heure de réception</div>
            <div class="value">
              <span class="highlight">${currentDate}</span> (Heure d'Haïti)
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>LIMAJS MOTORS</strong> - Service de transport</p>
          <p>📍 Génipailler, 3e Section Milot | 📞 +509 41 70 4234</p>
          <p>Ce message a été envoyé via le formulaire de contact du site web</p>
          <p style="margin-top: 15px; font-size: 11px; color: #999;">
            Pour répondre à ce message, utilisez directement l'adresse email du client ci-dessus.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Échappe les caractères HTML
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Formate un numéro de téléphone haïtien
 * @param {string} phone - Numéro brut
 * @returns {string} - Numéro formaté
 */
const formatHaitianPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('509')) {
    const number = cleaned.substring(3);
    return `+509 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4)}`;
  } else if (cleaned.length === 8) {
    return `+509 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4)}`;
  }
  
  return phone;
};

/**
 * Crée le contenu texte de l'email
 * @param {Object} data - Données du contact
 * @returns {string} - Texte de l'email
 */
const createEmailText = (data) => {
  const currentDate = new Date().toLocaleString('fr-FR', {
    timeZone: 'America/Port-au-Prince'
  });

  return `
NOUVEAU MESSAGE DE CONTACT - LIMAJS MOTORS
==========================================

Nom: ${data.name}
Email: ${data.email}
${data.phone ? `Téléphone: ${formatHaitianPhone(data.phone)}` : ''}

Message:
${data.message}

Date de réception: ${currentDate} (Heure d'Haïti)

---
LIMAJS MOTORS - Service de transport
Génipailler, 3e Section Milot
Tél: +509 41 70 4234
Email: mainoffice@limajs.com

Ce message a été envoyé via le formulaire de contact du site web.
Pour répondre, utilisez directement l'adresse email du client.
  `.trim();
};

/**
 * Envoie un email de contact via SMTP Gmail
 * @param {Object} contactData - Données du contact
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export const sendContactEmail = async (contactData) => {
  try {
    // Valider les données
    const validation = validateContactData(contactData);
    if (!validation.isValid) {
      throw new Error('Données invalides: ' + Object.values(validation.errors).join(', '));
    }

    // Créer le transporteur
    const transporter = createTransporter();

    // Debug en mode développement
    if (import.meta.env.DEV) {
      console.log('📧 Configuration SMTP:', {
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        user: SMTP_CONFIG.auth.user,
        destination: DESTINATION_EMAIL
      });
    }

    // Vérifier la connexion SMTP
    await transporter.verify();

    // Préparer les options de l'email
    const mailOptions = {
      from: {
        name: 'Site Web LIMAJS MOTORS',
        address: SMTP_CONFIG.auth.user
      },
      to: DESTINATION_EMAIL,
      replyTo: {
        name: contactData.name.trim(),
        address: contactData.email.trim()
      },
      subject: `Nouveau message de contact - ${contactData.name.trim()}`,
      text: createEmailText(contactData),
      html: createEmailHTML(contactData),
      headers: {
        'X-Mailer': 'LIMAJS MOTORS Contact Form',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    };

    // Envoyer l'email
    const result = await transporter.sendMail(mailOptions);

    if (import.meta.env.DEV) {
      console.log('✅ Email envoyé avec succès:', {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      });
    }

    return {
      success: true,
      message: 'Message envoyé avec succès',
      messageId: result.messageId,
      details: {
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

    // Gestion des erreurs spécifiques
    let errorMessage = 'Erreur lors de l\'envoi du message';

    if (error.code === 'EAUTH') {
      errorMessage = 'Erreur d\'authentification Gmail. Vérifiez vos identifiants.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur Gmail.';
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Erreur dans le contenu du message.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Erreur dans les adresses email.';
    } else if (error.responseCode === 550) {
      errorMessage = 'Adresse email de destination invalide.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Identifiants Gmail incorrects.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Vérifie la configuration SMTP
 * @returns {Object} - État de la configuration
 */
export const checkSMTPConfig = () => {
  const isConfigured = !!(
    SMTP_CONFIG.auth.user && 
    SMTP_CONFIG.auth.pass && 
    DESTINATION_EMAIL
  );

  return {
    isConfigured,
    missing: {
      gmail_user: !SMTP_CONFIG.auth.user,
      gmail_password: !SMTP_CONFIG.auth.pass,
      contact_email: !DESTINATION_EMAIL,
    },
    config: import.meta.env.DEV ? {
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      user: SMTP_CONFIG.auth.user ? SMTP_CONFIG.auth.user.replace(/(.{3}).*(@.*)/, '$1***$2') : 'Non défini',
      destination: DESTINATION_EMAIL
    } : 'Configuration cachée en production'
  };
};

/**
 * Teste la connexion SMTP
 * @returns {Promise<Object>} - Résultat du test
 */
export const testSMTPConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Connexion SMTP réussie'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Échec de la connexion SMTP',
      error: error.message
    };
  }
};

/**
 * Envoie un email de test
 * @returns {Promise<Object>} - Résultat du test
 */
export const sendTestEmail = async () => {
  const testData = {
    name: 'Test LIMAJS MOTORS',
    email: SMTP_CONFIG.auth.user,
    phone: '+509 12 34 5678',
    message: 'Ceci est un message de test pour vérifier la configuration SMTP Gmail de LIMAJS MOTORS.'
  };

  try {
    const result = await sendContactEmail(testData);
    return {
      success: true,
      message: 'Email de test envoyé avec succès',
      result
    };
  } catch (error) {
    return {
      success: false,
      message: 'Échec de l\'envoi de l\'email de test',
      error: error.message
    };
  }
};

// Utilitaires supplémentaires
export const emailUtils = {
  formatHaitianPhone,
  escapeHtml,
  
  /**
   * Limite le nombre de tentatives par session
   */
  rateLimiter: (() => {
    const attempts = new Map();
    const LIMIT = 5; // 5 tentatives
    const WINDOW = 15 * 60 * 1000; // 15 minutes

    return {
      canSend: (identifier = 'default') => {
        const now = Date.now();
        const userAttempts = attempts.get(identifier) || [];
        
        // Nettoyer les anciennes tentatives
        const recentAttempts = userAttempts.filter(time => now - time < WINDOW);
        attempts.set(identifier, recentAttempts);
        
        return recentAttempts.length < LIMIT;
      },
      
      recordAttempt: (identifier = 'default') => {
        const userAttempts = attempts.get(identifier) || [];
        userAttempts.push(Date.now());
        attempts.set(identifier, userAttempts);
      },
      
      getRemainingTime: (identifier = 'default') => {
        const userAttempts = attempts.get(identifier) || [];
        if (userAttempts.length === 0) return 0;
        
        const oldestAttempt = Math.min(...userAttempts);
        const timeLeft = WINDOW - (Date.now() - oldestAttempt);
        
        return Math.max(0, Math.ceil(timeLeft / 1000 / 60)); // en minutes
      }
    };
  })()
};

export default {
  sendContactEmail,
  validateContactData,
  checkSMTPConfig,
  testSMTPConnection,
  sendTestEmail,
  emailUtils
};