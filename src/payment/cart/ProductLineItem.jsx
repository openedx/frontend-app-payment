import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';

class ProductLineItem extends React.PureComponent {
  getCookie(name) {
    const match = document.cookie.match(`${name}=([^;]*)`);
    return match ? match[1] : undefined;
  }

  getExcludedCourses() {
    return ['ccx-v1:HarvardX+MCB64.1x+2T2016+ccx@28', 'course-v1:HarvardX+1368x+1T2017', 'course-v1:HarvardX+1962USRx+3T2019', 'course-v1:HarvardX+1962USRx+3T2020', 'course-v1:HarvardX+AESTHINT15+2T2020', 'course-v1:HarvardX+AP50+1516', 'course-v1:HarvardX+AP50x+2T2018', 'course-v1:HarvardX+ARP+3T2019', 'course-v1:HarvardX+AT1x+2T2020', 'course-v1:HarvardX+BokX+2T2019', 'course-v1:HarvardX+BUS5.1x+3T2017', 'course-v1:HarvardX+CalcAPL1x+2T2020', 'course-v1:HarvardX+CHA01+1T2020', 'course-v1:HarvardX+CHEM160.en.2x+1T2018', 'course-v1:HarvardX+CHEM160.en.3x+1T2018', 'course-v1:HarvardX+CHEM160es+1T2018', 'course-v1:HarvardX+ChinaPhil+2T2020', 'course-v1:HarvardX+CHNSLITx+1T2020', 'course-v1:HarvardX+CIV101+2T2021', 'course-v1:HarvardX+COV19x+1T2020', 'course-v1:HarvardX+CS50+Business', 'course-v1:HarvardX+CS50+Technology', 'course-v1:HarvardX+CS50+X', 'course-v1:HarvardX+CS50AI+1T2020', 'course-v1:HarvardX+CS50AI+AI', 'course-v1:HarvardX+CS50B+Business', 'course-v1:HarvardX+CS50DM+2T2019', 'course-v1:HarvardX+CS50DM+DigitalMedia', 'course-v1:HarvardX+CS50DM+Media', 'course-v1:HarvardX+CS50G+Games', 'course-v1:HarvardX+CS50L+1T2019', 'course-v1:HarvardX+CS50L+Law', 'course-v1:HarvardX+CS50T+Technology', 'course-v1:HarvardX+CS50W+1T2018', 'course-v1:HarvardX+CS50W+Web', 'course-v1:HarvardX+DH102+1T2050', 'course-v1:HarvardX+DigHum_01+1T2020', 'course-v1:HarvardX+ECD01+3T2020', 'course-v1:HarvardX+EEEA+2T2020', 'course-v1:HarvardX+EMC2x+2T2020', 'course-v1:HarvardX+ENGSCI137x+2T2020', 'course-v1:HarvardX+EP001+1T2020', 'course-v1:HarvardX+ER22.1x+1T2020', 'course-v1:HarvardX+ER22.1x+1T2021', 'course-v1:HarvardX+ER22.1x+2T2020', 'course-v1:HarvardX+ER22.1x+2T2021', 'course-v1:HarvardX+ER22.1x+3T2020', 'course-v1:HarvardX+FC1x+1T2020', 'course-v1:HarvardX+FOX+2T2019', 'course-v1:HarvardX+FXB001+2T2020', 'course-v1:HarvardX+FXB001+3T2019', 'course-v1:HarvardX+GIZA+2T2020', 'course-v1:HarvardX+GIZA+2T2020a', 'course-v1:HarvardX+GSD1x+1T2020', 'course-v1:HarvardX+GSD1x+1T2021', 'course-v1:HarvardX+GSD1x+1T2022', 'course-v1:HarvardX+GSD1x+2T2019', 'course-v1:HarvardX+GSD1x+3T2020', 'course-v1:HarvardX+GSE2x+2T2020', 'course-v1:HarvardX+GSE2x+3T2019', 'course-v1:HarvardX+GSE3x+2T2020', 'course-v1:HarvardX+GSE3x+3T2019', 'course-v1:HarvardX+GSE4x+1T2020', 'course-v1:HarvardX+GSE4x+2T2020', 'course-v1:HarvardX+HDS2825x+1T2019', 'course-v1:HarvardX+HDS2825x+1T2020', 'course-v1:HarvardX+HDS2825x+3T2017', 'course-v1:HarvardX+HDS3221.1x+1T2018', 'course-v1:HarvardX+HDS3221.1x+1T2019', 'course-v1:HarvardX+HDS3221.1x+3T2020', 'course-v1:HarvardX+HDS3221.2x+1T2018', 'course-v1:HarvardX+HDS3221.2x+2T2019', 'course-v1:HarvardX+HDS3221.2x+3T2020', 'course-v1:HarvardX+HDS3221.3x+1T2018', 'course-v1:HarvardX+HDS3221.3x+1T2019', 'course-v1:HarvardX+HDS3221.3x+3T2020', 'course-v1:HarvardX+HDS3221.4x+1T2018', 'course-v1:HarvardX+HDS3221.4x+1T2019', 'course-v1:HarvardX+HDS3221.4x+3T2020', 'course-v1:HarvardX+HDS3221.5x+1T2018', 'course-v1:HarvardX+HDS3221.5x+2T2019', 'course-v1:HarvardX+HDS3221.5x+3T2020', 'course-v1:HarvardX+HDS3221.6x+2T2018', 'course-v1:HarvardX+HDS3221.6x+2T2019', 'course-v1:HarvardX+HDS3221.6x+3T2020', 'course-v1:HarvardX+HDS3221.7x+1T2018', 'course-v1:HarvardX+HDS3221.7x+2T2019', 'course-v1:HarvardX+HDS3221.7x+3T2020', 'course-v1:HarvardX+HDS99.1x+1T2016', 'course-v1:HarvardX+HHP100+1T2020', 'course-v1:HarvardX+HKS101A_1+2T2019', 'course-v1:HarvardX+HKS101A_1+2T2020', 'course-v1:HarvardX+HKS101A_2+2T2019', 'course-v1:HarvardX+HKS101A_2+2T2020', 'course-v1:HarvardX+HKS101A_3+2T2019', 'course-v1:HarvardX+HKS101A_3+2T2020', 'course-v1:HarvardX+HKS101A_4+2T2019', 'course-v1:HarvardX+HKS101A_4+2T2020', 'course-v1:HarvardX+HLS0ax+2T2020', 'course-v1:Harvardx+HLS2X+1T2020a', 'course-v1:Harvardx+HLS2X+3T2020', 'course-v1:HarvardX+HLS3x+1T2018', 'course-v1:HarvardX+HLS4X+2T2019', 'course-v1:HarvardX+HLS4X+2T2020', 'course-v1:HarvardX+Hum1-10x+3T2019', 'course-v1:HarvardX+HUM1.10x+1T2020', 'course-v1:HarvardX+HUM1.10x+3T2017', 'course-v1:HarvardX+HUM12.1x+1T2020', 'course-v1:HarvardX+HUM12.2x+1T2020', 'course-v1:HarvardX+HUM12x+1T2020', 'course-v1:HarvardX+HUM2x+1T2020', 'course-v1:HarvardX+HUM2x+2T2020', 'course-v1:HarvardX+Hum3.0x+1T2020', 'course-v1:HarvardX+Hum3.1x+1T2020', 'course-v1:HarvardX+Hum3.1x+3T2016', 'course-v1:HarvardX+Hum3.2x+2T2020', 'course-v1:HarvardX+Hum3.3x+2T2020', 'course-v1:HarvardX+HX102+3T2018', 'course-v1:HarvardX+HX205+1T2019', 'course-v1:HarvardX+LBTechX1+1T2020', 'course-v1:HarvardX+LEAD1x+1T2020a', 'course-v1:HarvardX+LTL1x+1T2019', 'course-v1:harvardx+MCB63X+1T2020', 'course-v1:HarvardX+MCB64.1x+2T2020', 'course-v1:HarvardX+MCB80.1x+2T2020', 'course-v1:HarvardX+MCB80.1x+3T2019', 'course-v1:HarvardX+MCB80.2x+2T2020', 'course-v1:HarvardX+MCB80.2x+3T2019', 'course-v1:HarvardX+MCB80.3x+2T2020', 'course-v1:HarvardX+MCB80.3x+3T2019', 'course-v1:HarvardX+MMM+2T2020', 'course-v1:HarvardX+MUS24.1x+3T2019', 'course-v1:HarvardX+MUS24.2x+3T2019', 'course-v1:HarvardX+MUS24.3x+3T2019', 'course-v1:HarvardX+MUS24.4x+3T2019', 'course-v1:HarvardX+MUS24.5x+3T2019', 'course-v1:HarvardX+MUS24.6x+2T2019', 'course-v1:HarvardX+MUS24.6x+2T2020', 'course-v1:HarvardX+MUS24.7x+2T2019', 'course-v1:HarvardX+MUS24.7x+2T2020', 'course-v1:HarvardX+Newton101+1T2018', 'course-v1:HarvardX+PH125.1x+2T2020', 'course-v1:HarvardX+PH125.2x+2T2020', 'course-v1:HarvardX+PH125.3x+2T2020', 'course-v1:HarvardX+PH125.4x+2T2020', 'course-v1:HarvardX+PH125.5x+2T2020', 'course-v1:HarvardX+PH125.6x+2T2020', 'course-v1:HarvardX+PH125.7x+2T2020', 'course-v1:HarvardX+PH125.8x+2T2020', 'course-v1:HarvardX+PH125.9x+2T2020', 'course-v1:HarvardX+PH211x+1T2020', 'course-v1:HarvardX+PH278.Ax+1T2020', 'course-v1:HarvardX+PH278.Ax+3T2020', 'course-v1:HarvardX+PH425x+3T2019', 'course-v1:HarvardX+PH525.1x+1T2020', 'course-v1:HarvardX+PH525.1x+3T2020', 'course-v1:HarvardX+PH525.2x+1T2020', 'course-v1:HarvardX+PH525.2x+3T2020', 'course-v1:HarvardX+PH525.3x+1T2020', 'course-v1:HarvardX+PH525.3x+3T2020', 'course-v1:HarvardX+PH525.4x+1T2020', 'course-v1:HarvardX+PH525.4x+3T2020', 'course-v1:HarvardX+PH525.5x+1T2020', 'course-v1:HarvardX+PH525.5x+3T2019', 'course-v1:HarvardX+PH525.6x+1T2020', 'course-v1:HarvardX+PH525.6x+3T2019', 'course-v1:HarvardX+PH525.7x+1T2020', 'course-v1:HarvardX+PH525.7x+3T2019', 'course-v1:HarvardX+PH526x+1T2020', 'course-v1:HarvardX+PH526x+2T2020', 'course-v1:HarvardX+PH527x+1T2020', 'course-v1:HarvardX+PH555x+3T2019', 'course-v1:HarvardX+PH557x+3T2019', 'course-v1:HarvardX+PH557x+3T2020', 'course-v1:HarvardX+PH558x+2T2020', 'course-v1:HarvardX+PH558x+3T2020', 'course-v1:HarvardX+PH559x+2T2020', 'course-v1:HarvardX+PH559x+3T2019', 'course-v1:HarvardX+predv1+2015_T3', 'course-v1:HarvardX+PS11.1x+1T2019', 'course-v1:HarvardX+PXM101+1T2020', 'course-v1:HarvardX+QMB1+1T2020', 'course-v1:HarvardX+QMB1+2T2017', 'course-v1:HarvardX+QMB1+3T2017', 'course-v1:HarvardX+SKY101x+2T2020', 'course-v1:HarvardX+SKY101x+3T2019', 'course-v1:HarvardX+SOC1.jsx+2016', 'course-v1:HarvardX+SOC1.longx+1T2017', 'course-v1:HarvardX+SOC1.practx+1T2017', 'course-v1:HarvardX+SOC1.practx+1T2020', 'course-v1:HarvardX+SOC1.practx+2T2017', 'course-v1:HarvardX+SPU27.1x+3T2019', 'course-v1:HarvardX+SPU27.1x+3T2020', 'course-v1:HarvardX+SPU27.2x+2T2019', 'course-v1:HarvardX+SPU27.2x+3T2020', 'course-v1:HarvardX+SPU29x+3T2017', 'course-v1:HarvardX+STAT110x+2T2020', 'course-v1:HarvardX+SW12.1+1T2019a', 'course-v1:HarvardX+SW12.10x+2T2019', 'course-v1:HarvardX+SW12.2x+1T2019b', 'course-v1:HarvardX+SW12.3x+1T2019a', 'course-v1:HarvardX+SW12.4x+1T2019a', 'course-v1:HarvardX+SW12.5x+1T2019a', 'course-v1:HarvardX+SW12.6x+1T2019a', 'course-v1:HarvardX+SW12.7x+2T2019', 'course-v1:HarvardX+SW12.8x+1T2019b', 'course-v1:HarvardX+SW12.9x+2T2019', 'course-v1:HarvardX+SW25x+T32015', 'course-v1:HarvardX+SW25x.1+2T2020', 'course-v1:HarvardX+SW38+1T2019', 'course-v1:HarvardX+SW38+3T2019', 'course-v1:HarvardX+SW47x+1T2020', 'course-v1:HarvardX+SW47x+2T2019', 'course-v1:HarvardX+Urban101x+1T2020', 'course-v1:HarvardX+USW1920+2T2020', 'course-v1:HarvardX+USW1920+3T2019', 'course-v1:HarvardX+USW30x+1T2020', 'HarvardX/AI12.1x./2014_T3', 'HarvardX/CB22.2x/3T2014', 'HarvardX/HAA1x/1T2014', 'HarvardX/HLS1.1x/1T2014', 'HarvardX/HLS1xA/Copyright', 'HarvardX/HLS1xB/Copyright', 'HarvardX/HLS1xC/Copyright', 'HarvardX/HLS1xD/Copyright', 'HarvardX/MUS24x/1T2015', 'HarvardX/SPU17x/3T2013'];
  }

