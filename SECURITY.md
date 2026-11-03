# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.1.x   | ✅ Yes    |
| 2.0.x   | ❌ No     |
| < 2.0   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability in Angel-Ai, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the maintainer at **Petermvita@hotmail.com** with:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. You will receive a response within 48 hours.
4. Once the vulnerability is confirmed and fixed, a security advisory will be published.

## Security Considerations

- API keys are stored locally in `settings.json` on the user's machine. They are never transmitted to any server other than the configured LLM provider.
- The app runs a local Express server on `localhost:4000`. This server is not exposed to the network.
- Screen capture data is processed locally and sent only to the configured LLM provider for analysis.
- No user data is collected or transmitted to Angel-Ai servers (there are none).
