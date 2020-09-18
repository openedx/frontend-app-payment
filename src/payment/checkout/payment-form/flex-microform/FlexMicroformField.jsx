import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import { DEFAULT_STATUS, STATUS_READY } from './constants';
import messages from '../PaymentForm.messages';

class FlexMicroformField extends React.Component {
  constructor(props) {
    super(props);

    this.field = null;
    this.element = React.createRef();
    this.loadingElement = React.createRef();
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    if (this.field === null) {
      this.initialize();
      return;
    }

    if (prevProps.disabled !== this.props.disabled) {
      this.field.update({
        disabled: this.props.disabled,
      });
    }

    if (prevProps.meta.error !== this.props.meta.error) {
      const errorMessage = messages[this.props.meta.error];
      const translatedMessage = errorMessage ? this.props.intl.formatMessage(errorMessage) : this.props.meta.error;
      this.field.update({
        description: translatedMessage,
      });
    }
  }

  initialize() {
    if (!window.microform || this.field !== null || this.props.microformStatus !== STATUS_READY) {
      return;
    }
    this.field = window.microform.createField(this.props.fieldType, {
      disabled: this.props.disabled,
    });
    this.loadingElement.current.className = 'd-none';
    this.field.load(this.element.current);
    if (this.props.onChange) {
      this.field.on('change', this.props.onChange);
    }
  }

  render() {
    const loading = this.field === null;
    const errorMessage = messages[this.props.meta.error];
    return (
      <>
        <span>
          <label htmlFor={this.props.id}>{this.props.label}</label>
          {this.props.helpText && (
            <>
              <span
                data-tip
                data-for={`${this.props.fieldType}Help`}
                className="ml-1"
              >
                <FontAwesomeIcon icon={faQuestionCircle} />
              </span>
              <ReactTooltip
                id={`${this.props.fieldType}Help`}
                place="bottom"
                effect="solid"
              >
                {this.props.helpText}
              </ReactTooltip>
            </>
          )}
          <div id={this.props.id} ref={this.element} />
          <div className="skeleton py-3" ref={this.loadingElement} />
          {!loading && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
        </span>

        {/* For screen readers, we inject the description into the iframe,
            so that aria-describedby is correct. So, we use aria-hidden
            to hide this version from screen readers.
        */}
        {this.props.meta.touched && this.props.meta.error && (
          <span
            id={`${this.props.id}-error`}
            className="text-danger"
            aria-hidden="true"
          >{errorMessage ? this.props.intl.formatMessage(errorMessage) : this.props.meta.error}
          </span>
        )}
      </>
    );
  }
}

FlexMicroformField.propTypes = {
  fieldType: PropTypes.string.isRequired,
  microformStatus: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  helpText: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  disabled: PropTypes.bool,
  id: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
};

FlexMicroformField.defaultProps = {
  microformStatus: DEFAULT_STATUS,
  onChange: null,
  helpText: null,
  disabled: false,
};

export default injectIntl(FlexMicroformField);
