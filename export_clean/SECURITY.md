# Security Policy

## ⚠️ Important Notice for Public Repositories

This repository is designed to be **public-safe**. However, you must follow these guidelines:

### 🔒 Never Commit Sensitive Data

- `.env` files with real credentials
- API keys (Stripe, Resend, LiveKit, etc.)
- Database connection strings with passwords
- JWT secrets
- Any personal or user data

### ✅ What's Safe to Commit

- `.env.example` files (with placeholder values only)
- Source code
- Documentation
- Configuration templates

### 🛡️ Before Each Commit

1. Check that `.gitignore` includes all `.env` files
2. Run: `git status` to verify no sensitive files are staged
3. Search for hardcoded secrets: `grep -r "sk_live\|password=" .`

### 📧 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email the maintainers privately
3. Allow time for a fix before public disclosure

### 🔐 Security Features Implemented

- Password hashing with bcrypt
- JWT tokens with expiration
- Input validation with Pydantic
- CORS protection
- Rate limiting (recommended to add)
- SQL injection prevention (MongoDB)

### 📋 Security Checklist for Deployment

- [ ] All `.env` files are in `.gitignore`
- [ ] Using HTTPS in production
- [ ] Strong JWT secret (min 32 chars)
- [ ] Database has authentication enabled
- [ ] Stripe using live keys only in production
- [ ] Regular dependency updates
