# Netlify CMS - Google Drive Media Library
Use Google Drive for your media library.

## Setup
You must set up a Google Cloud Project in the [Google Developer Console](https://console.developers.google.com/) that has the correct permissions to access the Drive API. You can find more info in the [Drive Picker docs](https://developers.google.com/picker/docs/#appreg).

## Configuration
Options from the config.yml file are accessible through the options object, passed in as the first argument to the `init` function. This assumes the user has set the following:

```yaml
media_library:
  name: google-drive
  config:
    config_option: config_value
```

### Available config

## Dev stuff
The init function takes in two arguments - an options object and a handleInsert function, which is a Redux dispatcher that accepts the URL to the file as an argument.

Media library methods are at `packages/netlify-cms-core/src/components/MediaLibrary/MediaLibrary.js`
App is registered at `packages/netlify-cms/src/media-libraries.js`
App's init is `packages/netlify-cms-core/src/mediaLibrary.js`

The store function - in the init file - is where we'll want to get the route, which could be stored in React in location, but we may need to use things from the config to bridge the gap.