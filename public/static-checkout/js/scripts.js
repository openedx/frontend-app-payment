const checkoutButton = document.querySelector('#place-order-button');
const couponButton = document.getElementById('coupon-button');
const userButton = document.querySelector('.user-button');
const countrySelect = document.getElementById('country');
let stateSelect = document.getElementById('state');

userButton.addEventListener('click', () => {
  document.querySelector('.dropdown-menu').classList.toggle('show');
});

window.onclick = function closeMenu(event) {
  if (!event.target.matches('.user-button')) {
    const dropdownMenu = document.getElementsByClassName('dropdown-menu');
    let i;
    for (i = 0; i < dropdownMenu.length; i += 1) {
      const open = dropdownMenu[i];
      if (open.classList.contains('show')) {
        open.classList.remove('show');
      }
    }
  }
};

const countryList = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CV: 'Cape Verde',
  KY: 'Cayman Islands',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos (Keeling) Islands',
  CO: 'Colombia',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'Congo, the Democratic Republic of the',
  CK: 'Cook Islands',
  CR: 'Costa Rica',
  CI: 'Cote D\'Ivoire',
  HR: 'Croatia',
  CU: 'Cuba',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  ET: 'Ethiopia',
  FK: 'Falkland Islands (Malvinas)',
  FO: 'Faroe Islands',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GF: 'French Guiana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam',
  GT: 'Guatemala',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard Island and Mcdonald Islands',
  VA: 'Holy See (Vatican City State)',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran, Islamic Republic of',
  IQ: 'Iraq',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'North Korea',
  KR: 'South Korea',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Lao People\'s Democratic Republic',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macao',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia, Federated States of',
  MD: 'Moldova, Republic of',
  MC: 'Monaco',
  MN: 'Mongolia',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  NC: 'New Caledonia',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MK: 'North Macedonia, Republic of',
  MP: 'Northern Mariana Islands',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestinian Territory, Occupied',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PN: 'Pitcairn',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  RE: 'Reunion',
  RO: 'Romania',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  SH: 'Saint Helena',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia and the South Sandwich Islands',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen',
  SZ: 'Swaziland',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TW: 'Taiwan',
  TJ: 'Tajikistan',
  TZ: 'Tanzania, United Republic of',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States of America',
  UM: 'United States Minor Outlying Islands',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela',
  VN: 'Viet Nam',
  VG: 'Virgin Islands, British',
  VI: 'Virgin Islands, U.S.',
  WF: 'Wallis and Futuna',
  EH: 'Western Sahara',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
  AX: 'Åland Islands',
  BQ: 'Bonaire, Sint Eustatius and Saba',
  CW: 'Curaçao',
  GG: 'Guernsey',
  IM: 'Isle of Man',
  JE: 'Jersey',
  ME: 'Montenegro',
  BL: 'Saint Barthélemy',
  MF: 'Saint Martin (French part)',
  RS: 'Serbia',
  SX: 'Sint Maarten (Dutch part)',
  SS: 'South Sudan',
  XK: 'Kosovo',
};

const countryStates = {
  CA: {
    AB: 'Alberta',
    BC: 'British Columbia',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador',
    NS: 'Nova Scotia',
    NT: 'Northwest Territories',
    NU: 'Nunavut',
    ON: 'Ontario',
    PE: 'Prince Edward Island',
    QC: 'Québec',
    SK: 'Saskatchewan',
    YT: 'Yukon',
  },
  US: {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    AA: 'Armed Forces Americas',
    AE: 'Armed Forces Europe',
    AP: 'Armed Forces Pacific',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District Of Columbia',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  },
};

function renderStates(country) {
  const states = Object.values(countryStates[country]);
  for (let i = 0; i < states.length; i += 1) {
    const state = document.createElement('option');
    state.innerHTML = states[i];
    stateSelect.appendChild(state);
  }
}

function renderCountryState() {
  const countries = Object.values(countryList);
  const countryCodes = Object.keys(countryList);
  for (let i = 0; i < countries.length; i += 1) {
    const country = document.createElement('option');
    country.value = countryCodes[i];
    country.innerHTML = countries[i];
    countrySelect.appendChild(country);
  }
  countrySelect.onchange = function getCountryStates() {
    let stateSelectHtml = document.createElement('div');
    stateSelectHtml.innerHTML = '<select id="state" name="state"><option value="" selected="selected">Choose state/province</option></select>';
    stateSelect.length = 1;
    if (!(countrySelect.value === 'CA' || countrySelect.value === 'US')) {
      stateSelectHtml = document.createElement('div');
      stateSelectHtml.innerHTML = '<input id="state" type="text" name="state">';
      stateSelect.parentNode.replaceChild(stateSelectHtml, stateSelect);
      stateSelect = document.getElementById('state');
    } else {
      stateSelect.parentNode.replaceChild(stateSelectHtml, stateSelect);
      stateSelect = document.getElementById('state');
      if (countrySelect.value === 'CA') {
        renderStates('CA');
      } else if (countrySelect.value === 'US') {
        renderStates('US');
      }
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderCountryState();
});

checkoutButton.addEventListener('click', (event) => {
  event.preventDefault();
  const formData = {
    paymentInformation: {
      card: {
        number: document.getElementById('cardnumber').value,
        expirationMonth: document.getElementById('cardmonth').value,
        expirationYear: document.getElementById('cardyear').value,
        securityCode: document.getElementById('cardcode').value,
      },
    },
    orderInformation: {
      amountDetails: {
        totalAmount: '145',
        currency: 'USD',
      },
      billTo: {
        firstName: document.getElementById('firstname').value,
        lastName: document.getElementById('lastname').value,
        address1: document.getElementById('address1').value,
        address2: document.getElementById('address2').value,
        locality: document.getElementById('city').value,
        administrativeArea: document.getElementById('state').value,
        postalCode: document.getElementById('zip').value,
        country: document.getElementById('country').value,
      },
    },
  };
  console.log('checkout clicked, formData:', formData);
});

couponButton.addEventListener('click', (event) => {
  event.preventDefault();
  const couponCode = document.getElementById('couponcode').value;
  const path = window.location.pathname;
  const sku = path.substring(path.lastIndexOf('/') + 1, path.length - 5);
  window.location.href = `https://www.ecommerce.edx.org/basket/add/?sku=${sku}&coupon=${couponCode}`;
});
