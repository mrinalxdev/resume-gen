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
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            required
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <input
            type="text"
            name="title"
            placeholder="Professional Title *"
            required
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <input
            type="text"
            name="githubUsername"
            placeholder="GitHub Username (optional)"
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>
        <textarea
          name="summary"
          placeholder="Professional Summary (optional)"
          rows={4}
          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus className="h-4 w-4" /> Add Position
          </button>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-gray-900 dark:text-gray-100">I don't have any work experience</label>
          <input
            type="checkbox"
            checked={fresher}
            onChange={(e) => setFresher(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        {!fresher && (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-4 space-y-4 dark:bg-gray-800">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Position {index + 1}</h3>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                    placeholder="Job Title *"
                    required
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Company *"
                    required
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    placeholder="Location *"
                    required
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      placeholder="Start Date *"
                      required
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      placeholder="End Date *"
                      required
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Achievements</label>
                    <button
                      type="button"
                      onClick={() => addHighlight(index)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                      {exp.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHighlight(index, hIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Education</h2>
        <textarea
          name="education"
          placeholder="* Enter each education item on a new line&#10;Example:&#10;MS in Computer Science, Stanford University (2018-2020)&#10;BS in Software Engineering, MIT (2014-2018)"
          rows={4}
          required
          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Skills</h2>
        <input
          type="text"
          name="skills"
          placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js) *"
          required
          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Generate Resume
      </button>
    </form>
  );
};

export default ResumeForm;