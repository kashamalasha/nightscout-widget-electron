const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function(configuration) {
  const { path: filePath, hash } = configuration;
  
  console.log(`Signing ${filePath}...`);
  
  // Check if we have the necessary environment variables
  if (!process.env.CSC_LINK || !process.env.CSC_KEY_PASSWORD) {
    console.warn('⚠️  Code signing environment variables not found:');
    console.warn('   CSC_LINK: Path to certificate file');
    console.warn('   CSC_KEY_PASSWORD: Certificate password');
    console.warn('   Skipping code signing...');
    return;
  }
  
  try {
    // Use signtool.exe to sign the file
    const signToolPath = path.join(process.env.ProgramFiles || process.env['ProgramFiles(x86)'], 'Windows Kits', '10', 'bin', 'x64', 'signtool.exe');
    
    if (!fs.existsSync(signToolPath)) {
      console.warn('⚠️  SignTool not found at expected location. Please ensure Windows SDK is installed.');
      return;
    }
    
    const command = `"${signToolPath}" sign /f "${process.env.CSC_LINK}" /p "${process.env.CSC_KEY_PASSWORD}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 "${filePath}"`;
    
    console.log('Executing:', command.replace(process.env.CSC_KEY_PASSWORD, '***'));
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Successfully signed ${path.basename(filePath)}`);
  } catch (error) {
    console.error('❌ Code signing failed:', error.message);
    throw error;
  }
};
