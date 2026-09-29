const STORAGE_KEY = "todoList";

class Todo {
    constructor({ id, title, description, dueDate, priority }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
    }
}

class TodoListStorage {
    constructor(storage = localStorage, key = STORAGE_KEY) {
        this.storage = storage;
        this.key = key;
    }

    loadTodo() {
        try {
            const parsedTodo = this.storage.getItem(this.key);
            return Array.isArray(parsedTodo) ? parsedTodo : null;
        } catch {
            return null;
        }
    }

    saveTodo(todo) {
        try {
            this.storage.setItem(this.key, JSON.stringify(todo));
        } catch (error) {
            console.error("Could not save to library:", error);
        }
    }
}

class TodoArray {
    constructor(storage, initialTodo = []) {
        this.storage = storage;
        const savedTodo = storage.loadTodo();
        this.todos = (savedTodo ?? initialTodo).map((todolist) => new Todo(todolist));
    }

    getTodo() {
        return [...this.todos];
    }

    addTodo(todos) {
        const todo = new Todo({ id: crypto.randomUUID(), ...todos });
        this.todos.push(todo);
        this.persist();
        return todo;
    }
    
    persist() {
        this.storage.saveTodo(this.todos);
    }
}

const createElement = (tag, className, text = "") => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

class TodoListView {
    constructor(container) {
        this.container = container;
    }

    render() {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.createTodoFieldElement());
        this.container.replaceChildren(fragment);
    }

    createTodoFieldElement() {
        const todoCard = createElement("div", "js-todo-body");

        // Todo Title
        const todoTitle = createElement("div", "js-title");
        const titleInput = document.createElement("input");
        titleInput.setAttribute("id", "title-input");
        titleInput.setAttribute("type", "text");
        titleInput.setAttribute("placeholder", "TITLE");

        todoTitle.appendChild(titleInput);

        // Todo Date and Priority
        const todoDatePriority = createElement("div", "js-date-priority");
        const dateInput = document.createElement("input");
        dateInput.setAttribute("id", "date-input");
        dateInput.setAttribute("type", "date");

        const priorityInput = createElement("select", "priority");
        priorityInput.setAttribute("name", "priority");
        priorityInput.setAttribute("id", "priority");
        
        const optionLow = createElement("option", "options", "LOW");
        optionLow.setAttribute("value", "Low")   

        const optionMedium = createElement("option", "options", "MEDIUM");
        optionMedium.setAttribute("value", "Medium")

        const optionHigh = createElement("option", "options", "HIGH");
        optionHigh.setAttribute("value", "High")

        priorityInput.append(optionLow, optionMedium, optionHigh);

        todoDatePriority.append(dateInput, priorityInput);

        // Todo description
        const todoDescription = createElement("div", "js-description");
        const descriptionInput = document.createElement("textarea");
        descriptionInput.setAttribute("id", "description-input");
        descriptionInput.setAttribute("placeholder", "DESCRIPTION");
        
        todoDescription.appendChild(descriptionInput);

        // Todo Buttons
        const todoBtn = createElement("div", "js-todo-btn");
        const cancelBtn = createElement("button", "js-cancel-btn", "Cancel");
        const addBtn = createElement("button", "js-add-btn", "Add Todo");
        todoBtn.append(cancelBtn, addBtn)

        todoCard.append(todoTitle, todoDatePriority, todoDescription, todoBtn);

        return todoCard;
    }
}

const obj = {
    title: "Fix bedroom door hinge", 
    description: "The top hinge is squeaking and loose.", 
    dueDate: "Sunday, 27 September 2026", 
    priority: "Medium"
};

const todoArray = new TodoArray(new TodoListStorage());

console.log(todoArray.addTodo(obj))

const todolistview = new TodoListView(document.querySelector(".js-todo-fields"));

const button = document.querySelector(".js-add-todo");
button.addEventListener("click", () => {
    todolistview.render();
})

console.log(todoArray.getTodo());


