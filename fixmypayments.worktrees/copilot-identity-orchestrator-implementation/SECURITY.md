# Security & Secrets Management

## ⚠️ CRITICAL: Exposed Credentials

**Status**: Your `.env` file was exposed in IDE selection on 2026-04-28.

**Affected Credentials**:
- ✗ Firebase API Key (public, but tied to your project)
- ✗ Firebase Admin SDK Private Key (CRITICAL — full RSA private key exposed)
- ✗ Firebase Client Email
- ✗ Firebase Project IDs
- ✗ Resend API Key
- ✗ Gmail email & app password
- ✗ Anthropic API Key (if filled)

## Required Actions (DO THIS IMMEDIATELY)

### 1. Rotate Firebase Credentials
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select your project `fixmypayments`
- [ ] **Service Accounts** → Delete old service account key, generate new one
- [ ] Copy new private key to your local `.env` file only
- [ ] Verify old key is deleted in Firebase Console

### 2. Rotate Resend API Key
- [ ] Go to [Resend API Keys](https://resend.com/api-keys)
- [ ] Delete old key `re_cyouiTri_9jJQbosfuS3a4U96aof3JFM6`
- [ ] Create new key, update `.env`

### 3. Rotate Gmail App Password
- [ ] Go to [Google Account Security](https://myaccount.google.com/security)
- [ ] Delete old app password `Ibaner@2006`
- [ ] Generate new app password from "App passwords" section
- [ ] Update `.env`

### 4. Rotate Anthropic API Key (if needed)
- [ ] Go to [Anthropic Console](https://console.anthropic.com/)
- [ ] Delete old key if exposed
- [ ] Create new API key, update `.env`

### 5. Clear Git History (if already committed)
```bash
# Check if .env was ever committed
git log --all --full-history -- .env

# If found, use git filter-repo to remove it
# (only if it's already in the repo)
# WARNING: This rewrites history and requires force push
# Consult your team before doing this
```

## Secrets Management Best Practices

### DO
- ✅ Keep `.env` in your local machine only
- ✅ Use `.env.example` template with placeholders (already created)
- ✅ Commit `.env.example`, never commit `.env`
- ✅ Rotate credentials regularly (quarterly minimum)
- ✅ Use different API keys for dev/staging/prod
- ✅ Monitor API key usage in respective dashboards
- ✅ Never paste credentials in chat/IDE screenshots/logs

### DON'T
- ✗ Don't commit `.env` files to git
- ✗ Don't share credentials via email/Slack
- ✗ Don't commit Firebase private keys
- ✗ Don't paste real API keys in documentation
- ✗ Don't use credentials in screenshots or terminal history
- ✗ Don't hardcode secrets in source code

## Environment Setup (For New Developers)

```bash
# 1. Clone the repository
git clone <repo-url>
cd fixmypayments

# 2. Copy the template
cp .env.example .env

# 3. Fill in your actual credentials (ask team lead for values)
# Edit .env with your API keys

# 4. Install and run
npm install
npm run dev
```

## Monitoring

- **Firebase**: Monitor admin SDK key usage in Console → Service Accounts → Activity
- **Resend**: Check Resend Dashboard → API Keys for usage metrics
- **Gmail**: Review Gmail account activity log
- **Anthropic**: Monitor API usage in Anthropic Console

## Incident Response

If you believe credentials have been further compromised:
1. **Immediately** rotate all keys (follow steps above)
2. **Delete** old API keys across all services
3. **Review** recent API activity logs for unauthorized usage
4. **Update** deployment environments with new credentials
5. **Monitor** for suspicious activity for 48 hours

## Reference

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Firebase Security Best Practices](https://firebase.google.com/support/privacy-and-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Last Updated**: 2026-04-28 (after credential exposure incident)
**Next Review**: 2026-07-28 (quarterly)
