# Security Policy

## Implemented Security Measures

This project implements several security measures to protect user data and prevent abuse:

### 1. Input Sanitization
- All user inputs are validated and sanitized before processing
- Message content is limited to 2000 characters
- Special characters are properly escaped in database queries

### 2. SQL Injection Protection
- All database queries use parameterized statements via `@vercel/postgres`
- No string concatenation in SQL queries
- Input validation on all API endpoints

### 3. Rate Limiting
- **Chat API:** 10 requests per minute per session
- **Session API:** 20 requests per minute per IP
- Returns HTTP 429 (Too Many Requests) when limits exceeded

### 4. Environment Variable Protection
- All sensitive credentials stored in environment variables
- `.env` files excluded from version control via `.gitignore`
- No hardcoded API keys or secrets in codebase

### 5. Error Message Sanitization
- User-facing error messages don't expose sensitive information
- Stack traces and detailed errors logged server-side only
- Generic error messages returned to clients

### 6. HTTPS Enforcement
- All API requests use HTTPS in production (via Vercel)
- Secure headers configured in Next.js

### 7. CORS Configuration
- API endpoints restricted to same-origin requests by default
- Custom CORS headers can be configured if needed

### 8. Session Security
- Session IDs generated using `crypto.randomUUID()`
- UUIDs provide cryptographically secure identifiers
- No predictable session identifiers

## Security Best Practices for Deployment

### Environment Variables
- **Never commit `.env.local` or `.env` files to version control**
- Rotate API keys immediately if accidentally exposed
- Use separate API keys for development and production
- Set strong, unique `SESSION_SECRET` for each environment

### API Keys
- **OpenAI API Key:** Keep secure, monitor usage regularly
- **Pinecone API Key:** Limit scope to necessary operations only
- **Database Credentials:** Use connection pooling, rotate passwords periodically

### Monitoring
- Monitor API usage for unusual patterns
- Set up alerts for rate limit violations
- Review logs regularly for suspicious activity
- Monitor OpenAI costs to detect abuse

### Database Security
- Use connection string with SSL (`sslmode=require`)
- Keep database credentials in environment variables only
- Regularly update database password
- Use read-only credentials where write access isn't needed

## Reporting a Vulnerability

If you discover a security vulnerability, please email the development team immediately:

**DO NOT** create a public GitHub issue for security vulnerabilities.

### What to Include
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if applicable)

### Response Time
- We aim to respond to security reports within 48 hours
- Critical vulnerabilities will be patched within 7 days
- You will be credited for responsible disclosure (if desired)

## Known Limitations

### 1. No Authentication System
- This is a demonstration application without user authentication
- In production, implement proper authentication (OAuth, JWT, etc.)
- Add authorization checks for all API endpoints

### 2. Single-User Design
- Currently designed for demo/single-user scenarios
- For multi-user production, add:
  - User authentication and authorization
  - Per-user rate limiting
  - User-specific data isolation

### 3. Client-Side Session Storage
- Sessions stored in browser localStorage
- For production, use secure, HTTP-only cookies
- Implement proper session expiration

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] All environment variables set in Vercel
- [ ] `.env` files not committed to Git
- [ ] Rate limiting enabled on all endpoints
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Error messages sanitized (no stack traces to users)
- [ ] Database credentials rotated from defaults
- [ ] API keys have appropriate scopes/limits
- [ ] Monitoring and alerting configured
- [ ] Security headers configured
- [ ] CORS properly configured for your domain

## Dependency Security

### Automated Updates
- Dependabot enabled for automated security updates
- Regular `npm audit` checks recommended

### Manual Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities (when available)
npm audit fix

# Update dependencies
npm update
```

## Compliance Notes

### Data Privacy
- User messages are stored in database (Neon Postgres)
- Messages sent to OpenAI for processing (see [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy))
- Implement appropriate data retention policies for production

### Content Filtering
- OpenAI API includes content moderation
- Consider additional client-side and server-side content filtering
- Log and review flagged content

## Updates to This Policy

This security policy will be updated as new security measures are implemented or vulnerabilities are discovered.

**Last Updated:** January 13, 2025

---

**Remember:** Security is an ongoing process, not a one-time task. Regularly review and update your security measures.
