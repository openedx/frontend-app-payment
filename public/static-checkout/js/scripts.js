/* eslint-disable vars-on-top */
/* eslint-disable prefer-template */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-var */
var checkoutButton = document.getElementById('place-order-button');
var paypalButton = document.getElementById('submit-paypal');
var couponButton = document.getElementById('coupon-button');
var userButton = document.querySelector('.user-button');
var countrySelect = document.getElementById('country');
var stateSelect = document.getElementById('state');
var countryStates = {
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

var ecommerceBaseUrl;
if(window.location.hostname === "payment.edx.org"){
  ecommerceBaseUrl = "https://ecommerce.edx.org"
} else if(window.location.hostname === "payment.stage.edx.org"){
  ecommerceBaseUrl = "https://ecommerce.stage.edx.org"
} else if(window.location.hostname === "localhost"){
  ecommerceBaseUrl = "http://localhost:18130"
}

function getBasketId(){
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  // Emma: sql or other injection?
  var basketId = urlParams.get('basketId')
  // Emma: what if the basketId is not in the param?
  return basketId
}

function redirectToMFE(couponCode){
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var sku = urlParams.get('sku')
  var newUrl = ecommerceBaseUrl + '/basket/add/?sku=' + sku
  if(couponCode){
    newUrl = newUrl.concat('&coupon=',couponCode)
  }
  window.location.href = newUrl
}

userButton.addEventListener('click', function toggleUserDropdown() {
  document.querySelector('.dropdown-menu').classList.toggle('show');
}, false);

window.onclick = function closeMenu(event) {
  if (!event.target.matches('.user-button')) {
    var dropdownMenu = document.getElementsByClassName('dropdown-menu');
    var i;
    for (i = 0; i < dropdownMenu.length; i += 1) {
      var open = dropdownMenu[i];
      if (open.classList.contains('show')) {
        open.classList.remove('show');
      }
    }
  }
};

function renderStates(country) {
  var states = Object.values(countryStates[country]);
  for (var i = 0; i < states.length; i += 1) {
    var state = document.createElement('option');
    state.innerHTML = states[i];
    stateSelect.appendChild(state);
  }
}

function renderCountryState() {
  countrySelect.onchange = function getCountryStates() {
    var stateSelectHtml = document.createElement('div');
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

document.addEventListener('DOMContentLoaded', function handleCountrySelection() {
  renderCountryState();
});

checkoutButton.addEventListener('click', function handleSubmit(event) {
  event.preventDefault();
  var formData = {
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
}, false);

couponButton.addEventListener('click', function couponRedirectToMicrofrontend(event) {
  event.preventDefault();
  var couponCode = document.getElementById('couponcode').value;
  redirectToMFE(couponCode)
}, false);


function parse_cookies() {
  var cookies = {};
  if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach(function (c) {
          var m = c.trim().match(/(\w+)=(.*)/);
          if(m !== undefined) {
              cookies[m[1]] = decodeURIComponent(m[2]);
          }
      });
  }
  return cookies;
}

function disableForm(){
  var toDisable = document.querySelectorAll('input, select, button')
  Array.prototype.forEach.call(toDisable, function (elementToDisable) {
    elementToDisable.disabled = true;
  });
}

paypalButton.addEventListener('click', function submitPaypal(event){
  disableForm()
  var cookies = parse_cookies();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", ecommerceBaseUrl + "/api/v2/checkout/", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('X-CSRFToken', cookies['csrftoken']); 
  xhr.setRequestHeader('USE-JWT-COOKIE', true); 
  xhr.withCredentials = true
  xhr.onreadystatechange = function() { 
    if (this.readyState === XMLHttpRequest.DONE){
      if(this.status === 200) {
        var form = document.createElement("form");
        form.method = "POST";
        form.action = JSON.parse(this.response).payment_page_url
        document.body.appendChild(form);
        form.submit();
      } else {
        redirectToMFE();
      }
    }
  }
  var basket_id = getBasketId()
  xhr.send(JSON.stringify({
    basket_id: basket_id,
    payment_processor: 'paypal',
  }));
});

checkoutButton.addEventListener('click', function submitCybersource(event){
  disableForm()
  var cookies = parse_cookies();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", ecommerceBaseUrl + "/payment/cybersource/api-submit/", true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('X-CSRFToken', cookies['csrftoken']); 
  xhr.setRequestHeader('USE-JWT-COOKIE', true); 
  xhr.withCredentials = true
  xhr.onreadystatechange = function() { 
    if (this.readyState === XMLHttpRequest.DONE){
      if(this.status === 200) {
        var form = document.createElement("form");
        form.method = "POST";
        if(window.location.hostname === "payment.edx.org"){
          form.action = 'https://secureacceptance.cybersource.com/silent/pay'
        } else {
          form.action = 'https://testsecureacceptance.cybersource.com/silent/pay'
        }
        ecommerceFormFields = JSON.parse(this.response).form_fields
        for (var key of Object.keys(ecommerceFormFields)) {
          var element = document.createElement("input");
          element.type = 'hidden';
          element.value = ecommerceFormFields[key];
          element.name = key;
          form.appendChild(element);  
        }
        var cardNumber = document.getElementById('cardnumber').value
        cardNumber.type = 'hidden';
        var cardNumberElement = document.createElement("input");
        cardNumberElement.value = (cardNumber.match(/\d+/g) || []).join('');
        cardNumberElement.name = 'card_number';
        form.appendChild(cardNumberElement);

        // Emma: make sure to test all the possible number options
        var cardTypeElement = document.createElement("input");
        cardTypeElement.type = 'hidden';
        if (cardNumber.charAt(0) === "4"){
          cardTypeElement.value = '001' //visa
        }
        else if(cardNumber.substring(0,2) === "34" || cardNumber.substring(0,2) === "37"){
          cardTypeElement.value = '003' //American Express
        }
        else if(cardNumber.substring(0,4) === "6011" || cardNumber.substring(0,2) === "65" || /^64[4-9]/.test(cardNumber)){
          cardTypeElement.value = '004' //Discover
        }
        else if(cardNumber.substring(0,4) === "2720" || /^5[1-5]/.test(cardNumber) || /^222[1-9]/.test(cardNumber) || /^22[3-9]/.test(cardNumber) || /^2[3-6]/.test(cardNumber) || /^27[0-1]/.test(cardNumber)){
          cardTypeElement.value = '002' //Mastercard
        }
        else{
          redirectToMFE();
        }
        cardTypeElement.name = 'card_type';
        form.appendChild(cardTypeElement);

        var cardCVNElement = document.createElement("input");
        cardCVNElement.type = 'hidden';
        cardCVNElement.value = document.getElementById('cardcode').value;
        cardCVNElement.name = 'card_cvn';
        form.appendChild(cardCVNElement);

        var cardExpirationElement = document.createElement("input");
        cardExpirationElement.type = 'hidden';
        cardExpirationElement.value = document.getElementById('cardmonth').value.concat('-',  document.getElementById('cardyear').value);
        cardExpirationElement.name = 'card_expiry_date';
        form.appendChild(cardExpirationElement);

        document.body.appendChild(form);
        form.submit();
      } else {
        redirectToMFE();
      }
    }
  }
  urlEncodedDataPairs = [];
  urlEncodedDataPairs.push(encodeURIComponent("basket") + '=' + encodeURIComponent(getBasketId() ));
  urlEncodedDataPairs.push(encodeURIComponent("first_name") + '=' + encodeURIComponent(document.getElementById('firstname').value ));
  urlEncodedDataPairs.push(encodeURIComponent("last_name") + '=' + encodeURIComponent(document.getElementById('lastname').value ));
  urlEncodedDataPairs.push(encodeURIComponent("address_line1") + '=' + encodeURIComponent(document.getElementById('address1').value ));
  urlEncodedDataPairs.push(encodeURIComponent("address_line2") + '=' + encodeURIComponent(document.getElementById('address2').value ));
  urlEncodedDataPairs.push(encodeURIComponent("city") + '=' + encodeURIComponent(document.getElementById('city').value ));
  urlEncodedDataPairs.push(encodeURIComponent("country") + '=' + encodeURIComponent(document.getElementById('country').value ));
  urlEncodedDataPairs.push(encodeURIComponent("state") + '=' + encodeURIComponent(document.getElementById('state').value ));
  urlEncodedDataPairs.push(encodeURIComponent("postal_code") + '=' + encodeURIComponent(document.getElementById('zip').value ));

  var urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' );
  xhr.send(urlEncodedData);
});

