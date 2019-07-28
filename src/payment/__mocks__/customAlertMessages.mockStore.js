module.exports = {
  authentication: {
    userId: 9,
    username: 'staff'
  },
  configuration: {
    VIEW_MY_RECORDS_URL: 'http://localhost:18150/records',
    ACCOUNT_SETTINGS_URL: 'http://localhost:18000/account/settings',
    LMS_BASE_URL: 'http://localhost:18000',
    SUPPORT_URL:'http://localhost:18000/support',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
    ECOMMERCE_BASE_URL: 'http://localhost:18130',
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
      imageUrlLarge: null
    },
    levelOfEducation: null
  },
  payment: {
    basket: {
      loading: false,
      couponLoading: false,
      products: [
        {
          sku: 'EA280E8',
          imageUrl: 'https://stage-edxapp.edx-cdn.org/asset-v1:edx+H100+2018+type@asset+block@images_course_image.jpg',
          certificateType: 'verified',
          productType: 'Seat',
          title: 'Introduction to Happiness'
        }
      ],
      loaded: true,
      summaryPrice: 100,
      orderTotal: 50,
      messages: [
        {
          messageType: 'info',
          userMessage: 'Coupon code \'HAPPY\' added to basket.'
        },
        {
          code: 'single-enrollment-code-warning',
          messageType: 'info',
          data: {
            courseAboutUrl: 'http://edx.org'
          }
        }
      ],
      showCouponForm: true,
      isFreeBasket: false,
      currency: 'USD',
      offers: [
        {
          benefitValue: 50,
          benefitType: 'Percentage',
          provider: 'Pied Piper'
        }
      ],
      switchMessage: 'Click here to purchase multiple seats in this course',
      summaryDiscounts: 50,
      coupons: [],
      basketId: 103676
    },
    currency: {},
  },
  feedback: {
    byId: {
      '0': {
        id: 0,
        userMessage: 'Coupon code \'HAPPY\' added to basket.',
        messageType: 'info',
        fieldName: null
      },
      '1': {
        id: 1,
        code: 'single-enrollment-code-warning',
        data: {
          courseAboutUrl: 'http://edx.org'
        },
        messageType: 'info',
        fieldName: null
      }
    },
    orderedIds: [
      0,
      1
    ]
  },
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: ''
    },
    action: 'POP'
  },
  i18n: {
    locale: 'en'
  }
};
