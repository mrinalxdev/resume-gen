import React, { useState } from "react";
import {
  Github,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  Share2,
} from "lucide-react";
import ResumeForm from "./components/ResumeForm";
import Resume from "./components/Resume";
import ProjectSelector from "./components/ProjectSelector";
import { ResumeData } from "./types";
import ShareButton from "./components/ShareButton";
import { saveToCache, getFromCache } from "./utils/cache";
import { generateShareableLink, getDataFromShare } from "./utils/share";

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(() => {
    // Checking for the shared data in the cache nor it would create a conflict between the previous one and the current one
    const sharedData = getDataFromShare();
    if (sharedData) return sharedData;
    return getFromCache();
  });
  const [shareableUrl, setShareableUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  const handleSubmit = async (data: ResumeData) => {
    setLoading(true);
    try {
      if (data.githubUsername) {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${data.githubUsername}`),
          fetch(
            `https://api.github.com/users/${data.githubUsername}/repos?sort=stars&per_page=100`
          ),
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
            language: repo.language,
          }));

        setAllProjects(filteredRepos);
        setShowProjectSelector(true);

        data.githubData = {
          avatarUrl: userData.avatar_url,
          bio: userData.bio,
          location: userData.location,
          repos: filteredRepos.slice(0, 4),
        };
      }

      setResumeData(data);
      saveToCache(data);
      const shareUrl = generateShareableLink(data);
      if (shareUrl) setShareableUrl(shareUrl);
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      alert(
        "Error fetching GitHub data. Please check the username and try again."
      );
    }
    setLoading(false);
  };

  const handleProjectsSelected = (selectedProjects: any[]) => {
    if (resumeData && resumeData.githubData) {
      setResumeData({
        ...resumeData,
        githubData: {
          ...resumeData.githubData,
          repos: selectedProjects,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="h-6 w-6 text-gray-700" />
              <h1 className="text-xl font-bold text-gray-900">
                GithubResume Builder
              </h1>
            </div>
            {resumeData && !showProjectSelector && (
              <ShareButton url={shareableUrl} />
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
              <h2 className="text-xl font-semibold text-gray-900">
                Select and Order Your Projects
              </h2>
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

      <footer className="p-4 text-center">Built from ❤️ by @Hi_Mrinal</footer>
    </div>
  );
}

export default App;
