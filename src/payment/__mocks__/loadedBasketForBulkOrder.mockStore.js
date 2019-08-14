module.exports = {
  authentication: {
    userId: 9,
    username: 'staff',
  },
  configuration: {
    VIEW_MY_RECORDS_URL: 'http://localhost:18150/records',
    ACCOUNT_SETTINGS_URL: 'http://localhost:18000/account/settings',
    LMS_BASE_URL: 'http://localhost:18000',
    SUPPORT_URL:'http://localhost:18000/support',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
    ECOMMERCE_BASE_URL: 'http://localhost:18130',
  },
  feedback: {
    byId: {},
    orderedIds: [],
  },
  userAccount: {
    loading: false,
    error: null,
    username: 'staff',
    email: 'staff@example.com',
    bio: null,
    name: null,
    country: null,
    socialLinks: null,
    profileImage: {
      imageUrlMedium: null,
      imageUrlLarge: null,
    },
    levelOfEducation: null,
  },
  payment: {
    basket: {
      loading: false,
      loaded: true,
      submitting: false,
      redirect: false,
      products: [
        {
          sku: '964EE4B',
          productType: 'Enrollment Code',
          title: 'Accessibility',
          courseKey: 'course-v1:ACCA+Test101+2017',
          certificateType: 'verified',
          imageUrl: 'https://stage-edxapp.edx-cdn.org/asset-v1:ACCA+Test101+2017+type@asset+block@images_course_image.jpg'
        }
      ],
      summaryPrice: 100,
      orderTotal: 100,
      messages: [
        {
          data: {
            courseAboutUrl: 'https://stage.edx.org/course/accessibility?utm_source=ecommerce_worker&utm_medium=affiliate_partner'
          },
          code: 'single-enrollment-code-warning',
          messageType: 'info'
        }
      ],
      showCouponForm: false,
      isFreeBasket: false,
      currency: 'USD',
      offers: [],
      summaryQuantity: 1,
      summarySubtotal: 100,
      summaryDiscounts: 0,
      coupons: [],
      basketId: 108252,
      orderType: 'Enrollment Code'
    },
    currency: {
      currencyCode: 'MXN',
      conversionRate: 19.092733
    }
  },
  i18n: {
    locale: 'en',
  },
};
