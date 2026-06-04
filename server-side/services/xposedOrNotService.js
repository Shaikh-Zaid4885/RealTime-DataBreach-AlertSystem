const { XposedOrNot } = require('xposedornot');
const config = require('../config/config');
const logger = require('../utils/logger');
const encryptionService = require('./encryptionService');

/**
 * XposedOrNot Service — Uses the official `xposedornot` npm SDK
 * Endpoints handled by SDK:
 *   1. checkEmail(email)       → GET /v1/check-email/{email}
 *   2. getBreachAnalytics(email) → GET /v1/breach-analytics?email={email}
 *   3. checkPassword(password) → GET passwords.xposedornot.com/v1/pass/anon/{sha3_keccak512_first10}
 *   4. getBreaches()           → GET /v1/breaches
 *   5. checkDomain(domain)     → GET /v1/domain-breaches/{domain} (requires API key)
 */
class XposedOrNotService {
  constructor() {
    this.apiKey = config.xposedOrNot.apiKey;
    this.rateLimitMs = config.xposedOrNot.rateLimitMs || 1100;
    this.lastRequestTime = 0;

    // Initialize the official SDK
    this.xon = new XposedOrNot(this.apiKey || undefined);

    logger.info('XposedOrNot service initialized (official SDK)');
  }

