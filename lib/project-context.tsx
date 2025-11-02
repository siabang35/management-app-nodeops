"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'

interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  setCurrentProject: (project: Project) => void
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // For now, use a default project
      const defaultProject: Project = {
        id: "default-project",
        name: "NodeOps Management",
        description: "Main project for NodeOps management system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProjects([defaultProject])
      setCurrentProject(defaultProject)
      setIsLoading(false)
    }
  }, [user])

  const value = {
    currentProject,
    projects,
    setCurrentProject,
    isLoading,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
