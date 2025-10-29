/**
 * Google Drive Integration for Cloud Backup and Sync
 */

// Google Drive API configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Folder name for backups
const BACKUP_FOLDER_NAME = 'MemoriaVault_Backups';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize Google API
 */
export const initializeGoogleAPI = async () => {
  return new Promise((resolve, reject) => {
    if (gapiInited && gisInited) {
      resolve(true);
      return;
    }

    // Load gapi
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = async () => {
      await window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        if (gisInited) resolve(true);
      });
    };
    document.body.appendChild(script1);

    // Load gis
    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      if (gapiInited) resolve(true);
    };
    script2.onerror = reject;
    document.body.appendChild(script2);
  });
};

/**
 * Request access token
 */
export const requestAccessToken = () => {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(response);
      }
      localStorage.setItem('google_access_token', response.access_token);
      resolve(response.access_token);
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

/**
 * Sign out from Google
 */
export const signOut = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_backup_folder_id');
  }
};

/**
 * Check if user is signed in
 */
export const isSignedIn = () => {
  return window.gapi?.client?.getToken() !== null;
};

/**
 * Get or create backup folder
 */
export const getOrCreateBackupFolder = async () => {
  try {
    // Check if folder ID is cached
    const cachedFolderId = localStorage.getItem('google_backup_folder_id');
    if (cachedFolderId) {
      // Verify folder still exists
      try {
        await window.gapi.client.drive.files.get({
          fileId: cachedFolderId,
        });
        return cachedFolderId;
      } catch (error) {
        localStorage.removeItem('google_backup_folder_id');
      }
    }

    // Search for existing folder
    const response = await window.gapi.client.drive.files.list({
      q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.result.files.length > 0) {
      const folderId = response.result.files[0].id;
      localStorage.setItem('google_backup_folder_id', folderId);
      return folderId;
    }

    // Create new folder
    const fileMetadata = {
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    const folderId = folder.result.id;
    localStorage.setItem('google_backup_folder_id', folderId);
    return folderId;
  } catch (error) {
    console.error('Error getting/creating backup folder:', error);
    throw error;
  }
};

/**
 * Upload backup to Google Drive
 */
export const uploadBackup = async (data, fileName = null) => {
  try {
    const folderId = await getOrCreateBackupFolder();
    
    if (!fileName) {
      fileName = `memoria-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    }

    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer ' + window.gapi.client.getToken().access_token }),
      body: form,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading backup:', error);
    throw error;
  }
};

/**
 * List all backups
 */
export const listBackups = async () => {
  try {
    const folderId = await getOrCreateBackupFolder();

    const response = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, size)',
      orderBy: 'modifiedTime desc',
      spaces: 'drive',
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error listing backups:', error);
    throw error;
  }
};

/**
 * Download backup from Google Drive
 */
export const downloadBackup = async (fileId) => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    return JSON.parse(response.body);
  } catch (error) {
    console.error('Error downloading backup:', error);
    throw error;
  }
};

/**
 * Delete backup from Google Drive
 */
export const deleteBackup = async (fileId) => {
  try {
    await window.gapi.client.drive.files.delete({
      fileId: fileId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting backup:', error);
    throw error;
  }
};

/**
 * Get storage usage
 */
export const getStorageUsage = async () => {
  try {
    const response = await window.gapi.client.drive.about.get({
      fields: 'storageQuota',
    });

    const quota = response.result.storageQuota;
    return {
      limit: parseInt(quota.limit),
      usage: parseInt(quota.usage),
      usageInDrive: parseInt(quota.usageInDrive),
      usageInDriveTrash: parseInt(quota.usageInDriveTrash),
      percentUsed: ((parseInt(quota.usage) / parseInt(quota.limit)) * 100).toFixed(2),
    };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    throw error;
  }
};

/**
 * Auto-backup with schedule
 */
export const setupAutoBackup = (exportDataFn, intervalHours = 24) => {
  const lastBackup = localStorage.getItem('last_auto_backup');
  const now = Date.now();

  const performBackup = async () => {
    try {
      if (!isSignedIn()) return;

      const data = exportDataFn();
      await uploadBackup(data, `auto-backup-${new Date().toISOString()}.json`);
      localStorage.setItem('last_auto_backup', now.toString());
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
  };

  // Check if backup is needed
  if (!lastBackup || now - parseInt(lastBackup) > intervalHours * 60 * 60 * 1000) {
    performBackup();
  }

  // Schedule next backup
  const interval = setInterval(performBackup, intervalHours * 60 * 60 * 1000);

  return () => clearInterval(interval);
};
