import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createReport,
  deleteReport,
  getReports,
  updateReport,
} from "../services/api";

import type {
  Report,
  ReportCategory,
} from "../types/api";

import "./ReportsPage.css";

const categories: ReportCategory[] = [
  "too hot",
  "too noisy",
  "too bright",
  "too dark",
  "comfortable",
  "other",
];

function formatText(value: string): string {
  return value
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export default function ReportsPage() {
  const [reports, setReports] =
    useState<Report[]>([]);

  const [category, setCategory] =
    useState<ReportCategory>("too hot");

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    setError(null);

    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createReport({
        category,
        comment: comment.trim() || undefined,
      });

      setComment("");
      setCategory("too hot");

      setSuccess(
        "Your report was submitted successfully.",
      );

      await loadReports();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not create the report.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(
    report: Report,
  ) {
    setError(null);
    setSuccess(null);

    try {
      const newStatus =
        report.status === "open"
          ? "resolved"
          : "open";

      await updateReport(report.id, {
        status: newStatus,
      });

      setSuccess(
        `Report marked as ${newStatus}.`,
      );

      await loadReports();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  async function handleEdit(
    report: Report,
  ) {
    const newComment = window.prompt(
      "Edit report comment:",
      report.comment ?? "",
    );

    if (newComment === null) {
      return;
    }

    try {
      await updateReport(report.id, {
        comment: newComment,
      });

      setSuccess(
        "Report updated successfully.",
      );

      await loadReports();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  async function handleDelete(
    reportId: number,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteReport(reportId);

      setSuccess(
        "Report deleted successfully.",
      );

      await loadReports();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  return (
    <main className="reports-page">
      <header className="reports-header">
        <p className="eyebrow">
          Community feedback
        </p>

        <h1>User Reports</h1>

        <p>
          Share how the atrium feels right now
          and review previously submitted reports.
        </p>
      </header>

      <section className="report-form-card">
        <h2>Submit a report</h2>

        <form onSubmit={handleSubmit}>
          <div className="report-form-grid">
            <div className="filter-field">
              <label htmlFor="report-category">
                Category
              </label>

              <select
                id="report-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value as ReportCategory,
                  )
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatText(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="report-comment">
                Comment
              </label>

              <textarea
                id="report-comment"
                maxLength={500}
                placeholder="Add more details..."
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
              />
            </div>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit report"}
          </button>
        </form>
      </section>

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {error && (
        <div className="history-message error-message">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      <section className="reports-list-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Submitted reports
            </p>

            <h2>
              {loading
                ? "Loading..."
                : `${reports.length} reports`}
            </h2>
          </div>
        </div>

        {!error && loading && (
          <div className="history-message">
            <div className="loading-spinner" />
            <p>Loading reports...</p>
          </div>
        )}

        {!error &&
          !loading &&
          reports.length === 0 && (
            <div className="history-message">
              <h3>No reports yet</h3>

              <p>
                The first submitted report will
                appear here.
              </p>
            </div>
          )}

        {!error &&
          !loading &&
          reports.length > 0 && (
            <div className="reports-grid">
              {reports.map((report) => (
                <article
                  className="report-card"
                  key={report.id}
                >
                  <div className="report-card-header">
                    <span
                      className={`report-status status-${report.status}`}
                    >
                      {formatText(report.status)}
                    </span>

                    <time>
                      {new Date(
                        report.created_at,
                      ).toLocaleString()}
                    </time>
                  </div>

                  <h3>
                    {formatText(report.category)}
                  </h3>

                  <p>
                    {report.comment ||
                      "No additional comment."}
                  </p>

                  <div className="report-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleStatus(report)
                      }
                    >
                      {report.status === "open"
                        ? "Mark resolved"
                        : "Reopen"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(report)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        handleDelete(report.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}