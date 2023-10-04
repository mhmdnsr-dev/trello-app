import handelRequest from "../../utils/handelRequest.js";
import taskCard from "../../utils/taskCard.js";

// VARIABELS
const createTaskBox = $("#create-task");
const spinnerCreate = $("#spinner.create");
const spinnerInsert = $("#spinner.insert");
const notifiMsg = $(".notifi-msg");
const newTaskBtn = $(".collapse-btn.new-task-btn");
let taskId = null;
let isDeleteTask = false;
let isDeleteAccount = false;
let isDeactivateAccount = false;
const updateTaskHandel = e => {
  const showEl = $("#collapseExample");
  const targetEl = e.target.closest(".card-wrapper");

  taskId = targetEl.id;

  $(".status").removeAttr("required");
  showEl.toggleClass("show");
  $(".title").trigger("focus");
  notifiMsg.text("");

  createTaskBox.children("div").children("input").removeAttr("required");
  $(".title").val(targetEl.querySelector(".card-title").textContent);
  $(".description").val(
    targetEl.querySelector(".card-description").textContent
  );
  $(".deadline").val(targetEl.querySelector(".card-deadline").textContent);
  $(".assignto").val(targetEl.querySelector(".task-email").value);

  $(".status").val(
    targetEl.querySelector(".card-status").textContent.toLowerCase()
  );
};

const deleteTaskHandel = e => {
  const targetEl = e.target.closest(".card-wrapper");
  taskId = targetEl.id;
  isDeleteTask = true;
};

// LOGGING
const token = localStorage.getItem("token");

//LOGOUT
const logout = () => {
  localStorage.removeItem("token");
  location.assign(`${location.origin}/`);
};
if (!token) logout();
document.getElementById("logout").addEventListener("click", logout);

// HANDEL DATE INPUT
$("#deadline-task")[0].min = new Date().toISOString().split("T")[0];

// GET USER DATA
let userData;
spinnerInsert.css({
  display: "block",
});
try {
  const res = await fetch(
    "https://trello-app-api.onrender.com/api/user/get-info",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error(data.message || data.body?.message);
  userData = await res.json();
  spinnerInsert.css({
    display: "none",
  });
} catch (err) {
  alert("Something went wrong, you can't log in" + err.message);
  logout();
}

const { user, tasks } = userData.body;
document.querySelector(".name").textContent = user.name;

// HANDEL TASK LIST
const taskContainer = $(".card-container");

const insertTask = jqueryHtml => {
  taskContainer.prepend(jqueryHtml);
};

tasks.forEach(task => insertTask($(taskCard(task))));
!tasks.length &&
  insertTask(
    `<div class='alert alert-danger no-tasks' role='alert'>No Tasks Found</div>`
  );

// ADD/UPDATE task
$(".create-task-from").on("submit", e => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target));
  const taskInfo = {};
  for (let prop in formData) {
    formData[prop] && (taskInfo[prop] = formData[prop]);
  }
  const url = taskId
    ? `https://trello-app-api.onrender.com/api/task/update/${taskId}`
    : "https://trello-app-api.onrender.com/api/task/add";

  const method = taskId ? "PATCH" : "POST";

  handelRequest(
    url,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: taskInfo,
    },
    () => {
      createTaskBox.css({
        display: "none",
      });
      spinnerCreate.css({
        display: "block",
      });
    },
    data => {
      const { task, note } = data.body;
      const taskEl = $(taskCard(task));
      taskEl.find(".update-task").on("click", updateTaskHandel);
      taskEl.find(".del-task").on("click", deleteTaskHandel);
      if (!taskId) {
        // There is only a spinner component plus "no task" component
        taskContainer.children().length === 2 && $(".no-tasks").remove();
        insertTask(taskEl);
      } else {
        $(`#${taskId}`).replaceWith(taskEl);
      }
      note && alert(note);

      $("input")
        .not(".task-email")
        .each((i, el) => {
          el.value = "";
        });
      newTaskBtn.trigger("click");
      taskId = null;
    },
    err => {
      notifiMsg.text(err.message).addClass("text-danger");
    },
    () => {
      spinnerCreate.css({ display: "none" });
      createTaskBox.css({
        display: "block",
      });

      // SET TO DEFAULT
    }
  );
});

// SET TASK FORM TO DEFAULT (CREATING)
newTaskBtn.on("click", e => {
  $("input")
    .not(".task-email")
    .each((i, el) => {
      el.value = "";
    });

  $(".title").attr("required", "").trigger("focus");
  $(".status").attr("required", "");
  $(".deadline").attr("required", "");

  notifiMsg.text("");
});

// SET TASK FORM TO UPDATING
$(".update-task").on("click", updateTaskHandel);

/// SET A REQUEST TO DELETING
$(".del-task").on("click", deleteTaskHandel);

$(".deactivate").on("click", e => {
  isDeactivateAccount = true;
});
$(".del-account").on("click", e => {
  isDeleteAccount = true;
});

/////////////////
$(".save-action").on("click", e => {
  let endPoint;
  isDeleteTask && (endPoint = `api/task/delete/${taskId}`);
  isDeleteAccount && (endPoint = "api/user/delete");
  isDeactivateAccount && (endPoint = "api/user/soft-delete");

  fetch(`https://trello-app-api.onrender.com/${endPoint}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => {
    if (res.ok)
      if (isDeleteTask) {
        $(`#${taskId}`).remove();
        // There is no card except the spinner
        taskContainer.children().length === 1 &&
          insertTask(
            `<div class='alert alert-danger no-tasks' role='alert'>No Tasks Found</div>`
          );
        isDeleteTask = false;
        taskId = null;
      } else logout();
  });

  $(".modal.fade").modal("hide");
});

// RETURN REQUEST TO DEFAULT (CREATING)
$("close-action").on("click", () => {
  taskId = null;
  isDeleteTask = false;
  isDeleteAccount = false;
  isDeactivateAccount = false;
});

$("#update-account").on("submit", e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  const userInfo = {};
  for (let prop in formData) {
    formData[prop] && (userInfo[prop] = formData[prop]);
  }
  fetch("https://trello-app-api.onrender.com/api/user/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userInfo),
  })
    .then(res => {
      if (res.ok) {
        if (userInfo.name) {
          document.querySelector(".name").textContent = userInfo.name;
        }
        $(".btn-close.off-canvas").trigger("click");
        $("input")
          .not(".task-email")
          .each((i, el) => {
            el.value = "";
          });
      }
      return res.json();
    })
    .then(data => {});
});
