// by mieć pewność że DOM jest w pełni załadowany
document.addEventListener('DOMContentLoaded', function () {
    // Pobieranie referencji 
    const form = document.getElementById('task-form'); // Formularz dodawania zadania
    const input = document.getElementById('task-input'); // Pole tekstowe na tytuł zadania
    const tagInput = document.getElementById('tag-input'); // Pole tekstowe na tagi
    const taskList = document.getElementById('task-list'); // Lista zadań
    const filterInput = document.getElementById('filter-input'); // Pole tekstowe do filtrowania tagów
    const filterButton = document.getElementById('filter-button'); // Przycisk filtrowania
    const clearFilterButton = document.getElementById('clear-filter-button'); // Przycisk do czyszczenia filtra

    // Ładowanie zadań z bazy danych
    function loadTasks() {
        fetch('/api/tasks') // Źądanie do API
            .then(response => response.json()) // Przetwarzanie odpowiedźi w formacie JSON
            .then(tasks => {
                taskList.innerHTML = ''; // Czyścimy listę 
                tasks.forEach(task => {
                    addTaskToUI(task); 
                });
            })
            .catch(error => console.error('Błąd podczas ładowania zadań:', error));
    }

    // Obsługa przesłania formularza (dodanie nowego zadania)
    form.addEventListener('submit', function (e) {
        e.preventDefault(); 
        const taskText = input.value.trim(); // Pobranie tytułu zadania
        const tags = tagInput.value.trim().split(',').map(tag => tag.trim()); // Przetworzenie tagów na tablicę

        if (taskText) { 
		// Tworzenie nowego zadania
            const newTask = { title: taskText, tags }; 
            addTaskToUI(newTask); 
            addTaskToDB(newTask); 
            input.value = ''; 
            tagInput.value = ''; 
        }
    });

    // Funkcja dodawania zadania do interfejsu użytkownika
    function addTaskToUI(task) {
        const taskItem = document.createElement('li'); 
        taskItem.id = task._id; 
        taskItem.innerHTML = `
            <span>${task.title}</span>
            <span>${task.tags.join(', ')}</span>
            <button class="complete">Zakończ</button>
            <button class="delete">Usuń</button>
        `;
        // Dodanie obsługi kliknięcia przycisków "Zakończ" i "Usuń"
        taskItem.querySelector('.complete').addEventListener('click', function () {
            markTaskAsCompleted(task._id);
        });
        taskItem.querySelector('.delete').addEventListener('click', function () {
            deleteTaskFromDB(task._id);
        });
        taskList.appendChild(taskItem);

        
    }

    // Funkcja dodawania zadania do bazy danych
    function addTaskToDB(task) {
        fetch('/api/tasks', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(task) // Konwersja obiektu na JSON
        }).catch(error => console.error('Błąd podczas dodawania zadania:', error));
    }

    // Funkcja oznaczania zadania jako zakończone
    function markTaskAsCompleted(id) {
        fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id, completed: true })
        })
        .then(response => response.json())
        .then(updatedTask => {
            const taskItem = document.getElementById(id); // Znajdujemy element w UI
            taskItem.classList.add('completed'); 
            taskItem.querySelector('.complete').disabled = true; 
        })
        .catch(error => console.error('Błąd podczas oznaczania zadania jako zakończonego:', error));
    }

    // Funkcja usuwania zadania z bazy danych
    function deleteTaskFromDB(id) {
        fetch('/api/tasks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id })
        }).then(loadTasks) // odświeżamy listę zadań
          .catch(error => console.error('Błąd podczas usuwania zadania:', error));
    }

    // Obsługa filtrowania zadań po tagu
    filterButton.addEventListener('click', function () {
        const tag = filterInput.value.trim(); // wartość tagu z pola tekstowego
        if (tag) {
            fetch(`/api/tasks/filter?tag=${tag}`) // Wysyłamy żądanie do API z parametrem tagu
                .then(response => response.json())
                .then(tasks => {
                    taskList.innerHTML = ''; 
                    tasks.forEach(task => {
                        addTaskToUI(task); 
                    });
                })
                .catch(error => console.error('Błąd podczas filtrowania zadań:', error));
        }
    });

    // Obsługa czyszczenia filtra
    clearFilterButton.addEventListener('click', function () {
        filterInput.value = ''; 
        loadTasks(); 
    });

    
    loadTasks();
});