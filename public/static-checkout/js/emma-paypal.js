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

function getBasketId(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // Emma: sql or other injection?
    const basketId = urlParams.get('basketId')
    // Emma: what if the basketId is not in the param?
    return basketId
}

var cookies = parse_cookies();

function submitPaypal(){
    var xhr = new XMLHttpRequest();
    // Emma: add real url
    xhr.open("POST", "http://localhost:18130/api/v2/checkout/", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', cookies['csrftoken']); 
    xhr.setRequestHeader('USE-JWT-COOKIE', true); 
    xhr.withCredentials = true

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        // Emma: what do we do about error responses?
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("the request response: ",this.response)
            var form = document.createElement("form");
            form.method = "POST";
            form.action = JSON.parse(this.response).payment_page_url
            document.body.appendChild(form);
            form.submit();
        }
    }

    var basket_id = getBasketId()
    xhr.send(JSON.stringify({
        basket_id: basket_id,
        payment_processor: 'paypal',
    }));
}


