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
    username: null,
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
      loaded: true,
      loading: false,
      isFreeBasket: false,
      showCouponForm: true,
      paymentProviders: [
        {
          type: 'cybersource',
        },
        {
          type: 'paypal',
        },
      ],
      orderTotal: 0,
      summaryDiscounts: 0,
      summaryPrice: 0,
      products: [],
      coupons: [
        {
          code: 'SUMMER20',
          id: 12345,
          benefitValue: '20%'
        }
      ],
      offers: [],
    },
    coupon: {
      benefitValue: null,
      code: null,
      id: null,
      error: null,
      loaded: false,
      loading: false,
    },
    currency: {},
  },
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
    action: 'POP',
  },
  i18n: {
    locale: 'en',
  },
};
