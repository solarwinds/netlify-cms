import { NetlifyCmsApp as CMS } from 'netlify-cms-app/dist/esm';
import cloudinary from 'netlify-cms-media-library-cloudinary';
import googleDrive from 'netlify-cms-media-library-google-drive';
import uploadcare from 'netlify-cms-media-library-uploadcare';

CMS.registerMediaLibrary(cloudinary);
CMS.registerMediaLibrary(googleDrive);
CMS.registerMediaLibrary(uploadcare);
