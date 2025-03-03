

  document.getElementById("signup-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmpassword = document.getElementById("confirm_password").value;

    // Validation checks
    if (!name || !email  || !username|| !password || !confirmpassword) {
      showErrorMessage("All fields are required.");
      return;
    }

    // if (!/^[a-zA-Z ]+$/.test(name)) {
    //   showErrorMessage("Name should only contain alphabets and spaces.");
    //   return;
    // }
    if (!/^[a-zA-Z]+$/.test(name.trim())) {
      showErrorMessage("Name should only contain alphabets and spaces, but not only spaces.");
      return;
    }
    

    if (!/^[a-zA-Z ]+$/.test(username.trim())) {
      showErrorMessage("Name should only contain alphabets and spaces,but not only spaces.");
      return;
    }

    // Check if the email is in the format of gmail.com
    // if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(email)) {
    //     showErrorMessage("Please enter a valid Gmail address.");
    //     return;
    // }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      showErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showErrorMessage("Password should be at least 8 characters long.");
      return;
    }

    const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    if (!specialCharacterRegex.test(password)) {
      showErrorMessage(
        "Password should contain at least one special character."
      );
      return;
    }

    if (password !== confirmpassword) {
      showErrorMessage("Passwords do not match.");
      return;
    }



  


    try {
      const duplicateCheckResponse = await axios.get(
        `http://localhost:9050/user/checkEmail/${email}`
      );

      // Check if duplicateCheckResponse.data exists
      if (duplicateCheckResponse && duplicateCheckResponse.data) {
        const { exists, user } = duplicateCheckResponse.data;

        if (exists) {
          showErrorMessage(
            "Email already exists. Please choose another email."
          );
          return;
        }
      }


      const duplicateUsernameCheckResponse = await axios.get(`http://localhost:9050/user/checkusername/${username}`);

      if (duplicateUsernameCheckResponse && duplicateUsernameCheckResponse.data) {
          const { exists, user } = duplicateUsernameCheckResponse.data;

          if (exists) {
              showErrorMessage("Username already exists. Please choose another username.");
              return;
          }
        }
    

      // Continue with registration if email is not duplicate
      const userinfo = {
        name,
        username,
        email,
        password,
        confirmpassword,
      };

      axios
        .post("http://localhost:9050/user/register", userinfo)
        .then((response) => {
          console.log("User registered Successfully ", response.data);
          showSuccessMessage("Registered Successfully");
          document.getElementById("name").value = "";
          document.getElementById("username").value="";
          document.getElementById("email").value = "";
          document.getElementById("password").value = "";
          document.getElementById("confirm_password").value = "";
        })
        .catch((error) => {
          console.log("Error in registering user", error.response.data);
        });
    } catch (error) {
      console.error("Error checking duplicate email:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  });




document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email_login").value;
    const password = document.getElementById("password_login").value;

    // Validation checks
    if (!email || !password) {
      showErrorMessage("Email and password are required.");
      return;
    }

    // // Check if the email is in the format of gmail.com
    // if (!/^[a-zA-Z0-9._-]+@gmail\.com$/.test(email)) {
    //     showErrorMessage("Please enter a valid Gmail address.");
    //     return;
    // }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      showErrorMessage("Please enter a valid email address.");
      return;
    }

    const logininfo = {
      email,
      password,
    };

    axios
      .post("http://localhost:9050/user/login", logininfo)
      .then((response) => {
        console.log("User Logged In Successfully ", response.data);

        window.sessionStorage.token = response.data.token;
        window.sessionStorage.usernameinfo = response.data.usernameinfo;
        window.location.href = "./FileDirectory";
        showSuccessMessage("Login Successful");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            showErrorMessage("Invalid password. Please try again.");
          } else if (error.response.status === 404) {
            showErrorMessage("Email not registered. Please register first.");
          } else {
            console.log("Error in Logging a user", error.response.data);
          }
        } else {
          console.log("Error in Logging a user", error.message);
        }
      });
  });

// Function to show error message
function showErrorMessage(message) {
  new Noty({
    text: message,
    type: "error",
    layout: "topRight",
    timeout: 2000,
  }).show();
}

// Function to show success message
function showSuccessMessage(message) {
  new Noty({
    text: message,
    type: "success",
    layout: "topRight",
    timeout: 2000,
  }).show();
}
