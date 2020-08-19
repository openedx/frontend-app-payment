import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import { DEFAULT_STATUS, STATUS_READY } from './constants';

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
    } else if (prevProps.disabled !== this.props.disabled) {
      this.field.update({
        disabled: this.props.disabled,
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
    return (
      <span>
        <label htmlFor={`${this.props.fieldType}-container`}>{this.props.label}</label>
        {this.props.helpText
          && (
            <>
              <span data-tip data-for={`${this.props.fieldType}Help`} className="ml-1">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </span>
              <ReactTooltip id={`${this.props.fieldType}Help`} place="bottom" effect="solid">
                {this.props.helpText}
              </ReactTooltip>
            </>
          )}
        <div id={`${this.props.fieldType}-container`} ref={this.element} />
        <div className="skeleton py-3" ref={this.loadingElement} />
        {!loading && <FontAwesomeIcon icon={faLock} className="lock-icon" />}
      </span>
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
};

FlexMicroformField.defaultProps = {
  microformStatus: DEFAULT_STATUS,
  onChange: null,
  helpText: null,
  disabled: false,
};

export default FlexMicroformField;
