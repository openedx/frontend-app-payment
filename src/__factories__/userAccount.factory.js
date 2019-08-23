import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

// Factory for the user account data for the userAccount reducer.
Factory.define('userAccount')
  .attrs({
    error: null,
    username: 'person',
    email: 'person@edx.org',
    bio: null,
    name: null,
    country: null,
    socialLinks: null,
    profileImage: {
      imageUrlMedium: 'http://localhost/image_medium.jpg',
      imageUrlLarge: 'http://localhost/image_large.jpg',
    },
    levelOfEducation: null,
  });
