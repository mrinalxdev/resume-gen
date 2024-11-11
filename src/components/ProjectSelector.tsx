import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Star, ExternalLink, Edit2, Check, X } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  stars: number;
  url: string;
  language: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  onProjectsSelected: (selectedProjects: Project[]) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, onProjectsSelected }) => {
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>(projects);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Project | null>(null);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceList = result.source.droppableId === 'available' ? availableProjects : selectedProjects;
    const destList = result.destination.droppableId === 'available' ? availableProjects : selectedProjects;

    const [removed] = sourceList.splice(result.source.index, 1);
    destList.splice(result.destination.index, 0, removed);

    setAvailableProjects([...availableProjects]);
    setSelectedProjects([...selectedProjects]);
    onProjectsSelected(selectedProjects);
  };

  const startEditing = (project: Project) => {
    setEditingProject(project.name);
    setEditForm({ ...project });
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (!editForm) return;

    const updateProject = (list: Project[]) => {
      return list.map(p => p.name === editingProject ? editForm : p);
    };

    setAvailableProjects(updateProject(availableProjects));
    setSelectedProjects(updateProject(selectedProjects));
    setEditingProject(null);
    setEditForm(null);
    onProjectsSelected(updateProject(selectedProjects));
  };

  const ProjectCard = ({ project, provided }: { project: Project; provided: any }) => {
    const isEditing = editingProject === project.name;

    if (isEditing && editForm) {
      return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border rounded-lg p-3 bg-white shadow-sm"
        >
          <div className="flex items-start gap-2">
            <div {...provided.dragHandleProps} className="mt-1">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="font-medium text-gray-900 border rounded px-2 py-1 w-1/2"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editForm.stars}
                    onChange={e => setEditForm({ ...editForm, stars: parseInt(e.target.value) || 0 })}
                    className="w-16 border rounded px-2 py-1"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={saveEditing}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full text-sm text-gray-600 border rounded px-2 py-1"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editForm.url}
                  onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="Repository URL"
                  className="flex-1 text-sm border rounded px-2 py-1"
                />
                <input
                  type="text"
                  value={editForm.language}
                  onChange={e => setEditForm({ ...editForm, language: e.target.value })}
                  placeholder="Language"
                  className="w-24 text-sm border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className="border rounded-lg p-3 bg-white shadow-sm"
      >
        <div className="flex items-start gap-2">
          <div {...provided.dragHandleProps} className="mt-1">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{project.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {project.stars}
                </span>
                <button
                  onClick={() => startEditing(project)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            {project.language && (
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                {project.language}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Available Projects</h3>
          <Droppable droppableId="available">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {availableProjects.map((project, index) => (
                  <Draggable key={project.name} draggableId={project.name} index={index}>
                    {(provided) => <ProjectCard project={project} provided={provided} />}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Selected Projects (Max 4)</h3>
          <Droppable droppableId="selected">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-4"
              >
                {selectedProjects.map((project, index) => (
                  <Draggable key={project.name} draggableId={project.name} index={index}>
                    {(provided) => <ProjectCard project={project} provided={provided} />}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectSelector;