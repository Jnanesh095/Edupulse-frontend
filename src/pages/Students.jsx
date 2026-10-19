
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../api/students";

import { useAuth } from "../context/AuthContext";
import { addNotification } from "../utils/notifications";

export default function Students() {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const [form, setForm] = useState({
    name: "",
    studentClass: "B.Tech",
    section: "A",
  });

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await getStudents();
      setData(response.data || []);
      setErr("");
    } catch (error) {
      console.error("Unable to load students:", error);
      setErr("Unable to load students. Check the backend connection.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = data.filter((student) =>
    `${student.studentId} ${student.name} ${student.studentClass} ${student.section}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  function open(student) {
    setEdit(student || null);

    setForm(
      student
        ? {
            name: student.name || "",
            studentClass: student.studentClass || "",
            section: student.section || "",
          }
        : {
            name: "",
            studentClass: "B.Tech",
            section: "A",
          }
    );

    setErr("");
    setModal(true);
  }

  async function save(event) {
    event.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const payload = {
        name: form.name.trim(),
        studentClass: form.studentClass.trim(),
        section: form.section.trim(),
      };

      if (edit) {
        await updateStudent(edit.studentId, payload);

        addNotification(
          `Student "${payload.name}" (ID: ${edit.studentId}) was updated successfully.`,
          "success"
        );
      } else {
        const response = await createStudent(payload);
        const studentId = response.data?.studentId;

        addNotification(
          studentId != null
            ? `Student "${payload.name}" (ID: ${studentId}) was added successfully.`
            : `Student "${payload.name}" was added successfully.`,
          "success"
        );
      }

      setModal(false);
      setEdit(null);
      await load();
    } catch (error) {
      console.error("Unable to save student:", error);
      setErr(
        error.response?.data?.message || "Failed to save student."
      );
    } finally {
      setBusy(false);
    }
  }

  async function del(id) {
    if (!window.confirm("Delete this student?")) return;

    setErr("");

    try {
      const student = data.find((item) => item.studentId === id);

      await deleteStudent(id);

      addNotification(
        `Student "${student?.name || id}" (ID: ${id}) was deleted successfully.`,
        "warning"
      );

      await load();
    } catch (error) {
      console.error("Unable to delete student:", error);
      setErr("Failed to delete student.");
    }
  }

  return (
    <>
      <div className="pagehead row">
        <div>
          <span className="purple">ACADEMIC DIRECTORY</span>
          <h1>Students</h1>
          <p>Manage student profiles and academic identity.</p>
        </div>

        {user?.role === "ADMIN" && (
          <button
            type="button"
            className="primary smallbtn"
            onClick={() => open()}
          >
            <Plus size={16} /> Add student
          </button>
        )}
      </div>

      {err && <div className="error">{err}</div>}

      <div className="panel tablepanel">
        <div className="toolbar">
          <div className="searchbox">
            <Search size={18} />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search students..."
            />
          </div>

          <small>{list.length} students</small>
        </div>

        {list.length > 0 ? (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Status</th>
                  {user?.role === "ADMIN" && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {list.map((student) => (
                  <tr key={student.studentId}>
                    <td>#{student.studentId}</td>
                    <td><b>{student.name}</b></td>
                    <td>{student.studentClass}</td>
                    <td>{student.section}</td>
                    <td><i className="status">Active</i></td>

                    {user?.role === "ADMIN" && (
                      <td>
                        <button
                          type="button"
                          className="tiny"
                          title="Edit student"
                          onClick={() => open(student)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="tiny danger"
                          title="Delete student"
                          onClick={() => del(student.studentId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <Users size={28} />
            <h3>No students found</h3>
            <p>Add a student or change the search.</p>
          </div>
        )}
      </div>

      {modal && (
        <div className="modalbg">
          <div className="modal">
            <div className="modalhead">
              <h3>{edit ? "Edit student" : "Add student"}</h3>

              <button
                type="button"
                className="tiny"
                title="Close"
                onClick={() => {
                  setModal(false);
                  setEdit(null);
                  setErr("");
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={save}>
              <label>
                Name
                <div className="field">
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </div>
              </label>

              <label>
                Class
                <div className="field">
                  <input
                    value={form.studentClass}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        studentClass: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </label>

              <label>
                Section
                <div className="field">
                  <input
                    value={form.section}
                    onChange={(event) =>
                      setForm({ ...form, section: event.target.value })
                    }
                    required
                  />
                </div>
              </label>

              <button
                className="primary"
                type="submit"
                disabled={busy}
              >
                {busy ? "Saving..." : "Save student"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
