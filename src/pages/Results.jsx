
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Award,
  Pencil,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

import {
  getResults,
  createResult,
  updateResult,
  deleteResult,
} from "../api/results";

import { getStudents } from "../api/students";
import { addNotification } from "../utils/notifications";

export default function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    studentId: "",
    subject: "",
    marks: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    marks: "",
  });

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const loadResults = useCallback(async () => {
    try {
      const response = await getResults();
      setResults(Array.isArray(response.data) ? response.data : []);
      setErr("");
    } catch (error) {
      console.error("Loading results failed:", error);
      setErr("Unable to load results.");
    }
  }, []);

  useEffect(() => {
    loadResults();

    getStudents()
      .then((response) =>
        setStudents(Array.isArray(response.data) ? response.data : [])
      )
      .catch((error) => {
        console.error("Loading students failed:", error);
      });
  }, [loadResults]);

  async function handleAddResult(event) {
    event.preventDefault();
    setErr("");
    setSuccess("");

    const marks = Number(form.marks);

    if (!form.studentId || !form.subject.trim()) {
      setErr("Please select a student and enter a subject.");
      return;
    }

    if (form.marks === "" || marks < 0 || marks > 100) {
      setErr("Marks must be between 0 and 100.");
      return;
    }

    const studentId = Number(form.studentId);
    const subject = form.subject.trim();
    const student = students.find(
      (item) => Number(item.studentId) === studentId
    );

    setBusy(true);

    try {
      await createResult({ studentId, subject, marks });

      addNotification(
        `Result added: ${subject}, ${marks} marks for ${
          student?.name || `Student #${studentId}`
        }.`,
        "success"
      );

      setForm({ studentId: "", subject: "", marks: "" });
      setSuccess("Result added successfully.");
      await loadResults();
    } catch (error) {
      console.error("Adding result failed:", error);
      setErr(
        error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "Failed to add result.")
      );
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(result) {
    setEditingId(result.resultId);
    setEditForm({
      subject: result.subject || "",
      marks: String(result.marks ?? ""),
    });
    setErr("");
    setSuccess("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditForm({ subject: "", marks: "" });
    setErr("");
  }

  async function handleSaveEdit(resultId) {
    const marks = Number(editForm.marks);

    if (!editForm.subject.trim()) {
      setErr("Subject cannot be empty.");
      return;
    }

    if (editForm.marks === "" || marks < 0 || marks > 100) {
      setErr("Marks must be between 0 and 100.");
      return;
    }

    const previousResult = results.find(
      (result) => result.resultId === resultId
    );

    const subject = editForm.subject.trim();
    const previousMarks = previousResult?.marks;

    setBusy(true);
    setErr("");
    setSuccess("");

    try {
      await updateResult(resultId, { subject, marks });

      addNotification(
        `Result #${resultId} updated for Student #${
          previousResult?.studentId ?? "Unknown"
        }: ${previousResult?.subject ?? "Unknown subject"} (${previousMarks} marks) → ${subject} (${marks} marks).`,
        "info"
      );

      setEditingId(null);
      setEditForm({ subject: "", marks: "" });
      setSuccess("Result updated successfully.");
      await loadResults();
    } catch (error) {
      console.error("Updating result failed:", error);
      setErr(
        error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "Failed to update result. Check the backend PUT endpoint.")
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(resultId) {
    if (!window.confirm(`Delete result #${resultId}?`)) {
      return;
    }

    setErr("");
    setSuccess("");

    const result = results.find(
      (item) => item.resultId === resultId
    );

    try {
      await deleteResult(resultId);

      addNotification(
        `Result #${resultId} deleted: ${
          result?.subject ?? "Unknown subject"
        } for Student #${result?.studentId ?? "Unknown"}.`,
        "warning"
      );

      if (editingId === resultId) {
        setEditingId(null);
      }

      setSuccess("Result deleted successfully.");
      await loadResults();
    } catch (error) {
      console.error("Deleting result failed:", error);
      setErr("Failed to delete result.");
    }
  }

  return (
    <>
      <div className="pagehead">
        <span className="purple">ACADEMIC PERFORMANCE</span>
        <h1>Results</h1>
        <p>View and manage student marks and grades.</p>
      </div>

      {err && (
        <div className="error" role="alert">
          {String(err)}
        </div>
      )}

      {success && (
        <div role="status" style={{ marginBottom: "16px" }}>
          {success}
        </div>
      )}

      <div className="twocol">
        <div className="panel">
          <div className="panelhead">
            <div>
              <h3>Add result</h3>
              <p>Grades are calculated automatically.</p>
            </div>
            <Award />
          </div>

          <form onSubmit={handleAddResult}>
            <label>
              Student
              <select
                value={form.studentId}
                onChange={(event) =>
                  setForm({ ...form, studentId: event.target.value })
                }
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option
                    key={student.studentId}
                    value={student.studentId}
                  >
                    {student.name} — #{student.studentId}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Subject
              <div className="field">
                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    setForm({ ...form, subject: event.target.value })
                  }
                  placeholder="Computer Networks"
                  required
                />
              </div>
            </label>

            <label>
              Marks
              <div className="field">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={form.marks}
                  onChange={(event) =>
                    setForm({ ...form, marks: event.target.value })
                  }
                  required
                />
              </div>
            </label>

            <button className="primary" type="submit" disabled={busy}>
              <Plus size={16} />
              {busy ? "Saving..." : "Save result"}
            </button>
          </form>
        </div>

        <div className="panel tablepanel">
          <div className="panelhead">
            <div>
              <h3>Result records</h3>
              <p>{results.length} result record(s)</p>
            </div>

            <button
              type="button"
              className="tiny"
              title="Refresh results"
              onClick={loadResults}
              disabled={busy}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Result ID</th>
                  <th>Student ID</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {results.map((result) => {
                  const isEditing = editingId === result.resultId;

                  return (
                    <tr key={result.resultId}>
                      <td>{result.resultId}</td>
                      <td>{result.studentId}</td>

                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.subject}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                subject: event.target.value,
                              })
                            }
                            aria-label="Edit subject"
                            required
                          />
                        ) : (
                          result.subject
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={editForm.marks}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                marks: event.target.value,
                              })
                            }
                            aria-label="Edit marks"
                            required
                          />
                        ) : (
                          <b>{result.marks}</b>
                        )}
                      </td>

                      <td>
                        <b className="grade">{result.grade}</b>
                      </td>

                      <td>
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="tiny"
                              title="Save changes"
                              aria-label="Save changes"
                              disabled={busy}
                              onClick={() =>
                                handleSaveEdit(result.resultId)
                              }
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              className="tiny"
                              title="Cancel editing"
                              aria-label="Cancel editing"
                              disabled={busy}
                              onClick={handleCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="tiny"
                              title="Edit result"
                              aria-label="Edit result"
                              onClick={() => handleEdit(result)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              className="tiny danger"
                              title="Delete result"
                              aria-label="Delete result"
                              onClick={() => handleDelete(result.resultId)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {results.length === 0 && (
                  <tr>
                    <td colSpan="6">No result records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
