document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("resultTextbox").value = "";
});

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log('statusChangeCallback');
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        testAPI();
        get_page();

    } else {                                 // Not logged into your webpage or we are unable to tell.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this webpage.';
    }
}


function checkLoginState() {               // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function (response) {
        console.log(response);// See the onlogin handler
        statusChangeCallback(response);
    });
}


window.fbAsyncInit = function () {
    FB.init({
        appId: '366807535954078',
        cookie: true,                     // Enable cookies to allow the server to access the session.
        xfbml: true,                     // Parse social plugins on this webpage.
        version: 'v18.0'           // Use this Graph API version for this call.
    });


    FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
        statusChangeCallback(response);        // Returns the login status.
    });



};

function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in xxxx, YOU ID : ' + response.id + '!';
    });
}
function testAPI_test() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.

    FB.api('/111886488624721', { access_token: 'EAAGNO4a7r2wBOwUpZA2rgrv7G2sY4Lgvuwag633JtcSKqhGE2sJAEdofr2ZCEQSaViWuHmeIXCSZBYqOZCFqGFT6quLd0Xs85lpx5uMV6ttGeWypni0ZAMvAGOP4XzH3XWVpI0SnQZAMaP0nV0dkw5A4FGe8gZB3XZBaUr3xB0RSZABNWveWR37KmUTWTIRMucWTWFC0qVlYiTQZDZD' }, function (response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';
    });
}


function get_page() {
    FB.api('/me', function (response) {

        var id = response.id;
        FB.api(id + '/accounts', function (response_account) {
            console.log(response_account)
            renderDropdown(response_account.data);

        });
    });
}


function renderDropdown(data) {



    const dropdown = document.getElementById("dropdown");
    dropdown.innerHTML = "";

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "default";
    defaultOption.text = "Select an option";
    dropdown.appendChild(defaultOption);
    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.access_token;
        option.text = item.name;
        option.setAttribute('data-additional-value', item.id);
        dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function () {

        // Access the selected option
        const selectedOption = dropdown.options[dropdown.selectedIndex];

        // Retrieve additional value from the dataset of the selected option
        const additionalValue = selectedOption.dataset.additionalValue;
        document.getElementById('info').innerHTML =
            additionalValue;
        // Call your process function with the selected and additional values
        process(dropdown.value, additionalValue);
    });
}
var dataDelete = [];
var token_local = '';
var id_local = '';
function process(token, id) {
    // Add your logic here based on the selected value
    console.log("Selected option:", id);
    // lấy id các bài viết
    token_local = token;
    id_local = id;
    FB.api(id + '?fields=posts.limit%28200%29', {
        access_token: token
    }, function (response) {
        // Handle the response here
        console.log(response);

        dataDelete = [];
        // You can access posts data using response.posts.data
        response.posts.data.forEach(post => {
            if (post.id) {

                dataDelete.push(post.id.split('_')[1]);
            }
        });
        console.log(dataDelete);
        var resultTextbox = document.getElementById("resultTextbox");

        // Chuyển đổi mảng thành chuỗi JSON và gán giá trị vào textbox
        var url = "data.txt"; // Tên của file văn bản cùng thư mục với file js

        var fileContentElement = document.getElementById('fileContent');

        // Sử dụng Fetch API để tải nội dung từ đường link
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                resultTextbox.value = "arr=" + JSON.stringify(dataDelete, null, 2) + "\nvar ID_PAGE = \"" + document.getElementById('info').innerHTML + "\";" + data;
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                fileContentElement.textContent = 'Error loading content from file';
            });





        //renderTable(response);
        // Process the postsData as needed
    });

}

function renderTable(data) {
    const tableBody = document.querySelector("#facebookPostsTable tbody");
    tableBody.innerHTML = '';
    data.posts.data.forEach(item => {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);

        cell1.textContent = item.created_time;
        cell2.textContent = item.story || "";
        cell3.textContent = item.id;
    });
}





function delete_post() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    dataDelete.forEach(id => {
        deletePromises.push(deleteItem(id));
    });

}

function deleteItem(id) {
    return new Promise((resolve, reject) => {
        FB.api(id, 'delete', {
            access_token: token_local
        }, function (response) {
            // Handle the response here
            console.log(response);
            if (!response || response.error) {
                reject(response);
            } else {
                resolve(response);
            }
        });
    });
}

// Array to store promises for each delete operation
var deletePromises = [];

// Create promises for each delete operation


// Wait for all delete operations to complete
Promise.all(deletePromises)
    .then(() => {
        // All delete operations have completed
        console.log('All delete operations completed');

        // Now, you can execute the process function
        process(token_local, id_local);
    })
    .catch(error => {
        // Handle errors from delete operations
        console.error('Error in delete operations:', error);

        // You may choose to execute the process function despite errors or handle them differently
        process(token_local, id_local);
    });