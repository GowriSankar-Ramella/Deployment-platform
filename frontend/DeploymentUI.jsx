import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Github, Rocket, ExternalLink, Terminal, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import "./DeploymentUI.css";

const socket = io("http://localhost:9002");

export default function DeploymentUI() {
  const [repoURL, setURL] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState(undefined);
  const [deployPreviewURL, setDeployPreviewURL] = useState(undefined);
  const [deploymentStatus, setDeploymentStatus] = useState(null); // 'success' | 'error' | null

  const logContainerRef = useRef(null);

  const isValidURL = useMemo(() => {
    if (!repoURL || repoURL.trim() === "") return [false, null];
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return [regex.test(repoURL), "Enter valid Github Repository URL"];
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    setDeploymentStatus(null);
    setDeployPreviewURL(undefined);

    try {
      const { data } = await axios.post(`http://localhost:9000/project`, {
        gitURL: repoURL,
        slug: projectId,
      });

      if (data && data.data) {
        const { projectSlug, url } = data.data;
        setProjectId(projectSlug);
        setDeployPreviewURL(url);

        console.log(`Subscribing to logs:${projectSlug}`);
        socket.emit("subscribe", `logs:${projectSlug}`);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      setDeploymentStatus("error");
      setLoading(false);
    }
  }, [projectId, repoURL]);

  const handleNewDeployment = () => {
    setURL("");
    setLogs([]);
    setLoading(false);
    setProjectId(undefined);
    setDeployPreviewURL(undefined);
    setDeploymentStatus(null);
  };

  const handleSocketIncommingMessage = useCallback((message) => {
    console.log(`[Incoming Socket Message]:`, typeof message, message);

    try {
      const { log } = JSON.parse(message);
      setLogs((prev) => [...prev, log]);

      // Check for completion indicators
      if (log.toLowerCase().includes("done") ||
        log.toLowerCase().includes("deployment complete") ||
        log.toLowerCase().includes("build complete")) {
        setDeploymentStatus("success");
        setLoading(false);
      } else if (log.toLowerCase().includes("error") ||
        log.toLowerCase().includes("failed")) {
        setDeploymentStatus("error");
        setLoading(false);
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error parsing log message:", error);
    }
  }, []);

  useEffect(() => {
    socket.on("message", handleSocketIncommingMessage);

    return () => {
      socket.off("message", handleSocketIncommingMessage);
    };
  }, [handleSocketIncommingMessage]);

  return (
    <div className="deployment-container">
      <div className="deployment-card">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <Rocket className="header-icon" size={32} />
            <div>
              <h1 className="header-title">Deploy Your Project</h1>
              <p className="header-subtitle">
                Deploy your GitHub repository in seconds
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <label className="input-label">
            <Github size={20} />
            <span>GitHub Repository URL</span>
          </label>
          <div className="input-wrapper">
            <input
              disabled={loading}
              value={repoURL}
              onChange={(e) => setURL(e.target.value)}
              type="url"
              placeholder="https://github.com/username/repository"
              className={`input ${!isValidURL[0] && repoURL ? "input-error" : ""}`}
            />
          </div>
          {!isValidURL[0] && repoURL && (
            <p className="error-message">{isValidURL[1]}</p>
          )}

          <button
            onClick={!loading && deploymentStatus ? handleNewDeployment : handleClickDeploy}
            disabled={!isValidURL[0] || loading}
            className={`deploy-button ${loading ? "deploy-button-loading" : ""}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Deploying...</span>
              </>
            ) : deploymentStatus ? (
              <>
                <Rocket size={20} />
                <span>Deploy Again</span>
              </>
            ) : (
              <>
                <Rocket size={20} />
                <span>Deploy Now</span>
              </>
            )}
          </button>
        </div>

        {/* Deployment Status */}
        {deploymentStatus && (
          <div className={`status-banner ${deploymentStatus === "success" ? "status-success" : "status-error"}`}>
            {deploymentStatus === "success" ? (
              <>
                <CheckCircle size={20} />
                <span>Deployment Successful!</span>
              </>
            ) : (
              <>
                <XCircle size={20} />
                <span>Deployment Failed</span>
              </>
            )}
          </div>
        )}

        {/* Preview URL */}
        {deployPreviewURL && (
          <div className="preview-section">
            <div className="preview-header">
              <Terminal size={18} />
              <span>Preview URL</span>
            </div>
            <a
              href={deployPreviewURL}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-link"
            >
              <span className="preview-url">{deployPreviewURL}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="logs-section">
            <div className="logs-header">
              <Terminal size={18} />
              <span>Deployment Logs</span>
              <span className="logs-count">{logs.length} lines</span>
            </div>
            <div className="logs-container" ref={logContainerRef}>
              <pre className="logs-content">
                {logs.map((log, i) => (
                  <code key={i} className="log-line">
                    <span className="log-prefix">$</span>
                    <span className="log-text">{log}</span>
                  </code>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="empty-state">
            <Github size={48} className="empty-icon" />
            <p className="empty-text">
              Enter your GitHub repository URL above to start deploying
            </p>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="bg-decoration"></div>
    </div>
  );
}