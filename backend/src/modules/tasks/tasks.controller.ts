import { Controller, Get, Post, Param, Put, Delete, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger"
import { TasksService } from "./tasks.service"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiResponse({ status: 201, description: "Task created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks with optional filters" })
  @ApiQuery({ name: "status", required: false, description: "Filter by task status" })
  @ApiQuery({ name: "priority", required: false, description: "Filter by task priority" })
  @ApiQuery({ name: "assignee", required: false, description: "Filter by assignee" })
  @ApiResponse({ status: 200, description: "Tasks retrieved successfully" })
  findAll(
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("assignee") assignee?: string,
  ) {
    return this.tasksService.findAll({ status, priority, assignee })
  }

  @Get("stats")
  @ApiOperation({ summary: "Get task statistics" })
  @ApiResponse({ status: 200, description: "Task statistics retrieved" })
  getStats() {
    return this.tasksService.getTaskStats()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task retrieved successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  findOne(@Param("id") id: string) {
    return this.tasksService.findOne(id)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a task" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task updated successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  update(@Param("id") id: string, updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a task" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task deleted successfully" })
  @ApiResponse({ status: 404, description: "Task not found" })
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id)
  }
}
