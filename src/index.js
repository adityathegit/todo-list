const STORAGE_KEY = "todoList";
let isopen = true;

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
            const raw = this.storage.getItem(this.key);
            const parsedTodo = raw ? JSON.parse(raw) : null;
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

class TodoFormReader {
    constructor(root = document) {
        this.root = root;
    }

    getValues(selector) {
        const element = this.root.querySelector(selector);
        return element ? element.value.trim() : "";
    }

    read() {
        const title = this.getValues("#title-input");
        const dueDate = this.getValues("#date-input");
        const priority = this.getValues("#priority-input");
        const description = this.getValues("#description-input");

        if (!title || !dueDate || !priority || !description) return null;

        return { title, dueDate, priority, description };
    }
}

const createElement = (tag, className, text = "") => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

class TodoFieldView {
    constructor(container) {
        this.container = container;
    }

    render() {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.createTodoFieldElement());
        this.container.replaceChildren(fragment);
    }

    clear() {
        this.container.replaceChildren();
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
        priorityInput.setAttribute("id", "priority-input");

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

class TodoListView {
    constructor(container) {
        this.container = container;
    }

    render(todos) {
        const fragment = document.createDocumentFragment();
        todos.forEach((todo) => {
            fragment.appendChild(this.createTodoElement(todo));
        })
        this.container.replaceChildren(fragment);
    }

    clear() {
        this.container.replaceChildren();
    }

    createTodoElement(todo) {
        const contentBlock = createElement("div", "js-content-block");
        
        const checkboxTitle = createElement("div", "js-checkbox-title");
        const checkbox = document.createElement("input");
        checkbox.setAttribute("id", "js-done-todo");
        checkbox.setAttribute("type", "checkbox");
        const title = createElement("h1", "js-title", `${todo.title}`);
        
        checkboxTitle.append(checkbox, title); 

        const descriptionDiv = createElement("div", "description");
        const descriptionPara = createElement("p", "js-description", `${todo.description}`);
        descriptionDiv.appendChild(descriptionPara);

        const datePriorityDiv = createElement("div", "js-date-priority");
        const datePara = createElement("p", "js-date", `${todo.dueDate}`);
        const priorityPara = createElement("p", "js-priority", `${todo.priority}`);
        

        datePriorityDiv.append(datePara, priorityPara);

        contentBlock.append(checkboxTitle, descriptionDiv, datePriorityDiv);

        return contentBlock;
    }
}

class TodoController {
    constructor({ todoList, view, fieldView, formReader, elements }) {
        this.todoList = todoList;
        this.view = view;
        this.fieldView = fieldView;
        this.formReader = formReader;
        this.elements = elements;
        this.isOpen = false;

        this.shelfAction = new Map([
            [".js-add-btn", () => this.handleAdd()],
            [".js-cancel-btn", () => this.closeForm()],
        ]);
    }

    init() {
        const { todoButton, todoFields } = this.elements;
        todoButton.addEventListener("click", () => this.toggleForm());
        todoFields.addEventListener("click", (event) => this.handleShelfClick(event));
        this.refresh();
    }

    toggleForm() {
        this.isOpen ? this.closeForm() : this.openForm();
    }

    openForm() {
        this.isOpen = true;
        this.fieldView.render();
    }

    closeForm() {
        this.isOpen = false;
        this.fieldView.clear();
    }

    handleAdd() {
        const data = this.formReader.read();
        if (!data) return;

        this.todoList.addTodo(data);
        this.refresh();
        this.closeForm();
    }

    handleShelfClick(event) {
        for (const [selector, action] of this.shelfAction) {
            if (event.target.closest(selector)) {
                action();
                this.refresh();
                return;
            }
        }
    }

    refresh() {
        this.view.render(this.todoList.getTodo());
    }
}

const todoArray = new TodoArray(new TodoListStorage());
const todoFields = document.querySelector(".js-todo-fields");
const todoContent = document.querySelector(".js-todo-content");

new TodoController({
    todoList: todoArray,
    view: new TodoListView(todoContent),
    fieldView: new TodoFieldView(todoFields),
    formReader: new TodoFormReader(),
    elements: {
        todoButton: document.querySelector(".js-add-todo"),
        todoFields,
    },
}).init();

const obj = {
    title: "Fix bedroom door hinge",
    description: "The top hinge is squeaktodolistviewing and loose.",
    dueDate: "Sunday, 27 September 2026",
    priority: "Medium"
};





