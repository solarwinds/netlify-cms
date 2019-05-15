import { loadScript } from 'netlify-cms-lib-util';

const scriptSrc = 'https://apis.google.com/js/api.js?onload=onApiLoad';

const defaultConfig = {
  browse_view: true,
  upload_view: true,
  scope: 'https://www.googleapis.com/auth/drive',
  picker_title: 'Media'
};

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

async function processFile(url, data) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
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
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .enableFeature(google.picker.Feature.SUPPORT_DRIVES)
    .addView(browseView)
    .addView(uploadView)
    .build();
}

async function init({ options = {}, handleInsert } = {}) {
  const config = { ...defaultConfig, ...options.config };

  await loadScript(scriptSrc);
  await loadPicker();
  let authToken;
  if (config.auth_url) {
    let authRes = await getAuthToken(config.auth_url);
    authToken = authRes.token;
  } else {
    throw new Error('No auth URL provided');
  }

  let picker = {};
  const handlePickerAction = res => {
    console.log(options.routing.getCurrentRoute());
    console.log(options.routing.getCurrentEntry());
    if (res.viewToken[0] === 'upload') {
      let file = processFile(config.apps_script_url, {
        id: res.docs[0].id,
        name: res.docs[0].name
      });
      return handleInsert(file.description);
    }
    if (res.action === window.google.picker.Action.PICKED) {
      // TODO Add metadata in GAS function of full rel path for file
      return handleInsert(res.docs[0].description);
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