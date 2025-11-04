#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";

const tasksFile = path.join(process.cwd(), "tasks.json");

function loadData() {
  if (!fs.existsSync(tasksFile)) {
    return { lastId: 0, tasks: [] };
  }

  const content = fs.readFileSync(tasksFile, "utf-8");

  if (!content.trim()) {
    return { lastId: 0, tasks: [] };
  }

  try {
    return JSON.parse(content);
  } catch {
    return { lastId: 0, tasks: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2));
}

const program = new Command();

// add task
program
  .command("add <task>")
  .description("Add a new task")
  .action((task) => {
    const data = loadData();
    const newId = data.lastId + 1;
    const newTask = {
      id: newId,
      description: task,
      status: "todo",
      createdAt: new Date().toISOString(),
    };

    data.tasks.push(newTask);
    data.lastId = newId;

    saveData(data);

    console.log(chalk.green(`Added task with ID: ${newId} "${task}"`));
  });

// update task
program
  .command("update <id> <task>")
  .description("Update existing task by id")
  .action((id, task) => {
    const data = loadData();
    const i = data.tasks.findIndex((t) => t.id === Number(id));

    if (i < 0) {
      console.log(chalk.bgRed(`No task found with ID: ${id}`));
      return;
    }

    data.tasks[i].description = task;

    saveData(data);

    console.log(chalk.yellow(`Updated task with ID: ${id} to "${task}"`));
  });

// delete task
program
  .command("delete <id>")
  .description("Delete a task by id")
  .action((id) => {
    const data = loadData();
    const i = data.tasks.findIndex((t) => t.id === Number(id));

    if (i < 0) {
      console.log(chalk.bgRed(`No task found with ID: ${id}`));
      return;
    }

    data.tasks.splice(i, 1);

    saveData(data);

    console.log(chalk.red(`Deleted task with ID: ${id}`));
  });

// update status
program
  .command("mark <id> <status>")
  .description("Mark a task by id and give status")
  .action((id, status) => {
    const data = loadData();
    const i = data.tasks.findIndex((t) => t.id === Number(id));

    if (i < 0) {
      console.log(chalk.bgRed(`No task found with ID: ${id}`));
      return;
    }

    if (status === "todo" || status === "in-progress" || status === "done") {
      data.tasks[i].status = status;
    } else {
      console.log(
        chalk.bgRed(
          `Status "${status}" is invalid. Enter: "todo" "in-progress" "done"`
        )
      );
      return;
    }

    saveData(data);
    console.log(
      chalk.yellow(`Updated status of task with ID: ${id} to "${status}"`)
    );
  });

// list tasks
program
  .command("list [status]")
  .description("list tasks")
  .action((status) => {
    const data = loadData();

    let tasks = data.tasks;

    if (status) {
      tasks = data.tasks.filter((t) => t.status === status);
      if (tasks.length === 0) {
        console.log(chalk.blue(`No more tasks with status "${status}"`));
        return;
      }
    } else {
      if (tasks.length === 0) {
        console.log(chalk.blue("No more tasks"));
        return;
      }
    }

    tasks.forEach((task) => {
      console.log(
        chalk.blue(
          `ID: ${task.id} Task: "${task.description}" Status: "${task.status}"`
        )
      );
    });
  });

program.parse(process.argv);
