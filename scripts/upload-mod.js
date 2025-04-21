#!/usr/bin/env node

/**
 * Upload Mod File Utility
 * 
 * This script helps upload mod files to the Supabase storage bucket
 * with the correct naming structure.
 * 
 * Usage: 
 *   node upload-mod.js <modId> <filePath> [version]
 * 
 * Example:
 *   node upload-mod.js vehicle-protection ./mods/vehicle-protection.zip 1.0.2
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Process command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node upload-mod.js <modId> <filePath> [version]');
  console.error('Example: node upload-mod.js vehicle-protection ./mods/vehicle-protection.zip 1.0.2');
  process.exit(1);
}

const modId = args[0];
const filePath = args[1];
const version = args[2] || 'latest';

// Validate that the file exists
if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

async function uploadMod() {
  try {
    console.log(`Starting upload for mod: ${modId}`);
    
    // Read file content
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    
    // Create storage paths
    const versionedPath = `${modId}/${modId}-v${version}${fileExt}`;
    const latestPath = `${modId}/${modId}-latest${fileExt}`;
    
    // Upload the file with version
    console.log(`Uploading to: ${versionedPath}`);
    const { data: versionedData, error: versionedError } = await supabase.storage
      .from('mods')
      .upload(versionedPath, fileBuffer, {
        contentType: 'application/zip',
        upsert: true
      });
    
    if (versionedError) {
      console.error('Error uploading versioned file:', versionedError.message);
      process.exit(1);
    }
    
    console.log(`Versioned file uploaded successfully: ${versionedPath}`);
    
    // Also upload as latest version
    console.log(`Uploading to: ${latestPath}`);
    const { data: latestData, error: latestError } = await supabase.storage
      .from('mods')
      .upload(latestPath, fileBuffer, {
        contentType: 'application/zip',
        upsert: true
      });
    
    if (latestError) {
      console.error('Error uploading latest file:', latestError.message);
      process.exit(1);
    }
    
    console.log(`Latest file uploaded successfully: ${latestPath}`);
    
    // Output success message with links
    console.log('\nUpload Complete!');
    console.log('--------------------------------------------------');
    console.log(`Mod: ${modId}`);
    console.log(`Version: ${version}`);
    console.log(`Storage Path (versioned): ${versionedPath}`);
    console.log(`Storage Path (latest): ${latestPath}`);
    console.log('--------------------------------------------------');
    console.log(`✓ Files are now available to users who purchased this mod`);
    
  } catch (error) {
    console.error('Unexpected error during upload:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadMod(); 