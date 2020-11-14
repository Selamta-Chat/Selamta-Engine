import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Service from './service';
import LogoUploader from './component';

const PresentationUploaderContainer = props => (
  <LogoUploader {...props} />
);

export default withTracker(() => {
  const PRESENTATION_CONFIG = Meteor.settings.public.presentation;
  const currentPresentations = Service.getPresentations();
  const { dispatchDisableDownloadable, dispatchEnableDownloadable, dispatchTogglePresentationDownloadable } = Service;

  return {
    presentations: currentPresentations,
    defaultFileName: PRESENTATION_CONFIG.defaultPresentationFile,
    fileSizeMin: PRESENTATION_CONFIG.uploadSizeMin,
    fileSizeMax: PRESENTATION_CONFIG.uploadSizeMax,
    fileValidMimeTypes: PRESENTATION_CONFIG.uploadValidMimeTypes,
    handleSave: presentations => Service.persistPresentationChanges(
      currentPresentations,
      presentations,
      PRESENTATION_CONFIG.uploadEndpoint,
      'DEFAULT_PRESENTATION_POD',
    ),
    dispatchDisableDownloadable,
    dispatchEnableDownloadable,
    dispatchTogglePresentationDownloadable,
  };
})(PresentationUploaderContainer);
