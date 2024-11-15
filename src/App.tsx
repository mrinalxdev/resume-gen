import React, { useRef, useState } from "react";
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
import { exportToPdf } from "./utils/pdfExport";
import { ExportButton } from "./components/ExportButton";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  const resumeRef = useRef<HTMLDivElement>(null);
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

  const handleExport = async () => {
    if (!resumeData) return false;
    const fileName = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_resume.pdf`
    return exportToPdf(resumeRef, fileName);
  }

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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                GithubResume Builder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {resumeData && !showProjectSelector && (
                <div className="flex items-center gap-2">
                  <ExportButton onExport={handleExport} />
                  {shareableUrl && <ShareButton url={shareableUrl} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-200" />
          </div>
        ) : showProjectSelector ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Select and Order Your Projects
              </h2>
              <button
                onClick={() => setShowProjectSelector(false)}
                className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
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
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors"
            >
              Create New Resume
            </button>
            <Resume ref={resumeRef} data={resumeData} />
          </div>
        ) : (
          <ResumeForm onSubmit={handleSubmit} />
        )}
      </main>

      <footer className="p-4 text-center text-gray-600 dark:text-gray-400">Built with ❤️ by @Hi_Mrinal</footer>
    </div>
  );
}

export default App;
