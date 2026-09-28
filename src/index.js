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

const obj = new Todo(
{
    title: "Fix bedroom door hinge", 
    description: "The top hinge is squeaking and loose.", 
    dueDate: "Sunday, 27 September 2026", 
    priority: "Medium"
}
);

const todoArray = new TodoArray(new TodoListStorage());

console.log(todoArray.addTodo(obj))

console.log(todoArray.getTodo());