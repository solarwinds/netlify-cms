/**
 * This module is currently concerned only with external media libraries
 * registered via `registerMediaLibrary`.
 */
import { once } from 'lodash';
import { getMediaLibrary } from 'Lib/registry';
import { getCurrentEntry, getCurrentRoute } from 'Lib/store';
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
    const mediaLibraryConfig = {
      ...state.config.get('media_library').toJS(),
      routing: {
        collectionSlugs: state.config.get('collections').toJS().map(coll => { return { name: coll.name, slug: coll.slug }}),
        getCurrentRoute: getCurrentRoute(store),
        getCurrentEntry: getCurrentEntry(store)
      }
    };
    initializeMediaLibrary(mediaLibraryName, mediaLibraryConfig);
  }
});
