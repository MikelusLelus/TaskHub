import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';

const { default: cors } = await import('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'data', 'users.json');


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Els camps no poden estar buits' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correu electrònic no és vàlid' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasenya ha de tenir com a mínim 6 caràcters' });
  }

  try {
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    const user = users.find(user => user.email === email);

    if (!user) {
      res.status(404).json({ error: 'L\'usuari no existeix' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Credencials incorrectes' });
      return;
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al processar la sol·licitud' });
  }
});

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1, 
      name,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    await writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

    res.status(201).json({ message: 'Usuari registrat amb èxit', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al processar la sol·licitud' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const data = await readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en llegir la base de dades' });
  }
});


app.post('/api/equips', async (req, res) => {
  const { name, members, responsable } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Cal ficar un nom a l\'equip.' });
  }

  if (members.length === 0) {
    return res.status(400).json({ error: 'Cal seleccionar almenys un membre.' });
  }

  try {
   
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    let equipsData = await readFile(equipsFilePath, 'utf8');
    let equips = JSON.parse(equipsData);

    const existingTeam = equips.find(team => team.name.toLowerCase() === name.toLowerCase());
    if (existingTeam) {
      return res.status(400).json({ error: 'Aquest nom d\'equip ja està en ús. Si us plau, utilitza un altre nom.' });
    }

    const newTeam = {
      id: equips.length + 1, 
      name,
      members,
      responsable
    };

    equips.push(newTeam);

    await writeFile(equipsFilePath, JSON.stringify(equips, null, 2), 'utf8');

    res.status(201).json(newTeam); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Hi ha hagut un error en crear l\'equip.' });
  }
});


app.get('/api/equips', async (req, res) => {
  const userId = req.query.userId;

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    const equipsData = await readFile(equipsFilePath, 'utf8');
    const equips = JSON.parse(equipsData);

    const isUserInTeam = (equip) => {
      return equip.members.some(member => member.id === parseInt(userId)) || 
             equip.responsable.some(responsable => responsable.id === parseInt(userId));
    };

    const userEquips = equips.filter(isUserInTeam);

    res.json(userEquips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en obtenir els equips de l\'usuari' });
  }
});

app.put('/api/equips/:equipId', async (req, res) => {
  const equipId = req.params.equipId;
  const newData = req.body; 

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    const equipsData = await readFile(equipsFilePath, 'utf8');
    const equips = JSON.parse(equipsData);

    const index = equips.findIndex(equip => equip.id === parseInt(equipId));
    if (index !== -1) {
      equips[index] = { ...newData, id: parseInt(equipId) };
      
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


app.delete('/api/equips/:equipId', async (req, res) => {
  const equipId = req.params.equipId;

  try {
    const equipsFilePath = path.join(__dirname, 'data', 'equips.json');
    let equipsData = await readFile(equipsFilePath, 'utf8');
    let equips = JSON.parse(equipsData);

    const index = equips.findIndex(equip => equip.id === parseInt(equipId));

    if (index !== -1) {
      const equipTypeID = `EQUIP${equipId}`;

      const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
      let tasksData = await readFile(tasksFilePath, 'utf8');
      let tasksObject = JSON.parse(tasksData);

      const tasks = tasksObject.tasks;

      const tasksToDelete = tasks.filter(task => task.typeID === equipTypeID);

      tasksToDelete.forEach(task => {
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        tasks.splice(taskIndex, 1);
      });

      await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

      equips.splice(index, 1);

      await writeFile(equipsFilePath, JSON.stringify(equips, null, 2), 'utf8');

      res.json({ message: 'Equip eliminat amb èxit i les seves tasques associades també han estat eliminades' });
    } else {
      res.status(404).json({ error: 'No s\'ha trobat cap equip amb aquest ID' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en eliminar l\'equip i les seves tasques associades' });
  }
});


app.get('/api/tasks', async (req, res) => {
  const { typeID, userId } = req.query;

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    const tasksData = await readFile(tasksFilePath, 'utf8');
    const tasksObject = JSON.parse(tasksData);
    const tasks = tasksObject.tasks;

    const filteredTasks = tasks.filter(task => task.typeID === typeID);

    const userIsResponsibleOrExecutor = (task) => {
      return task.responsible.id === parseInt(userId) || task.executor.id === parseInt(userId);
    };

    const userTasks = filteredTasks.filter(userIsResponsibleOrExecutor);

    res.json(userTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtenir les tasques' });
  }
});


app.post('/api/tasks', async (req, res) => {
  const newTaskData = req.body;

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const newTaskId = tasksObject.tasks.length + 1;

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
      typeID: newTaskData.typeID,
      comments: []
    };

    tasksObject.tasks.push(newTask);

    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.status(201).json({ message: 'Nova tasca creada amb èxit', task: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en crear la nova tasca' });
  }
});


app.put('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId; 
  const updatedTaskData = req.body; 

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const tasks = tasksObject.tasks;

    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'No s\'ha trobat la tasca amb aquest ID' });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updatedTaskData
    };

    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.json({ message: 'Tasca actualitzada amb èxit', task: tasks[taskIndex] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en actualitzar la tasca' });
  }
});


app.post('/api/tasks/:taskId/comments', async (req, res) => {
  const taskId = req.params.taskId; 
  const newCommentData = req.body; 

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const tasks = tasksObject.tasks;

    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'No s\'ha trobat la tasca amb aquest ID' });
    }

    tasks[taskIndex].comments.push(newCommentData);

    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.json({ message: 'Nou comentari afegit amb èxit', comment: newCommentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en afegir el nou comentari' });
  }
});


app.delete('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const tasksFilePath = path.join(__dirname, 'data', 'tasques.json');
    let tasksData = await readFile(tasksFilePath, 'utf8');
    let tasksObject = JSON.parse(tasksData);

    const tasks = tasksObject.tasks;

    const taskIndex = tasks.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'No s\'ha trobat la tasca amb aquest ID' });
    }

    tasks.splice(taskIndex, 1); 

    await writeFile(tasksFilePath, JSON.stringify(tasksObject, null, 2), 'utf8');

    res.json({ message: 'Tasca eliminada amb èxit' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tasca' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
