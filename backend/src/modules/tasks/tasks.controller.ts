import { Controller, Get, Post, Param, Put, Delete, Query } from "@nestjs/common"
import type { TasksService } from "./tasks.service"
import type { CreateTaskDto } from "./dto/create-task.dto"
import type { UpdateTaskDto } from "./dto/update-task.dto"

@Controller("tasks")
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto)
  }

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("assignee") assignee?: string,
  ) {
    return this.tasksService.findAll({ status, priority, assignee })
  }

  @Get("stats")
  getStats() {
    return this.tasksService.getTaskStats()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tasksService.findOne(id)
  }

  @Put(":id")
  update(@Param("id") id: string, updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id)
  }
}
