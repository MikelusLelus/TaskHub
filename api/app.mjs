import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// Ruta dels usuaris
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Importar el módulo CORS usando import()
const { default: cors } = await import('cors');

// Crear una instancia de Express
const app = express();
const PORT = 3000;

// Middleware para manejar JSON
app.use(express.json());

// Middleware CORS
app.use(cors());

// Ruta per iniciar sessió
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Comprovació de camps buits
  if (!email || !password) {
    return res.status(400).json({ error: 'Els camps no poden estar buits' });
  }

  // Comprovació de correu electrònic vàlid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correu electrònic no és vàlid' });
  }

  // Comprovació de la longitud mínima de la contrasenya
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasenya ha de tenir com a mínim 6 caràcters' });
  }

  try {
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    // Troba l'usuari amb l'email proporcionat
    const user = users.find(user => user.email === email);

    if (!user) {
      // Si l'usuari no existeix, retorna un error 404 indicant que l'usuari no es troba
      res.status(404).json({ error: 'L\'usuari no existeix' });
      return;
    }

    if (user.password !== password) {
      // Si la contrasenya no coincideix, retorna un error 401 indicant credencials incorrectes
      res.status(401).json({ error: 'Credencials incorrectes' });
      return;
    }

    // Retorna l'usuari si les credencials són correctes
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al processar la sol·licitud' });
  }
});

//Ruta per registrar-se
app.post('/api/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Els camps no poden estar buits' });
  }

  if (name.split(' ').length < 2) {
    return res.status(400).json({ error: 'El nom ha de contenir nom i cognom' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correu electrònic no és vàlid' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasenya ha de tenir com a mínim 6 caràcters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Les contrasenyes no coincideixen' });
  }

  try {
    
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    const existingUsername = users.find(user => user.name.toLowerCase() === name.toLowerCase());
    const existingUser = users.find(user => user.email === email);

    if (existingUsername) {
      return res.status(400).json({ error: 'El nom d\'usuari ja està en ús' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'El correu electrònic ja està registrat' });
    }

    const newUser = {
      id: users.length + 1, 
      name,
      email,
      password,
    };

    users.push(newUser);

    await writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

    // Devolver el nuevo usuario registrado
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});



// Ruta para obtenir tots els usuaris
app.get('/api/users', async (req, res) => {
  try {
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer la base de datos' });
  }
});

// Ruta para obtener un usuari pel seu ID
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    const user = users.find(user => user.id === userId);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer la base de datos' });
  }
});

// Ruta per crear un nou equip
app.post('/api/equips', async (req, res) => {
  const { name, members, responsable } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Cal ficar un nom a l\'equip.' });
  }

  if (members.length === 0) {
    return res.status(400).json({ error: 'Cal seleccionar almenys un membre.' });
  }


  try {
    // Obté les dades enviades en el cos de la petició (nom de l'equip, membres i responsable)
    

    // Suposem que tens un fitxer JSON per a equips (equip.json) similar a la teva estructura
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    let equipsData = await readFile(equipsFilePath, 'utf8');
    let equips = JSON.parse(equipsData);

    // Verifica si el nom de l'equip ja existeix
    const existingTeam = equips.find(team => team.name.toLowerCase() === name.toLowerCase());
    if (existingTeam) {
      return res.status(400).json({ error: 'Aquest nom d\'equip ja està en ús. Si us plau, utilitza un altre nom.' });
    }

    // Crea un nou equip amb les dades rebudes i afegeix a la llista d'equips
    const newTeam = {
      id: equips.length + 1, // Assegura la generació d'un nou ID únic per al nou equip
      name,
      members,
      responsable
    };

    equips.push(newTeam);

    // Escriu la llista actualitzada d'equips en el fitxer JSON
    await writeFile(equipsFilePath, JSON.stringify(equips, null, 2), 'utf8');

    res.status(201).json(newTeam); // Envia una resposta indicant que s'ha creat l'equip amb èxit
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el equip' });
  }
});


// Ruta per obtenir tots els equips
app.get('/api/equips', async (req, res) => {
  const userId = req.query.userId;

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    const equipsData = await readFile(equipsFilePath, 'utf8');
    const equips = JSON.parse(equipsData);

    // Funció per comprovar si l'usuari és membre o responsable d'un equip
    const isUserInTeam = (equip) => {
      return equip.members.some(member => member.id === parseInt(userId)) || 
             equip.responsable.some(responsable => responsable.id === parseInt(userId));
    };

    // Filtra els equips on l'usuari és responsable o membre
    const userEquips = equips.filter(isUserInTeam);

    res.json(userEquips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en obtenir els equips de l\'usuari' });
  }
});


