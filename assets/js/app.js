let cl = console.log;

const todoForm = document.getElementById("todoForm")
const todoItem = document.getElementById("todoItem")
const todoList = document.getElementById("todoList")
const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const spinner = document.getElementById("spinner");

const BASE_URL = `https://fetchtodo-default-rtdb.firebaseio.com/`;

const TODOLIST_URL = `${BASE_URL}/todo.json`

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: "success",
        timer: 3000
    })
}

let state = {
    todoArr: [],
    editId: null
};

function showSpinner() {
    spinner.classList.remove("d-none");
}

function hideSpinner() {
    spinner.classList.add("d-none");
}


function readtodo(arr) {
    let result = ``;

    arr.forEach(ele => {

        result += `  <li class="list-group-item justify-content-between d-flex" id="${ele.id}">
                
                <strong>${ele.todo}</strong>

                <div>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary"> Edit </button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger"> Delete </button>
                </div>

            </li>
        `;

    });

    todoList.innerHTML = result;
}


function fetchTodo() {
    showSpinner();

    fetch(TODOLIST_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "jwt token"
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Unable to fetch todo data");
            }
        })
        .then(data => {
            let arr = [];

            for (const key in data) {
                let obj = data[key];
                obj.id = key;
                arr.unshift(obj);
            }

            state.todoArr = arr;
            readtodo(state.todoArr);
        })
        .catch(err => {
            snackbar("Failed to fetch todo!!!", "error")
        })
        .finally(() => {
            hideSpinner();
        });
}


function onAddTodo(eve) {
    eve.preventDefault();

    showSpinner();

    let todoObj = {
        todo: todoItem.value
    };

    fetch(TODOLIST_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "jwt token"
        },
        body: JSON.stringify(todoObj)
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Unable to add todo");
            }
        })
        .then(data => {
            cl(data);

            todoObj.id = data.name;
            state.todoArr.unshift(todoObj);
            readtodo(state.todoArr);
            todoForm.reset();

            snackbar("Todo added successfully!!!", "success")
        })
        .catch(err => {
            snackbar("Failed to add todo!!!", "error")
        })
        .finally(() => {
            hideSpinner();
        });
}

function onEdit(btn) {
    let li = btn.closest("li");
    let editId = li.id;

    state.editId = editId;
    let obj = state.todoArr.find(ele => ele.id === editId);
    todoItem.value = obj.todo;

    addBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
}


function onUpdate() {
    showSpinner();

    let updateId = state.editId;

    let updateObj = {
        todo: todoItem.value
    };

    fetch(`${BASE_URL}/todo/${updateId}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "jwt token"
        },
        body: JSON.stringify(updateObj)
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Unable to update todo");
            }
        })
        .then(data => {
            cl(data);

            let index = state.todoArr.findIndex(
                ele => ele.id === updateId
            );

            state.todoArr[index].todo = todoItem.value;
            readtodo(state.todoArr);
            todoForm.reset();

            updateBtn.classList.add("d-none");
            addBtn.classList.remove("d-none");

            state.editId = null;
            snackbar("Todo updated successfully!!!", "success")
        })
        .catch(err => {
            snackbar("Failed to update todo!!!", "error")
        })
        .finally(() => {
            hideSpinner();
        });
}

function onDelete(btn) {

    let li = btn.closest("li");
    let deleteId = li.id;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {

        if (result.isConfirmed) {

            showSpinner();

            fetch(`${BASE_URL}/todo/${deleteId}.json`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "jwt token"
                }
            })
                .then(res => {
                    if (res.ok) {
                        return res;
                    } else {
                        throw new Error("Unable to delete todo");
                    }
                })
                .then(data => {

                    cl(data);

                   let getIndex = state.todoArr.findIndex(
                        ele => ele.id !== deleteId
                    );

                    state.todoArr.splice(getIndex, 1)
                    let col = document.getElementById(deleteId)
                    // cl(col)
                    btn.closest("li").remove()

                    // readtodo(state.todoArr);


                    Swal.fire({
                        title: "Deleted!",
                        text: "Your todo has been deleted.",
                        icon: "success",
                        timer:3000,
                    });
                })
                .catch(err => {
                    cl(err);
                    snackbar("Failed to delete todo!!!", "error");
                })
                .finally(() => {
                    hideSpinner();
                });
        }
    });
}


todoForm.addEventListener("submit", onAddTodo);
updateBtn.addEventListener("click", onUpdate);

fetchTodo();




