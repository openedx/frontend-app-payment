import React, { Component } from 'react';
import { connect, Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Switch, Router } from 'react-router-dom';
import SiteHeader from '@edx/frontend-component-site-header';
import { IntlProvider, injectIntl, intlShape, getLocale, getMessages } from '@edx/frontend-i18n';
import { logInfo } from '@edx/frontend-logging';

import { ErrorBoundary, fetchUserAccount, utils } from '../common';
import { ConnectedPaymentPage } from '../payment';
import HeaderLogo from '../assets/logo.svg';
import messages from './App.messages';


function PageContent({
  configuration,
  username,
  avatar,
  intl,
}) {
  const userMenu = [
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}`,
      content: intl.formatMessage(messages['siteheader.user.menu.dashboard']),
    },
    {
      type: 'item',
      href: process.env.LOGOUT_URL,
      content: intl.formatMessage(messages['siteheader.user.menu.logout']),
    },
  ];
  const loggedOutItems = [
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/login`,
      content: intl.formatMessage(messages['siteheader.user.menu.login']),
    },
    {
      type: 'item',
      href: `${process.env.LMS_BASE_URL}/register`,
      content: intl.formatMessage(messages['siteheader.user.menu.register']),
    },
  ];

  return (
    <div id="app">
      <SiteHeader
        logo={HeaderLogo}
        loggedIn
        username={username}
        avatar={avatar}
        logoAltText={configuration.SITE_NAME}
        userMenu={userMenu}
        loggedOutItems={loggedOutItems}
      />
      <main>
        <Switch>
          <Route exact path="/" component={ConnectedPaymentPage} />
          <Route
            path="*"
            render={() => {
              logInfo(`Redirecting to ecommerce for path: ${global.location.pathname}`);
              // We want to redirect to ecommerce for all pages we don't know how to handle here.
              // This is intended as a stopgap until more permanent server-side logic can be put
              // in place.
              // More info here on why: https://openedx.atlassian.net/browse/ARCH-1074
              global.location.href = `${configuration.ECOMMERCE_BASE_URL}${global.location.pathname}${global.location.search}${global.location.hash}`;
              return null;
            }}
          />
        </Switch>
      </main>
    </div>
  );
}

PageContent.propTypes = {
  username: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  configuration: PropTypes.shape({
    SITE_NAME: PropTypes.string.isRequired,
    ECOMMERCE_BASE_URL: PropTypes.string.isRequired,
    MARKETING_SITE_BASE_URL: PropTypes.string.isRequired,
    SUPPORT_URL: PropTypes.string.isRequired,
    CONTACT_URL: PropTypes.string.isRequired,
    OPEN_SOURCE_URL: PropTypes.string.isRequired,
    TERMS_OF_SERVICE_URL: PropTypes.string.isRequired,
    PRIVACY_POLICY_URL: PropTypes.string.isRequired,
    FACEBOOK_URL: PropTypes.string.isRequired,
    TWITTER_URL: PropTypes.string.isRequired,
    YOU_TUBE_URL: PropTypes.string.isRequired,
    LINKED_IN_URL: PropTypes.string.isRequired,
    REDDIT_URL: PropTypes.string.isRequired,
    APPLE_APP_STORE_URL: PropTypes.string.isRequired,
    GOOGLE_PLAY_URL: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

PageContent.defaultProps = {
  avatar: null,
};

const IntlPageContent = injectIntl(PageContent);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasPreviouslyRendered: false,
    };
  }

  componentDidMount() {
    const { username } = this.props;
    this.props.fetchUserAccount(username);
  }

  render() {
    // Send performance event on initial render
    if (!this.state.hasPreviouslyRendered) {
      utils.markPerformanceIfAble('Payment app began painting');

      this.setState({
        hasPreviouslyRendered: true,
      });
    }

    return (
      <ErrorBoundary>
        <IntlProvider locale={getLocale()} messages={getMessages()}>
          <Provider store={this.props.store}>
            <Router history={this.props.history}>
              <IntlPageContent
                configuration={this.props.configuration}
                username={this.props.username}
                avatar={this.props.avatar}
              />
            </Router>
          </Provider>
        </IntlProvider>
      </ErrorBoundary>
    );
  }
}

App.propTypes = {
  fetchUserAccount: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  store: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
  configuration: PropTypes.shape({
    SITE_NAME: PropTypes.string.isRequired,
    MARKETING_SITE_BASE_URL: PropTypes.string.isRequired,
    SUPPORT_URL: PropTypes.string.isRequired,
    CONTACT_URL: PropTypes.string.isRequired,
    OPEN_SOURCE_URL: PropTypes.string.isRequired,
    TERMS_OF_SERVICE_URL: PropTypes.string.isRequired,
    PRIVACY_POLICY_URL: PropTypes.string.isRequired,
    FACEBOOK_URL: PropTypes.string.isRequired,
    TWITTER_URL: PropTypes.string.isRequired,
    YOU_TUBE_URL: PropTypes.string.isRequired,
    LINKED_IN_URL: PropTypes.string.isRequired,
    REDDIT_URL: PropTypes.string.isRequired,
    APPLE_APP_STORE_URL: PropTypes.string.isRequired,
    GOOGLE_PLAY_URL: PropTypes.string.isRequired,
  }).isRequired,
};

App.defaultProps = {
  avatar: null,
};

const mapStateToProps = state => ({
  username: state.authentication.username,
  configuration: state.configuration,
  avatar: state.userAccount.profileImage.hasImage
    ? state.userAccount.profileImage.imageUrlMedium
    : null,
});

export default connect(
  mapStateToProps,
  {
    fetchUserAccount,
  },
)(App);