/// Ruta per substituir les dades d'un equip específic
app.put('/api/equips/:equipId', async (req, res) => {
  const equipId = req.params.equipId;
  const newData = req.body; // Noves dades de l'equip

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    const equipsData = await readFile(equipsFilePath, 'utf8');
    const equips = JSON.parse(equipsData);

    // Troba l'equip amb l'ID corresponent
    const index = equips.findIndex(equip => equip.id === parseInt(equipId));
    if (index !== -1) {
      // Substitueix totes les dades de l'equip amb les noves dades enviades
      equips[index] = { ...newData, id: parseInt(equipId) };
      
      // Guarda les dades actualitzades
      await writeFile(equipsFilePath, JSON.stringify(equips, null, 2));
      
      res.json({ message: 'Dades de l\'equip actualitzades amb èxit' });
    } else {
      res.status(404).json({ error: 'No s\'ha trobat cap equip amb aquest ID' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en actualitzar les dades de l\'equip' });
  }
});


// Ruta per eliminar un equip pel seu ID
app.delete('/api/equips/:equipId', async (req, res) => {
  const equipId = req.params.equipId;

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    let equipsData = await readFile(equipsFilePath, 'utf8');
    let equips = JSON.parse(equipsData);

    // Troba l'índex de l'equip a eliminar
    const index = equips.findIndex(equip => equip.id === parseInt(equipId));

    if (index !== -1) {
      // Elimina l'equip de la llista d'equips
      equips.splice(index, 1);

      // Escriu la llista actualitzada d'equips en el fitxer JSON
      await writeFile(equipsFilePath, JSON.stringify(equips, null, 2), 'utf8');

      res.json({ message: 'Equip eliminat amb èxit' });
    } else {
      res.status(404).json({ error: 'No s\'ha trobat cap equip amb aquest ID' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en eliminar l\'equip' });
  }
});


// Ruta per obtenir tasques amb un typeID específic on l'usuari és responsable o executor
app.get('/api/tasks', async (req, res) => {
  const { typeID, userId } = req.query;

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    const tasksData = await readFile(tasksFilePath, 'utf8');
    const tasksObject = JSON.parse(tasksData);
    const tasks = tasksObject.tasks;

    // Filtra les tasques que coincideixin amb el typeID proporcionat
    const filteredTasks = tasks.filter(task => task.typeID === typeID);

    // Verifica si l'usuari és responsable o executor de les tasques filtrades
    const userIsResponsibleOrExecutor = (task) => {
      return task.responsible.id === parseInt(userId) || task.executor.id === parseInt(userId);
    };

    // Filtra les tasques on l'usuari és responsable o executor
    const userTasks = filteredTasks.filter(userIsResponsibleOrExecutor);

    res.json(userTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtenir les tasques' });
  }
});

// Ruta per crear una nova tasca
app.post('/api/tasks', async (req, res) => {
  const newTaskData = req.body; // Dades de la nova tasca

  try {
    // Aquest seria el teu fitxer on guardaries les tasques
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    // Assegurem una id única per a la nova tasca
    const newTaskId = tasksObject.tasks.length + 1;

    // Afegim la nova tasca a l'array existent de tasques
    const newTask = {
      id: newTaskId,
      taskName: newTaskData.taskName,
      description: newTaskData.description,
      state: newTaskData.state,
      team: newTaskData.team,
      responsible: newTaskData.responsible,
      executor: newTaskData.executor,
      date: newTaskData.date,
      priority: newTaskData.priority,
      typeID: newTaskData.typeID
      // Afegeix altres propietats de la nova tasca aquí si és necessari
    };

    // Afegim la nova tasca a l'array de tasques
    tasksObject.tasks.push(newTask);

    // Escrivim les dades actualitzades de les tasques al fitxer JSON
    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    // Enviem una resposta indicant que s'ha creat la nova tasca amb èxit
    res.status(201).json({ message: 'Nova tasca creada amb èxit', task: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en crear la nova tasca' });
  }
});

// Ruta per actualitzar una tasca per la seva ID
app.put('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId; // ID de la tasca a actualitzar
  const updatedTaskData = req.body; // Dades actualitzades de la tasca

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const tasks = tasksObject.tasks;

    // Cerca la tasca per la seva ID i actualitza les seves dades
    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'No s\'ha trobat la tasca amb aquest ID' });
    }

    // Actualitza les propietats de la tasca amb les dades enviades
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updatedTaskData
    };

    // Actualitza el fitxer JSON amb la tasca actualitzada
    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.json({ message: 'Tasca actualitzada amb èxit', task: tasks[taskIndex] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en actualitzar la tasca' });
  }
});


// Ruta para eliminar una tarea por su ID
app.delete('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId; // ID de la tarea a eliminar

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const tasks = tasksObject.tasks;

    // Busca la tarea por su ID y elimínala del array de tareas
    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'No s\'ha trobat la tasca amb aquest ID' });
    }

    tasks.splice(taskIndex, 1); // Elimina la tarea del array

    // Actualiza el archivo JSON con la tarea eliminada
    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.json({ message: 'Tasca eliminada amb èxit' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tasca' });
  }
});



// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
