# Winget Submission Guide for Owlet

This guide will help you submit Owlet to the Windows Package Manager (winget) repository.

## Benefits of Winget Distribution

- ✅ **No security warnings** - winget handles all security verification
- ✅ **Easy installation** - `winget install Owlet`
- ✅ **Automatic updates** - Built-in update system
- ✅ **Professional distribution** - Official Microsoft package manager

## Prerequisites

1. **Create GitHub Release** (if not already done):
   ```bash
   # First, build and create a proper release
   npm run dist
   ```

2. **Upload installer to GitHub Releases**:
   - Go to https://github.com/kashamalasha/nightscout-widget-electron/releases
   - Create a new release (v0.8.2-beta or higher)
   - Upload the `.exe` installer
   - Copy the download URL

3. **Get SHA256 hash** of the installer:
   ```powershell
   Get-FileHash -Algorithm SHA256 .\Owlet-0.8.2-beta-win-x64.exe
   ```

## Step-by-Step Submission Process

### Step 1: Update the Manifest

1. Edit `winget-manifest.yaml`
2. Update the `InstallerUrl` with your actual GitHub release URL
3. Update the `InstallerSha256` with the hash from above
4. Adjust version if needed

### Step 2: Create Fork and Submit

1. **Fork the winget-pkgs repository**:
   - Go to https://github.com/microsoft/winget-pkgs
   - Click "Fork"

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/winget-pkgs.git
   cd winget-pkgs
   ```

3. **Create the manifest directory**:
   ```bash
   cd manifests
   mkdir k\kashamalasha\Owlet
   cd k\kashamalasha\Owlet
   ```

4. **Copy your manifest**:
   ```bash
   cp C:\path\to\winget-manifest.yaml 0.8.2-beta.yaml
   ```

5. **Update the manifest** with correct SHA256 hash and URL

### Step 3: Test Locally

```powershell
# Test the manifest locally
winget validate --manifest winget-manifest.yaml
```

### Step 4: Submit PR

1. **Create a new branch**:
   ```bash
   git checkout -b add-owlet
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add Owlet v0.8.2-beta"
   git push origin add-owlet
   ```

3. **Create Pull Request**:
   - Go to https://github.com/microsoft/winget-pkgs
   - Click "New Pull Request"
   - Select "compare across forks"
   - Choose your fork and branch
   - Submit PR with description

### Step 5: Monitor PR

The winget-pkgs maintainers will:
- Review your manifest
- Test the installer
- Merge if approved
- Usually takes 1-3 days

## Manifest Structure Required by Winget

```yaml
PackageIdentifier: kashamalasha.Owlet
PackageVersion: 0.8.2-beta
DefaultLocale: en-US
Publisher: kashamalasha
PackageName: Owlet
PublisherUrl: https://github.com/kashamalasha
PackageUrl: https://github.com/kashamalasha/nightscout-widget-electron
License: AGPL-3.0
LicenseUrl: https://github.com/kashamalasha/nightscout-widget-electron/blob/main/LICENSE.md
Copyright: Copyright © 2024 Dmitry Burnyshev
CopyrightUrl: https://github.com/kashamalasha/nightscout-widget-electron
Author: Dmitry Burnyshev
AppMoniker: owlet
Tags:
  - diabetes
  - glucose
  - cgm
  - nightscout
  - health
  - medical
ShortDescription: A lightweight desktop widget for monitoring glucose levels through Nightscout.
Description: |
  Owlet is a cross-platform Electron widget application that displays sensor 
  glucose values (SGV) from Nightscout API in real-time. Perfect for Type 1 
  Diabetes management with features like trend arrows, customizable alert levels, 
  and always-on-top display.

Installers:
  - Type: exe
    Architecture: x64
    InstallerUrl: https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.8.2-beta/Owlet-0.8.2-beta-win-x64.exe
    InstallerSha256: YOUR_SHA256_HASH_HERE
    InstallerType: nsis
    InstallModes:
      - silent
      - interactive
    Commands:
      - owlet

InstallerSwitches:
  Silent: '/S'
  SilentWithProgress: '/S'
  Custom: '/D='

Repository: https://github.com/kashamalasha/nightscout-widget-electron
```

## Testing After Approval

Once your PR is merged, test the installation:

```powershell
# Search for Owlet
winget search owlet

# Install Owlet
winget install owlet

# Upgrade to latest version
winget upgrade owlet

# Uninstall if needed
winget uninstall owlet
```

## Troubleshooting

### Common Issues:

1. **Invalid manifest format**:
   - Validate with `winget validate --manifest`
   - Check YAML syntax

2. **Hash mismatch**:
   - Get correct SHA256 hash
   - Update manifest

3. **PR rejected**:
   - Check maintainer comments
   - Fix issues and resubmit

## Resources

- [Winget Documentation](https://learn.microsoft.com/en-us/windows/package-manager/winget/)
- [Winget-PKGS Repository](https://github.com/microsoft/winget-pkgs)
- [Submission Guidelines](https://github.com/microsoft/winget-pkgs#submitting-packages)
- [Manifest Reference](https://learn.microsoft.com/en-us/windows/package-manager/package/manifest)

## Notes

- The manifest provided is a template - update with actual values
- SHA256 hash must match your installer file exactly
- URL must point to a valid GitHub release
- Keep manifest in sync with GitHub releases

