function test_generate() {
    fetch("http://localhost:3000/generate")
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

test_generate();