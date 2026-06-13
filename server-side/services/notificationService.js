const { google } = require('googleapis');
const config = require('../config/config');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.gmailClient = null;
    this._initEmailTransporter();
  }

  _initEmailTransporter() {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      if (clientId && clientSecret && refreshToken) {
        const oAuth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          'https://developers.google.com/oauthplayground'
        );

        oAuth2Client.setCredentials({ refresh_token: refreshToken });
        this.gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });
        logger.info('Gmail API client initialized successfully');
      } else {
        logger.warn('Google OAuth credentials not configured. Email notifications will be simulated.');
        this.gmailClient = null;
      }
    } catch (error) {
      logger.error(`Failed to initialize Gmail API client: ${error.message}`);
      this.gmailClient = null;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent) {
    try {
      if (this.gmailClient) {
        // Construct standard RFC 2822 email message
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
          `From: Breach Alert System <${process.env.GMAIL_USER || 'noreply@breachalert.com'}>`,
          `To: ${to}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${utf8Subject}`,
          '',
          htmlContent,
        ];
        const message = messageParts.join('\n');

        // The body needs to be base64url encoded for the Gmail API
        const encodedMessage = Buffer.from(message)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await this.gmailClient.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
          },
        });

        logger.info(`Email sent successfully to ${to} via Gmail API: ${response.data.id}`);
        return { success: true, messageId: response.data.id, method: 'gmail-api' };
      }

      // Simulated email for development
      logger.info(`[SIMULATED EMAIL] To: ${to}, Subject: ${subject}`);
      return {
        success: true,
        messageId: `simulated-${Date.now()}`,
        method: 'simulated',
        preview: { to, subject, bodyPreview: textContent ? textContent.substring(0, 200) : '' },
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendBreachAlertEmail(user, breach, analysis) {
    const subject = `🚨 [${analysis.severity}] Data Breach Alert: ${breach.name || 'Unknown Breach'}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: ${analysis.severity === 'CRITICAL' ? '#dc3545' : analysis.severity === 'HIGH' ? '#fd7e14' : '#ffc107'}; color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; }
          .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; background: rgba(255,255,255,0.2); margin-top: 8px; }
          .content { padding: 24px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #333; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
          .detail-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
          .detail-label { font-weight: 600; width: 140px; color: #666; }
          .detail-value { flex: 1; color: #333; }
          .risk-factor { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 8px 0; border-radius: 4px; }
          .risk-factor.critical { background: #f8d7da; border-left-color: #dc3545; }
          .action-item { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 10px; margin: 8px 0; border-radius: 4px; }
          .legal-notice { background: #e2e3e5; padding: 12px; border-radius: 4px; font-size: 13px; color: #383d41; margin-top: 16px; }
          .footer { background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #6c757d; }
          .btn { display: inline-block; padding: 10px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 8px 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Data Breach Alert</h1>
            <div class="severity-badge">${analysis.severity} SEVERITY</div>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>${analysis.summary || `A data breach has been detected that may affect your monitored identifiers.`}</p>
            
            <div class="section">
              <h2>Breach Details</h2>
              <div class="detail-row"><span class="detail-label">Breach Name:</span><span class="detail-value">${breach.name || 'Unknown'}</span></div>
              <div class="detail-row"><span class="detail-label">Domain:</span><span class="detail-value">${breach.domain || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${breach.breachDate ? new Date(breach.breachDate).toLocaleDateString('en-IN') : 'Unknown'}</span></div>
              <div class="detail-row"><span class="detail-label">Records Exposed:</span><span class="detail-value">${(breach.pwnCount || 0).toLocaleString('en-IN')}</span></div>
              <div class="detail-row"><span class="detail-label">Severity Score:</span><span class="detail-value">${analysis.severityScore}/100</span></div>
              <div class="detail-row"><span class="detail-label">Exposed Data:</span><span class="detail-value">${(breach.exposedData || breach.dataClasses || []).join(', ') || 'N/A'}</span></div>
            </div>

            ${analysis.riskFactors && analysis.riskFactors.length > 0 ? `
            <div class="section">
              <h2>Risk Factors</h2>
              ${analysis.riskFactors.slice(0, 3).map((rf) => `
                <div class="risk-factor ${rf.severity === 'CRITICAL' ? 'critical' : ''}">
                  <strong>${rf.type || rf.description}</strong>: ${rf.severity}
                  <br><em>Action: ${rf.description}</em>
                </div>
              `).join('')}
            </div>` : ''}

            <div class="section">
              <h2>Recommended Actions</h2>
              <div class="action-item">
                <strong>1.</strong> Change your password on the affected service immediately<br>
                <strong>2.</strong> Enable Two-Factor Authentication (2FA)<br>
                <strong>3.</strong> Check for password reuse on other accounts<br>
                <strong>4.</strong> Monitor your accounts for suspicious activity
              </div>
            </div>

            <div class="legal-notice">
              <strong>Legal Notice:</strong> Under the DPDP Act 2023 (India) and GDPR (EU), data breaches must be reported to authorities within 72 hours. 
              Under the IT Act 2000 Section 43A, organizations are liable for compensation if they fail to protect sensitive personal data.
              If you are in the US, CCPA provides rights to statutory damages of $100-$750 per consumer per incident.
            </div>
          </div>
          <div class="footer">
            <p>This is an automated alert from the Breach Alert System.</p>
            <p>If you believe you received this in error, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, htmlContent);
  }

  async sendSMS(phoneNumber, message) {
    try {
      if (!config.twilio.accountSid || config.twilio.accountSid.includes('your_')) {
        logger.info(`[SIMULATED SMS] To: ${phoneNumber}, Message: ${message.substring(0, 100)}`);
        return {
          success: true,
          method: 'simulated',
          to: phoneNumber,
          preview: message.substring(0, 160),
        };
      }

      // Real Twilio integration
      const twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
      const result = await twilioClient.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: phoneNumber,
      });

      logger.info(`SMS sent to ${phoneNumber}: SID ${result.sid}`);
      return { success: true, sid: result.sid, method: 'twilio' };
    } catch (error) {
      logger.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPushNotification(fcmTokens, title, body, data = {}) {
    try {
      if (!config.firebase.projectId || config.firebase.projectId.includes('your_')) {
        logger.info(`[SIMULATED PUSH] Tokens: ${fcmTokens.length}, Title: ${title}`);
        return {
          success: true,
          method: 'simulated',
          tokenCount: fcmTokens.length,
          preview: { title, body },
        };
      }

      // Real Firebase integration
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey,
          }),
        });
      }

      const message = {
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
      return {
        success: true,
        method: 'firebase',
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Failed to send push notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBreachAlert(user, breach, analysis, alert) {
    const results = {
      email: { sent: false },
      sms: { sent: false },
      push: { sent: false },
    };

    // Email notification
    if (user.alertPreferences?.email !== false) {
      const emailResult = await this.sendBreachAlertEmail(user, breach, analysis);
      results.email = { sent: emailResult.success, sentAt: new Date(), ...emailResult };
    }

    // SMS notification
    if (user.alertPreferences?.sms && user.phone) {
      const smsMessage = `[BREACH ALERT] ${analysis.severity}: ${breach.name || 'Unknown'} breach detected. ${(breach.pwnCount || 0).toLocaleString()} records exposed. Check your Breach Alert dashboard for details and recommended actions.`;
      const smsResult = await this.sendSMS(user.phone, smsMessage);
      results.sms = { sent: smsResult.success, sentAt: new Date(), ...smsResult };
    }

    // Push notification
    if (user.alertPreferences?.push && user.fcmTokens?.length > 0) {
      const pushResult = await this.sendPushNotification(
        user.fcmTokens,
        `🚨 ${analysis.severity} Breach: ${breach.name || 'Unknown'}`,
        analysis.summary ? analysis.summary.substring(0, 200) : 'A data breach has been detected affecting your monitored data.',
        { breachId: breach._id?.toString() || '', alertId: alert?._id?.toString() || '', severity: analysis.severity }
      );
      results.push = { sent: pushResult.success, sentAt: new Date(), ...pushResult };
    }

    return results;
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to the Breach Alert System';
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Welcome, ${user.name}! 🛡️</h1>
        <p>Thank you for joining the Breach Alert System. Your account is now active and ready to protect your digital identity.</p>
        <h2 style="color: #555;">Getting Started:</h2>
        <ol>
          <li><strong>Add Monitored Identifiers</strong> — Add your email addresses, domains, and phone numbers to monitor.</li>
          <li><strong>Configure Notifications</strong> — Set your preferred alert channels (email, SMS, push).</li>
          <li><strong>Review Dashboard</strong> — Check your risk score and any existing breaches.</li>
        </ol>
        <p>We continuously monitor dark web forums, paste sites, and breach databases to keep you informed.</p>
        <p style="color: #6c757d; font-size: 12px;">This is an automated message from the Breach Alert System.</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, htmlContent);
  }

  async sendWeeklyDigest(user, digestData) {
    const subject = `📊 Weekly Breach Digest — ${new Date().toLocaleDateString('en-IN')}`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Weekly Security Digest 📊</h1>
        <p>Hi ${user.name}, here's your weekly breach monitoring summary:</p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin-top: 0;">Summary</h3>
          <p>• Identifiers Monitored: <strong>${digestData.monitoredCount || 0}</strong></p>
          <p>• New Breaches Detected: <strong>${digestData.newBreaches || 0}</strong></p>
          <p>• Alerts Generated: <strong>${digestData.alertCount || 0}</strong></p>
          <p>• Overall Risk Level: <strong>${digestData.riskLevel || 'Low'}</strong></p>
        </div>
        ${digestData.newBreaches > 0 ? '<p style="color: #dc3545;"><strong>⚠️ New breaches were detected. Please review your dashboard.</strong></p>' : '<p style="color: #28a745;">✅ No new breaches detected this week.</p>'}
        <p style="color: #6c757d; font-size: 12px;">Breach Alert System — Protecting your digital identity.</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, htmlContent);
  }
}

module.exports = new NotificationService();
