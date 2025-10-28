# Windows Code Signing Setup Guide

This guide explains how to set up code signing for the Owlet Nightscout Widget to prevent Windows from marking it as suspicious.

## Overview

Code signing your Windows application provides:
- ✅ Eliminates "Unknown Publisher" warnings
- ✅ Prevents Windows Defender false positives
- ✅ Builds user trust and credibility
- ✅ Required for Windows Store distribution

## Option 1: Extended Validation (EV) Certificate (Recommended)

### Benefits:
- **Immediate trust** - No SmartScreen warnings
- **Hardware security** - Certificate stored on USB token
- **Best reputation** - Microsoft's preferred method

### Requirements:
- Valid business registration
- Hardware token (USB device) from certificate authority
- Windows SDK installed

### Certificate Providers:
- **DigiCert** - $400-600/year, most trusted
- **Sectigo** - $300-500/year, good reputation
- **GlobalSign** - $400-600/year, reliable
- **Entrust** - $400-600/year, enterprise-focused

### Setup Process:
1. Purchase EV certificate from provider
2. Complete identity verification
3. Receive hardware token via mail
4. Install certificate on token
5. Configure environment variables (see below)

## Option 2: Standard Code Signing Certificate

### Benefits:
- **Lower cost** - $100-300/year
- **Software-based** - No hardware token needed
- **Good for established apps** - Works well with reputation

### Limitations:
- May trigger SmartScreen warnings initially
- Requires building reputation over time
- Less secure than EV certificates

## Option 3: Azure Trusted Signing (Cloud-based)

### Benefits:
- **No hardware token** required
- **Cloud-based** signing
- **Microsoft's own service**

### Requirements:
- Azure subscription
- US or Canada residency
- Business verification

## Environment Variables Setup

Create a `.env` file in your project root or set these environment variables:

```bash
# For file-based certificate
CSC_LINK=C:\path\to\your\certificate.p12
CSC_KEY_PASSWORD=your_certificate_password

# For Azure Trusted Signing (alternative)
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
```

## Build Commands

### Development Build (Unsigned)
```bash
npm run pack
```

### Production Build (Signed)
```bash
# Set environment variables first
set CSC_LINK=C:\path\to\certificate.p12
set CSC_KEY_PASSWORD=your_password

# Then build
npm run dist
```

### Automated Build Script
Create `build-signed.bat`:
```batch
@echo off
set CSC_LINK=C:\path\to\your\certificate.p12
set CSC_KEY_PASSWORD=your_certificate_password
npm run dist
```

## Verification

After signing, verify your executable:
```bash
signtool verify /pa "dist\Owlet-0.8.2-beta-win-x64.exe"
```

## Troubleshooting

### Common Issues:

1. **"SignTool not found"**
   - Install Windows SDK
   - Add SDK bin directory to PATH

2. **"Certificate not found"**
   - Check CSC_LINK path
   - Verify certificate file exists

3. **"Invalid password"**
   - Double-check CSC_KEY_PASSWORD
   - Ensure no extra spaces/characters

4. **"Timestamp server error"**
   - Check internet connection
   - Try alternative timestamp server

### Alternative Timestamp Servers:
- `http://timestamp.digicert.com`
- `http://timestamp.sectigo.com`
- `http://timestamp.globalsign.com`

## Open Source Project Discounts

### 🆓 **Free/Discounted Options for Open Source Projects**

Many certificate authorities offer special pricing for open source projects:

#### **1. Educational/Non-Profit Discounts**
- **DigiCert**: Offers educational discounts (contact sales)
- **Sectigo**: Provides non-profit pricing (contact support)
- **GlobalSign**: Has educational programs available

#### **2. Budget-Friendly Providers**
- **SSL2BUY**: Code signing certificates starting at **$8/year**
- **CheapSSLWeb**: Affordable certificates from reputable CAs
- **SignMyCode**: Starting at **$215.99/year** for standard certificates

#### **3. Open Source Specific Programs**
- **Comodo**: Individual Code Signing Certificate at reduced rates
- **Some CAs**: Offer free trials for open source projects
- **Community initiatives**: Check Open Source Pledge programs

### **How to Apply for Discounts**

1. **Contact CA directly**:
   - Explain your open source project
   - Provide GitHub repository link
   - Show non-commercial use case
   - Request educational/non-profit pricing

2. **Documentation needed**:
   - Project description and goals
   - Repository URL
   - License type (MIT, GPL, etc.)
   - User base and impact

3. **Alternative approaches**:
   - Look for seasonal promotions (Black Friday, etc.)
   - Check startup perk programs
   - Consider community sponsorship

### **Specific to Nightscout Widget Project**

Since your project is:
- ✅ **Open source** (AGPL-3.0 license)
- ✅ **Health-focused** (diabetes management)
- ✅ **Non-commercial** (free application)
- ✅ **Community-driven** (GitHub hosted)

**Recommended approach**:
1. **Contact DigiCert** - Mention it's a health/medical open source project
2. **Try SSL2BUY** - $8/year option for basic signing
3. **Apply for non-profit pricing** - Emphasize the health benefits
4. **Consider community funding** - GitHub Sponsors or similar

