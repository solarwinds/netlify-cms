/**
 * This module is currently concerned only with external media libraries
 * registered via `registerMediaLibrary`.
 */
import { once } from 'lodash';
import { getMediaLibrary } from 'Lib/registry';
import store from 'ReduxStore';
import { createMediaLibrary, insertMedia } from 'Actions/mediaLibrary';

const initializeMediaLibrary = once(async function initializeMediaLibrary(name, options) {
  const lib = getMediaLibrary(name);
  const handleInsert = url => store.dispatch(insertMedia(url));
  const instance = await lib.init({ options, handleInsert });
  store.dispatch(createMediaLibrary(instance));
});

store.subscribe(() => {
  const state = store.getState();
  const mediaLibraryName = state.config.getIn(['media_library', 'name']);
  if (mediaLibraryName && !state.mediaLibrary.get('externalLibrary')) {
    const mediaLibraryConfig = state.config.get('media_library').toJS();
    if (mediaLibraryConfig.config.enable_nested_folders) {
      mediaLibraryConfig.pathConstructor = {
        getCollectionFolder: (function(store) {
          return () => {
            const state = store.getState();
            const collectionName = state.entryDraft.get('entry').toJS().collection;
            const mediaSubfolder = state.collections.get(collectionName).toJS().media_subfolder || null;
            if (mediaSubfolder) {
              return mediaSubfolder;
            }
            return collectionName;
          }
        })(store)
      };
    }
    initializeMediaLibrary(mediaLibraryName, mediaLibraryConfig);
  }
});
