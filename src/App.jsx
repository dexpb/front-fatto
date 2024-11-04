import "./App.css";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const Tarefas = ({ tasks, moveTaskDown, moveTaskUp }) => {
    return (
      <div className="todos">
        {tasks.map((task, index) => {
          const isExpensive = task.custo >= 1000;

          // Formatar o valor do custo em Real
          const formattedCusto = task.custo.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });

          return (
            <div
              className="todo"
              key={task.id}
              style={{ backgroundColor: isExpensive ? "yellow" : "white" }}
            >
              <p>ID: {task.id}</p>
              <p>Nome: {task.nome}</p>
              <p>Custo: {formattedCusto}</p>
              <p>Data Limite: {new Date(task.dataLimite).toLocaleDateString("pt-BR")}</p>
              <button onClick={() => handleWithEditButtonClick(task)}>
                <AiOutlineEdit size={20} />
              </button>
              <button onClick={() => confirmDeleteTask(task)}>
                <AiOutlineDelete size={20} />
              </button>
              <button onClick={() => moveTaskUp(index)} disabled={index === 0} style={{ fontSize: '20px' }}>
                ↑
              </button>
              <button
                onClick={() => moveTaskDown(index)}
                disabled={index === tasks.length - 1}
                style={{ fontSize: '20px' }}
              >
                ↓
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  async function handleWithNewButton() {
    setInputVisibility(!inputVisibility);
  }

  async function getTasks() {
    const response = await axios.get("http://localhost:3333/tarefas");
    setTasks(response.data.sort((a, b) => a.ordemApresentacao - b.ordemApresentacao));
  }

  async function isTaskNameDuplicate(taskName) {
    const response = await axios.get("http://localhost:3333/tarefas");
    return response.data.some(task => task.nome === taskName);
  }

  async function createTask() {
    if (await isTaskNameDuplicate(inputValue)) {
      setErrorMessage("Nome da tarefa já existe!");
      return;
    }

    await axios.post("http://localhost:3333/tarefas", {
      nome: inputValue,
      custo: parseFloat(inputCusto),
      dataLimite: inputDataLimite,
      ordemApresentacao: tasks.length + 1,
    });
    getTasks();
    setInputVisibility(false);
    setInputValue("");
    setInputCusto("");
    setInputDataLimite("");
    setErrorMessage("");
  }

  async function selectedEditTask() {
    if (!editTask) {
      console.error("No task selected for editing");
      return;
    }
  
    if (await isTaskNameDuplicate(inputValue) && editTask.nome !== inputValue) {
      setErrorMessage("Nome da tarefa já existe!");
      return;
    }
  
    const adjustedDate = new Date(inputDataLimite);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
  
    await axios.put(`http://localhost:3333/tarefas/${editTask.id}`, {
      nome: inputValue,
      custo: parseFloat(inputCusto),
      dataLimite: adjustedDate,
      ordemApresentacao: editTask.ordemApresentacao,
    });
    setEditTask(null);
    setInputVisibility(false);
    getTasks();
    setInputValue("");
    setInputCusto("");
    setInputDataLimite("");
    setErrorMessage("");
  }
  
  function handleWithEditButtonClick(task) {
    setEditTask(task);
    setInputVisibility(true);
    setInputValue(task.nome);
    setInputCusto(task.custo);
    const adjustedDate = new Date(task.dataLimite);
    adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());
    setInputDataLimite(adjustedDate.toISOString().split("T")[0]);
  }
  
  async function confirmDeleteTask(task) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    if (confirmed) {
      await deleteTask(task);
    }
  }

  async function deleteTask(task) {
    await axios.delete(`http://localhost:3333/tarefas/${task.id}`);
    getTasks();
  }

  const moveTaskUp = async (index) => {
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setTasks(newTasks);
    }
  };

  const moveTaskDown = async (index) => {
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
      setTasks(newTasks);
    }
  };

  const [editTask, setEditTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [inputCusto, setInputCusto] = useState("");
  const [inputDataLimite, setInputDataLimite] = useState("");
  const [inputVisibility, setInputVisibility] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className="App">
      <header className="container">
        <div className="header">
          <h1>Lista de Tarefas</h1>
        </div>
        <Tarefas tasks={tasks} moveTaskUp={moveTaskUp} moveTaskDown={moveTaskDown} />
        {errorMessage && <span className="error">{errorMessage}</span>}
        <div style={{ display: inputVisibility ? "block" : "none" }}>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="inputName"
            placeholder="Nome da Tarefa"
          />
          <input
            value={inputCusto}
            onChange={(event) => setInputCusto(event.target.value)}
            className="inputCusto"
            placeholder="Custo"
          />
          <input
            type="date"
            value={inputDataLimite}
            onChange={(event) => setInputDataLimite(event.target.value)}
            className="inputDataLimite"
            placeholder="Data Limite"
          />
        </div>
        <button
          onClick={
            inputVisibility
              ? editTask
                ? selectedEditTask
                : createTask
              : handleWithNewButton
          }
          className="newTaskButton"
        >
          {inputVisibility ? "Confirmar" : "Nova Tarefa"}
        </button>
      </header>
    </div>
  );
}

export default App;