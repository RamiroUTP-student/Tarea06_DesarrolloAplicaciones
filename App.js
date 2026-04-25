import React, { useState, useEffect } from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      const saved = await AsyncStorage.getItem('@tasks');
      if (saved) setTaskList(JSON.parse(saved));
    };

    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@tasks', JSON.stringify(taskList));
    updateUI();
  }, [taskList]);

  const updateUI = () => {
    const total = taskList.length;

    if (total > 5) setStatusMessage('Demasiadas tareas pendientes');
    else if (total >= 1) setStatusMessage(`Tareas actuales: ${total}`);
    else setStatusMessage('Lista vacía');
  };

  const addTask = () => {
    if (task.trim() === '') {
      return Alert.alert('Error', 'Tarea vacía');
    }

    if (taskList.find(t => t.text === task)) {
      return Alert.alert('Error', 'Tarea duplicada');
    }

    const newTask = {
      id: Date.now().toString(),
      text: task,
      completed: false,
      date: new Date().toLocaleString()
    };

    setTaskList([...taskList, newTask]);
    setTask('');
  };

  const deleteTask = (id) => {
    setTaskList(taskList.filter(t => t.id !== id));
  };

  const toggleTask = (id) => {
    setTaskList(
      taskList.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TodoAppPro</Text>

      <Text
        style={[
          styles.status,
          taskList.length > 5
            ? { color: 'red' }
            : taskList.length >= 4
            ? { color: 'orange' }
            : { color: 'green' }
        ]}
      >
        {statusMessage}
      </Text>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity style={styles.btn} onPress={addTask}>
          <Text style={{ color: 'white' }}>Añadir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...taskList].sort((a, b) => a.completed - b.completed)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              onPress={() => toggleTask(item.id)}
              style={{ flex: 1 }}
            >
              <Text style={item.completed ? styles.done : null}>
                {item.text}
              </Text>

              <Text style={styles.date}>
                {item.date}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    backgroundColor: '#fff'
  },

  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },

  status: {
    fontWeight: 'bold',
    marginBottom: 10
  },

  inputArea: {
    flexDirection: 'row',
    marginBottom: 20
  },

  input: {
    flex: 1,
    borderBottomWidth: 1,
    marginRight: 10
  },

  btn: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5
  },

  item: {
    padding: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  done: {
    textDecorationLine: 'line-through',
    color: 'gray'
  },

  date: {
    fontSize: 10,
    color: 'gray'
  },

  delete: {
    color: 'red'
  }
});
