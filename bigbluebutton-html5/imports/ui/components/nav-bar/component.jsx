import React, { Component, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '../icon/component';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import SettingsDropdownContainer from './settings-dropdown/container';
import axios from 'axios';

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
  logoUpload: {
    id: 'app.logoUploder.title',
    description: 'title of the modal',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

class NavBar extends Component {
  constructor(props) {
    super(props);



    this.state = {
      encodedImage: ''
    };

 
    this.showUploadedLogo = this.showUploadedLogo.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
  }
  
 
  static handleToggleUserList() {
    Session.set(
      'openPanel',
      Session.get('openPanel') !== ''
        ? ''
        : 'userlist',
    );
    Session.set('idChatOpen', '');
  }


  // Do not make API call if the User has already downloaded the Logo
  showUploadedLogo() {
    var logo = localStorage.getItem('logo')
    console.log(typeof logo, '\n', logo)
    if (logo) {
      this.setState({ encodedImage: logo })
    } else {
      this.handleDownload();
    }

  }
  // Download the Logo image and store it in the Local storage 
  handleDownload() {
    // Get the Session Token from the current Url
    var url = window.location.href;
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    console.log('Download =>', params.sessionToken, typeof params.sessionToken)
    // Make an AJAX upload request using Axios 
    downloadedLogo = axios.post(`http://localhost:3030/api/imageProcessor/download/${params.sessionToken}`, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Access-Control-Allow-Origin": "*",
        "mode": "no-cors"
      }
    }).then(response => {
      const data = response.data;
      this.handleDownload();
      localStorage.setItem('logo', downloadedLogo)
      this.setState({ encodedImage: localStorage.getItem('logo') })

    }).catch((error) => console.log(error))
  }
  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }

  }


  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      hasUnreadMessages,
      isExpanded,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      amIModerator,
    } = this.props;
    const { encodedImage } = this.state;

    const toggleBtnClasses = {};

    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.top}>
          <div className={styles.left}>
            {!isExpanded ? null
              : <Icon iconName="left_arrow"
                className={styles.arrowLeft} />
            }
            <Button
              data-test="userListToggleButton"
              onClick={NavBar.handleToggleUserList}
              ghost
              circle
              hideLabel
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              className={cx(toggleBtnClasses)}
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
            />
            {isExpanded ? null
              : <Icon iconName="right_arrow" className={styles.arrowRight} />
            }


          </div>
          <Button
            className={cx(toggleBtnClasses)}
            label={intl.formatMessage(intlMessages.logoUpload)}
            size="sm"
            icon="upload"
            circle
            onClick={this.showUploadedLogo}
          />
          <div className={styles.logoImageContainer}>
            <img className={styles.logoImage} src={`data:image/png;base64,${encodedImage}`} alt="Logo" />
          </div>

          <span id="source"> </span>
          <div className={styles.center}>
            <h1 className={styles.presentationTitle}>{presentationTitle}</h1>

            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
            />
          </div>
          <div className={styles.right}>
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </div>
        </div>
        <div className={styles.bottom}>
          <TalkingIndicatorContainer amIModerator={amIModerator} />
        </div>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');

