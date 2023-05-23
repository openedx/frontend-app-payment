import React from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash.camelcase';

import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';
/**
 * MicroMasters
 * MicroBachelors
 * XSeries
 * Professional Program
 * Professional Certificate
 * Masters
 * */
const messages = defineMessages({
  'subscription.details.program.type.microMasters': {
    id: 'subscription.details.program.type.microMasters',
    defaultMessage: 'MicroMasters',
    description: 'Label to render the MicroMasters Certificate program type.',
  },
  'subscription.details.program.type.microBachelors': {
    id: 'subscription.details.program.type.microBachelors',
    defaultMessage: 'MicroBachelors',
    description: 'Label to render the MicroBachelors Certificate program type.',
  },
  'subscription.details.program.type.xSeries': {
    id: 'subscription.details.program.type.xSeries',
    defaultMessage: 'XSeries',
    description: 'Label to render the XSeries Certificate program type.',
  },
  'subscription.details.program.type.professionalProgram': {
    id: 'subscription.details.program.type.professionalProgram',
    defaultMessage: 'Professional Program',
    description: 'Label to render the Professional Program Certificate type.',
  },
  'subscription.details.program.type.professionalCertificate': {
    id: 'subscription.details.program.type.professionalCertificate',
    defaultMessage: 'Professional Certificate',
    description: 'Label to render the Professional Certificate Certificate program type.',
  },
  'subscription.details.program.type.masters': {
    id: 'subscription.details.program.type.masters',
    defaultMessage: 'Masters',
    description: 'Label to render the Masters Certificate program type.',
  },
});

export const ProgramType = ({ type }) => {
  const intl = useIntl();
  return (
    <h4 aria-level="2" className="mb-0">
      {
        intl.formatMessage(messages[`subscription.details.program.type.${camelCase(type)}`])
      }
    </h4>
  );
};

ProgramType.propTypes = {
  type: PropTypes.string,
};

ProgramType.defaultProps = {
  type: 'Professional Certificate',
};

export default ProgramType;
