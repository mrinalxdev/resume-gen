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
          
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
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