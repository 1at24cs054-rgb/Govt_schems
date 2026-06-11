async function login(){

    const response =
    await fetch(
        "http://127.0.0.1:8000/login",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                username:
                document.getElementById(
                    "username"
                ).value,

                password:
                document.getElementById(
                    "password"
                ).value
            })
        }
    )

    const result =
    await response.json()

    if(result.status==="success"){

        localStorage.setItem(
            "user_id",
            result.user_id
        )

        window.location=
        "dashboard.html"
    }
    else{

        document.getElementById("msg")
        .innerHTML =
        "Invalid Login"
    }
}