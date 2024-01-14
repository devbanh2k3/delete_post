function getInfo() {
    const resultTextbox_input = document.getElementById("resultTextbox_input").value;
    var resultTextbox = document.getElementById("resultTextbox");
    // tạo link lấy info

    resultTextbox.value = "https://graph.facebook.com/v18.0/me/accounts?access_token=" + resultTextbox_input + "&method=get&pretty=0&sdk=joey&suppress_http_code=1"

}

function get_post() {
    const resultTextbox_input = document.getElementById("resultTextbox_input").value;
    var resultTextbox = document.getElementById("resultTextbox");
    const data = JSON.parse(resultTextbox_input);
    let htmlText = "";

    data.data.forEach(item => {
        htmlText += `\nID: ${item.id}, Name: ${item.name} \nLink : https://graph.facebook.com/v18.0/${item.id}?access_token=${item.access_token}&fields=posts.limit(200)&method=get&pretty=0&sdk=joey&suppress_http_code=1 \n\n`;
    });

    resultTextbox.value = htmlText;


}

function export_code() {
    //const resultTextbox_input = document.getElementById("resultTextbox_input").value;
    var resultTextbox = document.getElementById("resultTextbox");
    // const response = JSON.parse(resultTextbox_input);
    // dataDelete = [];
    // response.posts.data.forEach(post => {
    //     if (post.id) {

    //         dataDelete.push(post.id.split('_')[1]);
    //     }
    // });




    var url = "data.txt";
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            resultTextbox.value = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            resultTextbox.textContent = 'Error loading content from file';
        });


}

