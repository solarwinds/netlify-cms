const getCurrentRoute = (store) => {
  return () => store.getState().routing;
};

const getCurrentEntry = (store) => {
  return () => store.getState().entryDraft;
}

export {
  getCurrentRoute,
  getCurrentEntry
}