import { loadScript } from 'netlify-cms-lib-util';

const gapiScript = 'https://apis.google.com/js/api.js?onload=onApiLoad';

const defaultConfig = {
  browse_view: true,
  upload_view: true,
  scope: 'https://www.googleapis.com/auth/drive.file',
  picker_title: 'Media'
};

function isValidConfig(config) {
  let isValidConfig = true;
  if (!config.api_key) {
    console.error('[Error] Google Drive Media Library: No API key set in config.');
    isValidConfig = false;
  }
  if (!config.app_id) {
    console.error('[Error] Google Drive Media Library: No app id set in config.');
    isValidConfig = false;
  }
  if (!config.origin) {
    console.error('[Error] Google Drive Media Library: No origin URL set in config.');
    isValidConfig = false;
  }
  if (!config.auth_url && !config.client_id) {
    console.error('[Error] Google Drive Media Library: You must set either a client ID or an auth URL in config.');
    isValidConfig = false;
  }
  if (!config.post_upload_url) {
    console.error('[Error] Google Drive Media Library: No post-upload Apps Script URL set in config.');
    isValidConfig = false;
  }
  return isValidConfig;
}

function getAuthToken(url) {
  return fetch(url)
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        return {
          error: `Failed to retrieve an auth token`
        };
      }
    })
    .catch(error => {
      return {
        error
      };
    });
}

async function loadPicker() {
  return new Promise(resolve => {
    window.gapi.load('picker', () => {
      resolve();
    });
  });
}

async function loadAuth() {
  return new Promise(resolve => {
    window.gapi.load('auth', () => {
      resolve();
    });
  });
}

async function handleAuth(client_id, scope) {
  return new Promise((resolve, reject) => {
    window.gapi.auth.authorize({
      'client_id': client_id,
      'scope': scope,
      'immediate': false
    }, (res) => {
      if (res.error) {
        reject(res.error);
      }
      resolve(res);
    });
  });
}

async function processFile(url, data) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .then(res => {
      if (!res.ok) {
        return {
          error: 'There was a problem with the response from processing the file.'
        };
      }
      return res.json();
    });
}

function createPicker(google, config, token, handlePickerAction) {
  const browseView = new google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true)
    .setMode(google.picker.DocsViewMode.GRID);
  const uploadView = new google.picker.DocsUploadView();
  if (config.base_folder_id) {
    browseView.setParent(config.base_folder_id);
    uploadView.setParent(config.base_folder_id)
  }
  return new google.picker.PickerBuilder()
    .setAppId(config.app_id)
    .setOAuthToken(token)
    .setDeveloperKey(config.api_key)
    .setOrigin(config.origin)
    .setTitle(config.picker_title)
    .setCallback(handlePickerAction)
    .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
    .addView(browseView)
    .addView(uploadView)
    .build();
}

async function init({ options = {}, handleInsert } = {}) {
  const config = { ...defaultConfig, ...options.config };

  if (!isValidConfig(config) && !config.load_keys_with_auth) {
    throw new Error('[Error] Google Drive Media Library: Could not initiate because config data is incomplete.');
  }

  await loadScript(gapiScript);
  await loadPicker();

  let authToken;
  if (config.auth_url) {
    let authRes = await getAuthToken(config.auth_url);
    authToken = authRes.token;
  } else {
    await loadAuth();
    let authRes = await handleAuth(config.client_id, config.scope);
    authToken = authRes.access_token;
  }

  let picker = {};
  const handlePickerAction = res => {
    let file = res.docs ? res.docs[0] : null;
    if (res.viewToken && res.viewToken[0] === 'upload') {
      console.log('Uploading file');
      let newFile = {
        ...file,
        proxyUrl: null,
        relPath: null,
      };
      if (options.proxy_url) {
        newFile.proxyUrl = options.proxy_url;
      }
      if (config.enable_nested_folders) {
        newFile.relPath = options.pathConstructor.getCollectionFolder();
      }
      processFile(config.post_upload_url, newFile)
        .then(res => {
          console.log('Processed file');
          if (options.proxy_url) {
            return handleInsert(res.data.description);
          }
          return handleInsert(res.data.embeddable_url);
        })
        .catch(error => {
          console.error(error);
          return;
        });
    }
    if (res.action === window.google.picker.Action.PICKED) {
      if (options.proxy_url) {
        return handleInsert(file.description);
      }
      return handleInsert(file.embeddable_url);
    }
  }

  return {
    show: () => {
      picker = createPicker(window.google, config, authToken, handlePickerAction);
      picker.setVisible(true);
    },
    hide: () => {
      picker.setVisible(false);
      picker = {};
    },
    enableStandalone: () => true,
  }
}

const googleDriveMediaLibrary = { name: 'google-drive', init };

export const NetlifyCmsMediaLibraryGoogleDrive = googleDriveMediaLibrary;
export default googleDriveMediaLibrary;