  getText(courseKey) {
    let text;
    const variation = this.getCookie('name_track_variation');
    const language = this.getCookie('prod-edx-language-preference');
    if (this.getExcludedCourses().indexOf(courseKey) > -1) {
      return null;
    }
    if (language === 'es-419') {
      if (variation === 'V1') {
        text = 'Opción de Logro';
      } else if (variation === 'V2') {
        text = 'Opción Ilimitada';
      } else if (variation === 'V3') {
        text = ' ';
      }
    } else if (variation === 'V1') {
      text = 'Unlimited Track';
    } else if (variation === 'V2') {
      text = 'Achieve Mode';
    } else if (variation === 'V3') {
      text = ' ';
    }
    return text;
  }

  renderEnrollmentCount(courseKey, enrollmentCountData) {
    const courseObj = enrollmentCountData.find(course => course.key === courseKey);
    if (courseObj) {
      const enrollmentCount = courseObj.enrollment_count;
      return (
        <p className="num-enrolled"><span className="font-weight-bold">{enrollmentCount}</span> already enrolled!</p>
      );
    }
    return null;
  }

  renderCertificateType(certificateType, courseKey) {
    const text = this.getText(courseKey);
    switch (certificateType) {
      case 'professional':
      case 'no-id-professional':
        return (
          <FormattedMessage
            id="payment.productlineitem.professional.certificate"
            defaultMessage="Professional Certificate"
            description="Course certificate type on product details section"
          />
        );
      case 'verified':
        if (text) {
          return (text);
        }
        return (
          <FormattedMessage
            id="payment.productlineitem.verified.certificate"
            defaultMessage="Verified Certificate"
            description="Course certificate type on product details section"
          />
        );
      case 'honor':
      case 'audit':
      default:
        return null;
    }
  }

