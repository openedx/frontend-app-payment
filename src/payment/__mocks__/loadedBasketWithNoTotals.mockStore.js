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
  },
  feedback: {
    byId: {},
    orderedIds: [],
  },
  userAccount: {
    loading: false,
    error: null,
    username: null,
    email: null,
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
      showCouponForm: false,
      paymentProviders: [
        {
          type: 'cybersource',
        },
        {
          type: 'paypal',
        },
      ],
      sdnCheck: true,
      products: [
        {
          imageUrl:
            'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
          title: 'Introduction to Happiness',
          certificateType: 'verified',
          productType: 'Seat',
          sku: '8CF08E5',
        },
      ],
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
