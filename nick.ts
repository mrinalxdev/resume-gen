// src/App.tsx
import React, { useState } from 'react';
import { Github, Mail, Phone, MapPin, ExternalLink, Loader2, Share2 } from 'lucide-react';
import ResumeForm from './components/ResumeForm';
import Resume from './components/Resume';
import ProjectSelector from './components/ProjectSelector';
import { ResumeData } from './types';

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  const handleSubmit = async (data: ResumeData) => {
    setLoading(true);
    try {
      if (data.githubUsername) {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${data.githubUsername}`),
          fetch(`https://api.github.com/users/${data.githubUsername}/repos?sort=stars&per_page=100`)
        ]);
        
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        
        const filteredRepos = reposData
          .filter((repo: any) => !repo.fork)
          .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
          .map((repo: any) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            url: repo.html_url,
            language: repo.language
          }));

        setAllProjects(filteredRepos);
        setShowProjectSelector(true);
        
        data.githubData = {
          avatarUrl: userData.avatar_url,
          bio: userData.bio,
          location: userData.location,
          repos: filteredRepos.slice(0, 4)
        };
      }
      setResumeData(data);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      alert('Error fetching GitHub data. Please check the username and try again.');
    }
    setLoading(false);
  };

  const handleProjectsSelected = (selectedProjects: any[]) => {
    if (resumeData && resumeData.githubData) {
      setResumeData({
        ...resumeData,
        githubData: {
          ...resumeData.githubData,
          repos: selectedProjects
        }
      });
    }
  };

  const handleDeploy = async () => {
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="h-6 w-6 text-gray-700" />
              <h1 className="text-xl font-bold text-gray-900">GithubResume Builder</h1>
            </div>
            {resumeData && !showProjectSelector && (
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                <Share2 className="h-4 w-4" />
                Share Resume
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        ) : showProjectSelector ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Select and Order Your Projects</h2>
              <button
                onClick={() => setShowProjectSelector(false)}
                className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
            <ProjectSelector
              projects={allProjects}
              onProjectsSelected={handleProjectsSelected}
            />
          </div>
        ) : resumeData ? (
          <div className="space-y-6">
            <button
              onClick={() => setResumeData(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Create New Resume
            </button>
            <Resume data={resumeData} />
          </div>
        ) : (
          <ResumeForm onSubmit={handleSubmit} />
        )}
      </main>

      <footer className='p-4 text-center'>Built from ❤️ by @Hi_Mrinal</footer>
    </div>
  );
}

export default App;


// src/components/ProjectSelector.tsx
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

// src/components/ResumeForm.tsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeData } from '../types';

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit }) => {
  const [fresher, setFresher] = useState(false);
  const [experiences, setExperiences] = useState([{
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      highlights: ['']
  }]);

  const addExperience = () => {
    setExperiences([...experiences, {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      highlights: ['']
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setExperiences(newExperiences);
  };

  const addHighlight = (experienceIndex: number) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].highlights.push('');
    setExperiences(newExperiences);
  };

  const updateHighlight = (experienceIndex: number, highlightIndex: number, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].highlights[highlightIndex] = value;
    setExperiences(newExperiences);
  };

  const removeHighlight = (experienceIndex: number, highlightIndex: number) => {
    const newExperiences = [...experiences];
    newExperiences[experienceIndex].highlights = newExperiences[experienceIndex].highlights
      .filter((_, i) => i !== highlightIndex);
    setExperiences(newExperiences);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: ResumeData = {
      personalInfo: {
        name: formData.get('name')!.toString(),
        title: formData.get('title')!.toString(),
        email: formData.get('email')!.toString(),
        phone: formData.get('phone')!.toString(),
        location: formData.get('location')!.toString(),
        summary: formData.get('summary')?.toString(), // summary is optional
      },
      experience: fresher
        ? []
        : experiences.map(exp => ({
            ...exp,
            highlights: exp.highlights.filter(h => h.trim() !== ''),
          })),
      education: formData.get('education')?.toString().split('\n').filter(Boolean) || [],
      skills: formData.get('skills')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [],
      githubUsername: formData.get('githubUsername') as string,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="input-field"
          />
          <input
            type="text"
            name="title"
            placeholder="Professional Title"
            required
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="input-field"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="input-field"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="input-field"
          />
          <input
            type="text"
            name="githubUsername"
            placeholder="GitHub Username (optional)"
            className="input-field"
          />
        </div>
        <textarea
          name="summary"
          placeholder="Professional Summary (optional)"
          rows={4}
          className="input-field"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-4 w-4" /> Add Position
          </button>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-gray-900">I don't have any work experience</label>
          <input
            type="checkbox"
            checked={fresher}
            onChange={(e) => setFresher(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
        </div>

        {!fresher && (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-700">Position {index + 1}</h3>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    placeholder="Job Title"
                    required
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Company"
                    required
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    placeholder="Location"
                    required
                    className="input-field"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      placeholder="Start Date"
                      required
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      placeholder="End Date"
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Key Achievements</label>
                    <button
                      type="button"
                      onClick={() => addHighlight(index)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add Achievement
                    </button>
                  </div>
                  {exp.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(index, hIndex, e.target.value)}
                        placeholder="• Achievement or responsibility"
                        className="input-field"
                      />
                      {exp.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(index, hIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
        <textarea
          name="education"
          placeholder="Enter each education item on a new line&#10;Example:&#10;MS in Computer Science, Stanford University (2018-2020)&#10;BS in Software Engineering, MIT (2014-2018)"
          rows={4}
          required
          className="input-field"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        <input
          type="text"
          name="skills"
          placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
          required
          className="input-field"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
      >
        Generate Resume
      </button>
    </form>
  );
};

export default ResumeForm;

// src/components/Resume.tsx
import React from 'react';
import { Github, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { ResumeData } from '../types';

interface ResumeProps {
  data: ResumeData;
}

const Resume: React.FC<ResumeProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.name}</h1>
              <p className="text-xl text-gray-600">{data.personalInfo.title}</p>
            </div>
            {data.githubData?.avatarUrl && (
              <img
                src={data.githubData.avatarUrl}
                alt={data.personalInfo.name}
                className="w-24 h-24 rounded-full"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{data.personalInfo.email}</span>
            </div>
            {data.personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
            {data.githubUsername && (
              <div className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                <a
                  href={`https://github.com/${data.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.githubUsername}
                </a>
              </div>
            )}
          </div>

          {data.personalInfo.summary && (
            <p className="text-gray-700 leading-relaxed">
              {data.personalInfo.summary}
            </p>
          )}
        </header>

        {/* GitHub Section */}
        {data.githubData && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.githubData.repos.map((repo) => (
                <div key={repo.name} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{repo.name}</h3>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-600">{repo.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-yellow-600">★ {repo.stars}</span>
                    {repo.language && (
                      <span className="text-gray-600">{repo.language}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <img
                src={`https://ghchart.rshah.org/${data.githubUsername}`}
                alt="GitHub Contribution Chart"
                className="w-full"
              />
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company} • {exp.location}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {exp.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="text-gray-700 pl-2">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <p key={index} className="text-gray-700">{edu}</p>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resume;

