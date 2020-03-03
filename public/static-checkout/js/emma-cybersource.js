function submitCybersource(){
    var xhr = new XMLHttpRequest();
    // Emma: add real url
    xhr.open("POST", "http://localhost:18130/payment/cybersource/api-submit/", true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-CSRFToken', cookies['csrftoken']); 
    xhr.setRequestHeader('USE-JWT-COOKIE', true); 
    xhr.withCredentials = true

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("the request response: ",this.response)
            debugger;

            var form = document.createElement("form");
            form.method = "POST";
            
            // Emma: change this url
            form.action = 'https://testsecureacceptance.cybersource.com/silent/pay'

            ecommerceFormFields = JSON.parse(this.response).form_fields

            for (var key of Object.keys(ecommerceFormFields)) {
                var element = document.createElement("input");
                element.value = ecommerceFormFields[key];
                element.name = key;
                form.appendChild(element);  
            }

            var cardNumber = document.getElementById('cardnumber').value
            var cardNumberElement = document.createElement("input");
            cardNumberElement.value = (cardNumber.match(/\d+/g) || []).join('');
            cardNumberElement.name = 'card_number';
            form.appendChild(cardNumberElement);

            // Emma: make sure to test all the possible number options
            var cardTypeElement = document.createElement("input");
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
                //Emma: error here
            }
            cardTypeElement.name = 'card_type';
            form.appendChild(cardTypeElement);


            var cardCVNElement = document.createElement("input");
            cardCVNElement.value = document.getElementById('cardcode').value;
            cardCVNElement.name = 'card_cvn';
            form.appendChild(cardCVNElement);

            var cardExpirationElement = document.createElement("input");
            cardExpirationElement.value = document.getElementById('cardmonth').value.concat('-',  document.getElementById('cardyear').value);
            cardExpirationElement.name = 'card_expiry_date';
            form.appendChild(cardExpirationElement);

            document.body.appendChild(form);
            form.submit();
        }
    }
    debugger;
    let urlEncodedData = "",
    urlEncodedDataPairs = [],
    name;

    // Turn the data object into an array of URL-encoded key/value pairs.
    // for( name in data ) {
        // urlEncodedDataPairs.push( encodeURIComponent("basket") + '=' + encodeURIComponent(getBasketId()));
    // }

    urlEncodedDataPairs.push(encodeURIComponent("basket") + '=' + encodeURIComponent(getBasketId() ));
    urlEncodedDataPairs.push(encodeURIComponent("first_name") + '=' + encodeURIComponent(document.getElementById('firstname').value ));
    urlEncodedDataPairs.push(encodeURIComponent("last_name") + '=' + encodeURIComponent(document.getElementById('lastname').value ));
    urlEncodedDataPairs.push(encodeURIComponent("address_line1") + '=' + encodeURIComponent(document.getElementById('address1').value ));
    urlEncodedDataPairs.push(encodeURIComponent("address_line2") + '=' + encodeURIComponent(document.getElementById('address2').value ));
    urlEncodedDataPairs.push(encodeURIComponent("city") + '=' + encodeURIComponent(document.getElementById('city').value ));
    urlEncodedDataPairs.push(encodeURIComponent("country") + '=' + encodeURIComponent(document.getElementById('country').value ));
    urlEncodedDataPairs.push(encodeURIComponent("state") + '=' + encodeURIComponent(document.getElementById('state').value ));
    urlEncodedDataPairs.push(encodeURIComponent("postal_code") + '=' + encodeURIComponent(document.getElementById('zip').value ));

    // Combine the pairs into a single string and replace all %-encoded spaces to 
    // the '+' character; matches the behaviour of browser form submissions.
    urlEncodedData = urlEncodedDataPairs.join( '&' ).replace( /%20/g, '+' );
    xhr.send(urlEncodedData);
}