**Sample email template**:
```
Subject: Code Signing Certificate Discount Request - Open Source Health Project

Dear [CA Name],

I'm developing an open source Electron application called "Owlet" 
that helps people with Type 1 Diabetes monitor their glucose levels 
through the Nightscout platform.

Project details:
- Repository: https://github.com/kashamalasha/nightscout-widget-electron
- License: AGPL-3.0 (open source)
- Purpose: Free diabetes management tool
- Users: People with T1D and their caregivers

Would you offer any discounts for open source health projects?

Best regards,
[Your name]
```

## Cost Comparison

| Option | Annual Cost | Trust Level | Setup Complexity | Open Source Discount |
|--------|-------------|-------------|-------------------|---------------------|
| EV Certificate | $400-600 | Highest | Medium | Contact CA for pricing |
| Standard Certificate | $100-300 | Good | Low | Available |
| Budget Providers | $8-220 | Good | Low | Built-in |
| Azure Trusted Signing | $200-400 | High | Medium | Check Azure programs |

## Alternative Approaches (No Certificate Required)

### 🚀 **Microsoft Store Distribution**
**Benefits:**
- ✅ **Zero security warnings** - Microsoft handles all signing
- ✅ **Automatic updates** - Built-in update mechanism
- ✅ **User trust** - Users trust Microsoft Store apps
- ✅ **No certificate needed** - Microsoft signs everything

**Requirements:**
- Microsoft Developer Account ($19 one-time fee)
- App must pass Microsoft certification
- Follow Microsoft Store policies
- Submit through Microsoft Partner Center

**Setup:**
```bash
# Add Microsoft Store target to package.json
"win": {
  "target": [
    "store"
  ]
}
```

### 📦 **Windows Package Manager (winget)**
**Benefits:**
- ✅ **Trusted distribution** - Microsoft's official package manager
- ✅ **No SmartScreen warnings** - winget handles security
- ✅ **Easy installation** - `winget install Owlet`
- ✅ **Automatic updates** - Built-in update system

**Requirements:**
- Submit manifest to winget-pkgs repository
- Follow winget packaging guidelines
- Community approval process

**Setup:**
1. Create manifest file (`manifest.yaml`)
2. Submit PR to winget-pkgs repository
3. Wait for community approval

### 🌐 **Reputation Building Strategy**
**How it works:**
- Windows tracks download counts and user behavior
- More downloads = higher reputation
- Eventually reduces/eliminates warnings

**Tactics:**
1. **GitHub Releases** - Use official GitHub releases
2. **Clear documentation** - Provide installation instructions
3. **User education** - Explain why warnings appear
4. **Community support** - Encourage user feedback
5. **Regular updates** - Keep app current

### 🔒 **Enhanced Security Practices**
**Electron Security Hardening:**
```javascript
// In main.js - Enhanced security
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // Disable Node.js in renderer
    contextIsolation: true,       // Enable context isolation
    enableRemoteModule: false,    // Disable remote module
    preload: path.join(__dirname, 'preload.js')
  }
});
```

**Additional Security Measures:**
- Use Content Security Policy (CSP)
- Validate all inputs
- Keep dependencies updated
- Use HTTPS for all network requests
- Implement proper error handling

### 📋 **User Education Approach**
**Create installation guide:**
```markdown
# Installation Guide

## Windows Security Warning

When you download Owlet, Windows may show a security warning because:
- The app is not yet widely distributed
- Windows protects users from unknown software

## How to Install Safely

1. Download from official GitHub releases
2. Right-click the installer → "Properties"
3. Check "Unblock" if present
4. Run installer as Administrator
5. Click "More info" → "Run anyway" if needed

## Why This Happens

This is normal for new applications. As more users install Owlet,
Windows will recognize it as safe software.
```

### 🎯 **Hybrid Approach (Recommended)**

**Phase 1: Immediate (No Certificate)**
1. **Distribute via GitHub Releases**
2. **Create detailed installation guide**
3. **Implement security hardening**
4. **Build user community**

**Phase 2: Medium-term**
1. **Submit to winget** (free, trusted)
2. **Apply for Microsoft Store** (if applicable)
3. **Build reputation through downloads**

**Phase 3: Long-term**
1. **Get budget certificate** ($8-50/year)
2. **Sign all releases**
3. **Maintain professional appearance**

### 📊 **Comparison of Approaches**

| Method | Cost | Setup Time | Trust Level | Maintenance |
|--------|------|------------|-------------|-------------|
| **Microsoft Store** | $19 one-time | Medium | Highest | Low |
| **winget** | Free | Low | High | Low |
| **Reputation Building** | Free | High | Medium | High |
| **Budget Certificate** | $8-50/year | Low | High | Low |
| **EV Certificate** | $400-600/year | Medium | Highest | Low |

## Next Steps

1. **Choose your approach** based on budget and timeline
2. **Start with reputation building** (immediate, free)
3. **Consider winget submission** (free, trusted)
4. **Plan for certificate** (when budget allows)
5. **Implement security hardening** (always recommended)

## Security Notes

- **Never commit** certificate files to version control
- **Use environment variables** for sensitive data
- **Store certificates securely** (hardware token recommended)
- **Rotate certificates** before expiration
- **Monitor certificate status** regularly

For questions or issues, refer to the [electron-builder documentation](https://www.electron.build/code-signing-win.html).