  async _throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.rateLimitMs) {
      await new Promise((resolve) => setTimeout(resolve, this.rateLimitMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  // ─── 1. Check Email for Breaches ───────────────────────────
  async checkEmail(email) {
    try {
      await this._throttle();
      logger.info(`Checking email: ${encryptionService.maskEmail(email)}`);

      const response = await this.xon.checkEmail(email);

      const result = {
        email,
        isBreached: false,
        breaches: [],
        status: 'clean',
        checkedAt: new Date(),
        breachCount: 0,
      };

      // SDK returns: { email, found: true/false, breaches: ["Name1","Name2",...] }
      if (response && response.found && response.breaches && response.breaches.length > 0) {
        result.isBreached = true;
        result.status = 'breached';
        result.breaches = response.breaches.map((name) => ({
          name: typeof name === 'string' ? name : name.name || name,
          source: 'xposedornot',
        }));
        result.breachCount = result.breaches.length;
      }

      logger.info(`Email check: ${result.status} (${result.breachCount} breaches)`);
      return result;
    } catch (error) {
      // "Not found" is a valid clean result
      if (error.message && (error.message.includes('404') || error.message.includes('Not found'))) {
        logger.info(`Email clean: ${encryptionService.maskEmail(email)}`);
        return {
          email, isBreached: false, breaches: [], status: 'clean',
          checkedAt: new Date(), breachCount: 0,
        };
      }
      logger.error(`Email check failed: ${error.message}`);
      throw new Error(`Failed to check email: ${error.message}`);
    }
  }

  // ─── 2. Breach Analytics for Email ─────────────────────────
  async getBreachAnalytics(email) {
    try {
      await this._throttle();
      logger.info(`Fetching analytics: ${encryptionService.maskEmail(email)}`);

      const response = await this.xon.getBreachAnalytics(email);
      const data = response?.analytics || response;

      const analytics = {
        email,
        checkedAt: new Date(),
        breachesSummary: null,
        exposedBreaches: [],
        breachMetrics: null,
        exposedData: [],
        pastesSummary: null,
      };

      // Parse ExposedBreaches
      if (data && data.ExposedBreaches && data.ExposedBreaches.breaches_details) {
        analytics.exposedBreaches = data.ExposedBreaches.breaches_details.map((b) => ({
          breachId: b.breach || b.name || 'unknown',
          name: b.breach || b.name || 'Unknown Breach',
          domain: b.domain || '',
          breachDate: b.xposed_date || b.breachDate || null,
          addedDate: b.added_date || null,
          exposedRecords: parseInt(b.xposed_records, 10) || 0,
          exposedData: (b.xposed_data || b.dataclasses || '').split(';').filter(Boolean),
          industry: b.industry || 'Unknown',
          passwordRisk: b.password_risk || 'unknown',
          searchable: b.searchable === 'Yes',
          verified: b.verified === 'Yes',
          logo: b.logo || '',
          description: b.details || b.description || '',
        }));
      }

      if (data && data.BreachesSummary) {
        analytics.breachesSummary = {
          site: data.BreachesSummary.site || '',
          totalBreaches: parseInt(data.BreachesSummary.breaches_count, 10) || 0,
          firstBreach: data.BreachesSummary.first_breach || null,
          lastBreach: data.BreachesSummary.last_breach || null,
        };
      }

      if (data && data.BreachMetrics) analytics.breachMetrics = data.BreachMetrics;

      if (data && data.exposed_data) {
        analytics.exposedData = Array.isArray(data.exposed_data)
          ? data.exposed_data
          : (typeof data.exposed_data === 'string' ? data.exposed_data.split(';') : []);
      }

      if (data && data.PastesSummary) analytics.pastesSummary = data.PastesSummary;

      logger.info(`Analytics: ${analytics.exposedBreaches.length} breaches found`);
      return analytics;
    } catch (error) {
      if (error.message && (error.message.includes('404') || error.message.includes('Not found'))) {
        return {
          email, checkedAt: new Date(), breachesSummary: null,
          exposedBreaches: [], breachMetrics: null, exposedData: [], pastesSummary: null,
        };
      }
      logger.error(`Analytics failed: ${error.message}`);
      throw new Error(`Failed to fetch breach analytics: ${error.message}`);
    }
  }

  // ─── 3. Password Check (SHA3-Keccak-512, k-anonymity) ─────
  async checkPassword(password) {
    try {
      await this._throttle();
      logger.info('Checking password (k-anonymity)');

      const response = await this.xon.checkPassword(password);

      const result = {
        isCompromised: false,
        occurrences: 0,
        checkedAt: new Date(),
        riskLevel: 'safe',
      };

      // SDK returns: { SearchPassAnon: "..." } or { found: true/false }
      if (response && (response.found || response.isCompromised || response.SearchPassAnon)) {
        result.isCompromised = true;
        result.occurrences = response.count || response.occurrences || 1;
        result.riskLevel = result.occurrences > 100 ? 'critical'
          : result.occurrences > 10 ? 'high' : 'medium';
      }

      logger.info(`Password check: ${result.riskLevel}`);
      return result;
    } catch (error) {
      if (error.message && (error.message.includes('404') || error.message.includes('Not found'))) {
        return { isCompromised: false, occurrences: 0, checkedAt: new Date(), riskLevel: 'safe' };
      }
      logger.error('Password check failed:', error.message);
      throw new Error(`Failed to check password: ${error.message}`);
    }
  }

  // ─── 4. Get All Known Breaches ─────────────────────────────
  async getAllBreaches() {
    try {
      await this._throttle();
      logger.info('Fetching all known breaches');

      const response = await this.xon.getBreaches();

      let breaches = [];
      const rawData = response?.exposedBreaches || response;

      if (Array.isArray(rawData)) {
        breaches = rawData.map((b) => ({
          breachId: b.breachID || b.Name || b.name,
          name: b.Name || b.name || b.breachID,
          domain: b.Domain || b.domain || b.domain || '',
          breachDate: b.breachedDate || b.BreachDate || b.breachDate || null,
          addedDate: b.addedDate || b.AddedDate || null,
          pwnCount: parseInt(b.exposedRecords || b.PwnCount || b.records || 0, 10),
          dataClasses: b.exposedData || b.DataClasses || b.dataClasses || [],
          description: b.exposureDescription || b.Description || b.description || '',
          logoPath: b.logo || b.LogoPath || '',
          isVerified: b.verified !== undefined ? b.verified : (b.IsVerified || false),
          isSensitive: b.sensitive !== undefined ? b.sensitive : (b.IsSensitive || false),
        }));
      }

      logger.info(`Retrieved ${breaches.length} breaches`);
      return breaches;
    } catch (error) {
      logger.error('Fetch all breaches failed:', error.message);
      throw new Error(`Failed to fetch breaches: ${error.message}`);
    }
  }

  // ─── 5. Domain Breach Check (requires API key) ─────────────
  async checkDomain(domain) {
    try {
      await this._throttle();
      logger.info(`Checking domain: ${domain}`);

      if (!this.apiKey) {
        logger.warn('Domain check skipped — no API key');
        return {
          domain, isBreached: false, breaches: [], totalExposed: 0,
          checkedAt: new Date(), error: 'API key required for domain checks',
        };
      }

      const response = await this.xon.checkDomain(domain);

      const result = {
        domain,
        isBreached: false,
        breaches: [],
        totalExposed: 0,
        checkedAt: new Date(),
      };

      if (response && response.breaches) {
        result.isBreached = true;
        result.breaches = Array.isArray(response.breaches)
          ? response.breaches : [response.breaches];
        result.totalExposed = result.breaches.reduce((sum, b) => sum + (b.exposedRecords || 0), 0);
      }

      logger.info(`Domain: ${result.breaches.length} breaches for ${domain}`);
      return result;
    } catch (error) {
      if (error.message && (error.message.includes('404') || error.message.includes('Not found'))) {
        return { domain, isBreached: false, breaches: [], totalExposed: 0, checkedAt: new Date() };
      }
      if (error.message && error.message.includes('401')) {
        logger.error('Domain check: invalid API key');
        throw new Error('Domain breach check requires valid API key');
      }
      logger.error(`Domain check failed: ${error.message}`);
      throw new Error(`Failed to check domain: ${error.message}`);
    }
  }
}

module.exports = new XposedOrNotService();
