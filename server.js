const express = require('express'); // importujemy framework Express, do tworzenia serwera
const mongoose = require('mongoose'); // biblioteka do komunikacji z bazą MongoDB
const cors = require('cors'); // middleware do API
const path = require('path'); // do pracy ze ścieżkami plików

const app = express(); // Tworzenie aplikacji Express

// Middleware
app.use(cors()); 
app.use(express.json()); // Parsujemy dane JSON 
app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z MongoDB
const mongoURI = 'mongodb+srv://cobraford:k5PuMHk2AZ3aN1Op@projektbd.5hvr1.mongodb.net/?retryWrites=true&w=majority&appName=ProjektBD'; // Adres URL bazy MongoDB.
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log('Połączono'))
    .catch((err) => console.error('Błąd połączenia z MongoDB:', err)); 

// Definicja modelu zadania w MongoDB 
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    completed: { type: Boolean, default: false }, // Status ukończenia zadania
    tags: { type: [String], default: [] } 
});
const Task = mongoose.model('Task', taskSchema); // Tworzymy model 

// Pobranie wszystkich zadań.
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find(); // Pobieramy zadania z bazy
        res.json(tasks); // Zwracamy je w formacie JSON.
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas pobierania zadań' }); 
    }
});

// Dodanie nowego zadania.
app.post('/api/tasks', async (req, res) => {
    const { title, tags } = req.body; // Wyciągamy tytuł i tagi z żądania
    try {
        const newTask = new Task({ title, tags }); 
        await newTask.save(); // Zapisujemy newTask w bazie.
        res.status(201).json(newTask); 
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas tworzenia zadania' }); 
    }
});

// Aktualizacja zadania.
app.put('/api/tasks', async (req, res) => {
    const { _id, completed } = req.body; // Wyciągamy id i status ukończenia z żądania
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            _id, 
            { completed: completed }, // Aktualizujemy status zadania.
            { new: true } // Zwracamy zaktualizowany obiekt.
        );
        if (!updatedTask) {
            return res.status(404).json({ error: 'Nie znaleziono zadania' }); 
        }
        res.json(updatedTask); 
    } catch (err) {
        console.error('Błąd podczas aktualizacji zadania:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Usuwanie zadania.
app.delete('/api/tasks', async (req, res) => {
    const { _id } = req.body; // Wyciągamy id zadania do usunięcia
    try {
        const task = await Task.findByIdAndDelete(_id); // Usuwamy zadanie z bazy
        if (task) {
            res.status(204).send(); // Sukces 
        } else {
            res.status(404).json({ error: 'Nie znaleziono zadania' }); 
        }
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas usuwania zadania' });
    }
});

// Filtrowanie zadań po tagach.
app.get('/api/tasks/filter', async (req, res) => {
    const { tag } = req.query; // Pobieramy tag z parametrów zapytania.
    try {
        const tasks = await Task.find({ tags: { $in: [tag] } }); // Szukamy zadań z tym tagiem.
        res.json(tasks); 
    } catch (err) {
        res.status(500).json({ error: 'Błąd podczas filtrowania zadań' });
    }
});

// Obsługa innych ścieżek 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Zwraca stronę główną 
});

// Start serwera.
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Serwer uruchomiony na porcie ${PORT}`); 
});