  render() {
    const {
      isNumEnrolledExperiment,
      enrollmentCountData,
      imageUrl,
      title,
      certificateType,
      courseKey,
    } = this.props;

    return (
      <div className="row align-items-center mb-3">
        <div className="col-5">
          <div className="embed-responsive embed-responsive-16by9">
            <img className="img-thumbnail product-thumbnail" src={imageUrl} alt="" />
          </div>
        </div>
        <div className="col-7">
          <h6 className="m-0" aria-level="3">{title}</h6>
          <p className="m-0">{this.renderCertificateType(certificateType, courseKey)}</p>
          {isNumEnrolledExperiment
            ? this.renderEnrollmentCount(courseKey, enrollmentCountData) : null}
        </div>
      </div>
    );
  }
}

ProductLineItem.propTypes = {
  isNumEnrolledExperiment: PropTypes.bool,
  enrollmentCountData: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    enrollment_count: PropTypes.number,
  })),
  imageUrl: PropTypes.string,
  title: PropTypes.string,
  certificateType: PropTypes.oneOf(['audit', 'honor', 'verified', 'no-id-professional', 'professional', 'credit']),
  courseKey: PropTypes.string,
};

ProductLineItem.defaultProps = {
  isNumEnrolledExperiment: false,
  enrollmentCountData: null,
  certificateType: undefined,
  title: null,
  imageUrl: null,
  courseKey: null,
};

export default injectIntl(ProductLineItem);
