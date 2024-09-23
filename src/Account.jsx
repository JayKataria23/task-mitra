import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  LogOut,
  Plus,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "./utils/supabase";
import PropTypes from "prop-types";

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromInitials(initials) {
  const colors = [
    "bg-emerald-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
  ];
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
}

function AssigneeInitials({ name }) {
  const initials = getInitials(name);
  const bgColor = getColorFromInitials(initials);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full ${bgColor} text-white text-s font-medium flex-shrink-0`}
            aria-label={`Assigned to ${name}`}
          >
            {initials}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assigned to: {name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

AssigneeInitials.propTypes = {
  name: PropTypes.string.isRequired,
};

export default function Component({ session }) {
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Upcoming",
  });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUserName();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        task_assignments(user_id)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data);
    }
  };

  const fetchUserName = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching user name:", error);
    } else {
      setUserName(data.email);
    }
  };

  const handleAddTask = async () => {
    if (newTask.title && newTask.dueDate) {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTask.title,
            description: newTask.description,
            due_date: newTask.dueDate,
            status: newTask.status,
          },
        ])
        .select();

      if (error) {
        console.error("Error adding task:", error);
      } else {
        await supabase
          .from("task_assignments")
          .insert([{ task_id: data[0].id, user_id: session.user.id }]);

        setIsModalOpen(false);
        setNewTask({
          title: "",
          description: "",
          dueDate: "",
          status: "Upcoming",
        });
        fetchTasks();
      }
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
    } else {
      fetchTasks();
    }
  };

  const toggleTaskExpansion = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggableId);

    if (error) {
      console.error("Error updating task status:", error);
    } else {
      fetchTasks();
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NxtGen-removebg-preview-JejyrxNu6gHCt8e58FgIUZQw6oabIp.png"
                alt="NxtGen Logo"
                className="h-11"
              />
              <h1 className="text-xl font-bold text-gray-800">Task Mitra</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:inline">
                Welcome, {userName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
        <div className="mx-auto max-w-7xl">
          <div className="grid pt-4 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <TaskColumn
              title="Upcoming"
              icon={<Clock className="h-6 w-6 text-blue-500" />}
              tasks={tasks.filter((task) => task.status === "Upcoming")}
              onDeleteTask={handleDeleteTask}
              expandedTasks={expandedTasks}
              toggleTaskExpansion={toggleTaskExpansion}
            />
            <TaskColumn
              title="Todo"
              icon={<Circle className="h-6 w-6 text-yellow-500" />}
              tasks={tasks.filter((task) => task.status === "Todo")}
              onDeleteTask={handleDeleteTask}
              expandedTasks={expandedTasks}
              toggleTaskExpansion={toggleTaskExpansion}
            />
            <TaskColumn
              title="Completed"
              icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
              tasks={tasks.filter((task) => task.status === "Completed")}
              onDeleteTask={handleDeleteTask}
              expandedTasks={expandedTasks}
              toggleTaskExpansion={toggleTaskExpansion}
            />
          </div>
        </div>
        <Button
          className="fixed bottom-12 right-12 bg-[#4CAF50] hover:bg-[#45a049] text-white p-6 rounded shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-12 w-12" />
        </Button>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropContext>
  );
}

function TaskColumn({
  title,
  icon,
  tasks,
  onDeleteTask,
  expandedTasks,
  toggleTaskExpansion,
}) {
  return (
    <Droppable droppableId={title}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`space-y-4 min-h-[200px] p-4 rounded-lg ${
            snapshot.isDraggingOver ? "bg-gray-100" : "bg-transparent"
          }`}
        >
          <div className="flex items-center space-x-2 mb-4">
            {icon}
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
          </div>
          {tasks.map((task, index) => (
            <Draggable
              key={task.id}
              draggableId={task.id.toString()}
              index={index}
            >
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`bg-white shadow-md ${
                    snapshot.isDragging ? "shadow-lg" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <AssigneeInitials
                        name={task.created_by || "Unassigned"}
                      />
                      <CardTitle className="text-md font-medium truncate">
                        {task.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-9 p-0 ml-2 flex-shrink-0"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      {expandedTasks[task.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle task details</span>
                    </Button>
                  </CardHeader>
                  {expandedTasks[task.id] && (
                    <>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {task.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </CardFooter>
                    </>
                  )}
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

TaskColumn.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  tasks: PropTypes.array.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  expandedTasks: PropTypes.object.isRequired,
  toggleTaskExpansion: PropTypes.func.isRequired,
};

Component.propTypes = {
  session: PropTypes.object.isRequired,
};
