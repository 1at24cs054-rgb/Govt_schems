async function register(){

    const data = {

        username:
        document.getElementById("username").value,

        password:
        document.getElementById("password").value,

        name:
        document.getElementById("name").value,

        age:
        parseInt(
            document.getElementById("age").value
        ),

        income:
        parseFloat(
            document.getElementById("income").value
        ),

        land_size:
        parseFloat(
            document.getElementById("land_size").value
        ),

        state:
        document.getElementById("state").value,

        district:
        document.getElementById("district").value
    }

    const response =
    await fetch(
        "http://127.0.0.1:8000/register",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify(data)
        }
    )

    const result =
    await response.json()

    if(result.status === "success"){

        document.getElementById("msg")
        .innerHTML =
        "Registration Successful! Redirecting to Login...";

        setTimeout(() => {

            window.location.href =
            "login.html";

        }, 1500);

    }
    else{

        document.getElementById("msg")
        .innerHTML =
        result.message;

    }
}