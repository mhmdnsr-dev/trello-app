export default task => {
  return `      
  <div class="col-3 mb-3 mb-sm-0 card-wrapper" id="${task._id}">
    <div class="card">
      <div class="card-body">
          <h5 class="card-title text-center ${
            task.status === "done" && "text-decoration-line-through"
          } text-primary mb-4">${task.title}</h5>
          <p class="card-text">
          <i class="fa-solid fa-circle-info fa-lg me-2"></i>
          <span class="card-description ${
            task.status === "done" && "text-decoration-line-through"
          }">${task.description || `NO DESCRIPTION FOUND`}</span>
          </p>
          <p><i class="fa-regular fa-square-check fa-lg me-2"></i> 
          
          <span class="card-status">${task.status}</span>
          </p>
          <p> <i class="fa-solid fa-calendar-check fa-lg me-2 "></i> 
          
          <span class="card-deadline">${
            new Date(task.deadline).toISOString().split("T")[0]
          }</span></p>
          <p>
          <span class="me-2"><i class="fa-solid fa-lg fa-user"></i></span>
          <span >${task.assignTo.name}</span>
          </p>
          <input type="hidden" value="${
            task.assignTo.email
          }" class="task-email">
          <div class="d-flex gap-4 justify-content-center">
          <button class="btn update-task"><i class="fa-solid fa-pen-to-square fa-lg" style="color: #2a6cdf;"></i></button>
            <button type="button" class="btn del-task" data-bs-toggle="modal"    data-bs-target="#exampleModalCenter"> 
                <i class="fa-solid fa-trash-can fa-lg" style="color: #dc1818;"></i>
            </button>
          </div>
      </div>
    </div>
  </div>`;
};
