import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  ClipboardList,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
            className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor} text-white text-xs font-medium flex-shrink-0`}
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

export default function Component() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Implement new security protocols",
      assignee: "John Doe",
      dueDate: "2023-06-15",
      status: "Upcoming",
      progress: 75,
    },
    {
      id: "2",
      title: "Migrate database to new server",
      assignee: "Jane Smith",
      dueDate: "2023-06-20",
      status: "Todo",
      progress: 0,
    },
    {
      id: "3",
      title: "Optimize website performance",
      assignee: "Michael Johnson",
      dueDate: "2023-06-30",
      status: "Completed",
      progress: 100,
    },
    {
      id: "4",
      title: "Develop mobile app prototype",
      assignee: "Sarah Lee",
      dueDate: "2023-07-05",
      status: "Upcoming",
      progress: 30,
    },
    {
      id: "5",
      title: "Implement new CRM system",
      assignee: "David Kim",
      dueDate: "2023-07-10",
      status: "Todo",
      progress: 0,
    },
    {
      id: "6",
      title: "Upgrade network infrastructure",
      assignee: "Emily Chen",
      dueDate: "2023-07-15",
      status: "Completed",
      progress: 100,
    },
  ]);

  const [expandedTasks, setExpandedTasks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    status: "Upcoming",
    progress: 0,
  });

  const handleAddTask = () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      const newTaskId = (tasks.length + 1).toString();
      setTasks([...tasks, { ...newTask, id: newTaskId }]);
      setExpandedTasks({ ...expandedTasks, [newTaskId]: true });
      setIsModalOpen(false);
      setNewTask({
        title: "",
        assignee: "",
        dueDate: "",
        status: "Upcoming",
        progress: 0,
      });
    }
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    const { [id]: _, ...newExpandedTasks } = expandedTasks;
    setExpandedTasks(newExpandedTasks);
  };

  const toggleTaskExpansion = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragEnd = (result) => {
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

    const newTasks = Array.from(tasks);
    const [reorderedItem] = newTasks.splice(source.index, 1);
    reorderedItem.status = destination.droppableId;
    newTasks.splice(destination.index, 0, reorderedItem);

    setTasks(newTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NxtGen-removebg-preview-JejyrxNu6gHCt8e58FgIUZQw6oabIp.png"
                alt="NxtGen Logo"
                className="h-10"
              />
              <h1 className="text-3xl font-bold text-gray-800">
                IT Solutions Dashboard
              </h1>
            </div>
            <Button
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </header>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                <Label htmlFor="assignee" className="text-right">
                  Assignee
                </Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignee: e.target.value })
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
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`bg-white shadow-md ${
                    snapshot.isDragging ? "shadow-lg" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <AssigneeInitials name={task.assignee} />
                      <CardTitle className="text-sm font-medium truncate">
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
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Progress</p>
                            <p className="text-sm font-medium">
                              {task.progress}%
                            </p>
                          </div>
                          <Progress value={task.progress} className="w-full" />
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Due: {task.dueDate}
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
