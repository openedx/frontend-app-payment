module.exports = {
  authentication: {
    userId: 9,
    username: 'staff'
  },
  configuration: {
    VIEW_MY_RECORDS_URL: 'http://localhost:18150/records',
    ACCOUNT_SETTINGS_URL: 'http://localhost:18000/account/settings',
    LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
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
      imageUrlLarge: null
    },
    levelOfEducation: null
  },
  payment: {
    loading: false,
    loadingError: null,
    showVoucherForm: false,
    paymentProviders: [
      {
        type: 'cybersource'
      },
      {
        type: 'paypal'
      }
    ],
    sdnCheck: true,
    products: [
      {
        imgUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
        name: 'Introduction to Happiness',
        seatType: 'verified-certificate'
      }
    ],
    voucher: {
      benefit: {
        type: 'Percentage',
        value: 20
      },
      code: 'SUMMER20'
    }
  },
  router: {
    location: {
      pathname: '/',
      search: '',
      hash: ''
    },
    action: 'POP'
  }
};
