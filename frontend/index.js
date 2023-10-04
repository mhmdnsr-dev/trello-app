import validity from "./utils/validity.js";
import handelRequest from "./utils/handelRequest.js";
import calcAge from "./utils/calcAge.js";

// VARIABLES
const spinnerBox = $("#spinner");
const signupBox = $("#signup");
const loginBox = $("#login");

// ROUTING TO HOME PAGE
const token = localStorage.getItem("token");
if (token) location.assign(`${location.origin}/pages/home`);

// HANDELING TEL INPUT
const input = document.querySelector("#floatingPhone");
window.intlTelInput(input, {
  utilsScript:
    "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
});
$(".iti").css({
  width: "100%",
});
$(".iti__flag-container li").each((_, el) => {
  el.addEventListener("click", e => {
    $(e.currentTarget)
      .closest(".iti")
      .children("input")
      .val(`(+${e.currentTarget.dataset.dialCode}) `);
  });
});

// HANDELING DATE INPUT
$('input[type="date"]')[0].max = new Date().toISOString().split("T")[0];

// SHOWING/HIDDEN PASSWORD
$(".show-password").each((i, el) => {
  $(el).on({
    click(e) {
      e.preventDefault();
      $(e.currentTarget).children("svg").toggleClass("fa-eye-slash");
      $(e.currentTarget).children("svg").toggleClass("fa-eye");
      const inputEl = $(e.target).closest("div").children("input");
      if (inputEl.attr("type") === "password") inputEl.attr("type", "text");
      else inputEl.attr("type", "password");
    },
  });
});

// toggeling LOGIN/SIGNUP BOX
const showingBox = box => {
  $("input").each((i, el) => {
    el.value = "";
    validity($(el), null);
  });
  $(".notifi-msg").text("");
  loginBox.css({
    display: "none",
  });
  signupBox.css({
    display: "none",
  });
  spinnerBox.css({
    display: "block",
  });
  setTimeout(() => {
    box.css({
      display: "block",
    });
    spinnerBox.css({
      display: "none",
    });
  }, 500);
};
$("#join-now-btn").on({
  click(e) {
    showingBox(signupBox);
  },
});
$("#sigin-in-btn").on({
  click(e) {
    showingBox(loginBox);
  },
});

// ENHANCE TYPING EMAIL EXPERIANCE
$('input[type="email"').on({
  input(e) {
    if ($(e.target).val().includes("@")) {
      $(e.target).attr("list", "domain-list");
      const value = $(e.target).val();
      const targetVal = value.slice(0, value.indexOf("@") + 1);
      $("#domain-list").html(`
			<option value="${targetVal}gmail.com"></option>
			<option value="${targetVal}outlook.com"></option>
			<option value="${targetVal}hotmail.com"></option>
			<option value="${targetVal}yahoo.com"></option>
			<option value="${targetVal}icloud.com"></option>
			<option value="${targetVal}yandex.com"></option>
			`);
    } else {
      $(e.target).attr("list", "");
      $("#domain-list").html("");
    }
  },
});

//INPUT VALIDETION FEEDBACK
let passMatched = false;
let feedbackMsg = "";
$("input").each((index, input) =>
  $(input).on({
    focusout(e) {
      if (e.target.value === "") {
        validity(e.target, null, null);
        return;
      } else if (!e.target.validity.valid) {
        if ($(e.target).attr("class").includes("email"))
          feedbackMsg = "The email provided is invalid.";
        if ($(e.target).attr("class").includes("password")) {
          feedbackMsg =
            "8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character";
        }
        if ($(e.target).attr("class").includes("age")) {
          feedbackMsg = "This date is invalid.";
        }
        if ($(e.target).attr("class").includes("phone")) {
          feedbackMsg = "6-16 characters: numbers, spaces, -, +, ().";
        }
        validity(e.target, false, feedbackMsg);
        return;
      } else if ($(e.target).attr("class").includes("password")) {
        const otherEl = $(".password").filter((_, el) => el !== e.target);
        if (otherEl.val() !== $(e.target).val() && otherEl.val() !== "") {
          feedbackMsg = "The two passwords should match";
          validity(e.target, false, feedbackMsg);
          return;
        } else {
          feedbackMsg = "";
          passMatched = true;
          if (otherEl.val() === "") validity(e.target, true, feedbackMsg);
          else validity(e.target, true, feedbackMsg, otherEl);
          return;
        }
      }
      if (e.target.value !== "") {
        feedbackMsg = "";
        validity(e.target, true, feedbackMsg);
      }
    },
  })
);

//REGISTER
$("#signup").on({
  submit(e) {
    e.preventDefault();
    if (!passMatched) return;
    const formData = Object.fromEntries(new FormData(e.target));
    delete formData["re-password"];
    formData.age
      ? (formData.age = calcAge(new Date(formData.age)))
      : delete formData.age;

    handelRequest(
      "https://trello-app-7u1u.onrender.com/api/user/register",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      },
      () => {
        spinnerBox.css({
          display: "block",
        });
        signupBox.css({
          display: "none",
        });
      },
      data => {
        $("input").each((i, el) => {
          el.value = "";
          validity($(el), null);
        });
        $(".notifi-msg")
          .html(
            `Verification message sent to "${formData.email}", you can verify Your account now or <button class=" round-2 bg-transparent text-primary ">send it</button> again`
          )
          .addClass("text-success")
          .removeClass("text-danger");
      },
      err => {
        // validity($("#signup input.email"), false, err.message);
        $(".notifi-msg")
          .html(`${err.message}`)
          .addClass("text-danger")
          .remove("text-success");
      },
      () => {
        spinnerBox.css({
          display: "none",
        });
        signupBox.css({
          display: "block",
        });
      }
    );
  },
});

// LOGIN
loginBox.on({
  submit(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    handelRequest(
      "https://trello-app-7u1u.onrender.com/api/user/login",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      },
      () => {
        spinnerBox.css({
          display: "block",
        });
        loginBox.css({
          display: "none",
        });
      },
      data => {
        if (data.body.isDeleted) alert("Your account is now active");
        localStorage.setItem("token", data.body.token);
        location.assign(`${location.origin}/pages/home`);
      },
      err => {
        spinnerBox.css({
          display: "none",
        });
        loginBox.css({
          display: "block",
        });
        $(".notifi-msg").text(`${err.message}`).addClass("text-danger");
      }
    );
  },
});
