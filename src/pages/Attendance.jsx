
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, CalendarCheck2, RefreshCw } from "lucide-react";
import {
  getAttendance,
  createAttendance,
  deleteAttendance,
} from "../api/attendance";
import { getStudents } from "../api/students";
import { addNotification } from "../utils/notifications";

export default function Attendance() {
  const [a, setA] = useState([]);
  const [s, setS] = useState([]);
  const [f, setF] = useState({
    studentId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "PRESENT",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAttendance();
      setA(Array.isArray(response.data) ? response.data : []);
      setErr("");
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    getStudents()
      .then((response) => {
        setS(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setErr("Unable to load students. Check Student Service.");
      });
  }, [load]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const studentId = Number(f.studentId);
    const student = s.find(
      (item) => Number(item.studentId) === studentId
    );

    try {
      await createAttendance({
        studentId,
        date: f.date,
        status: f.status,
      });

      addNotification(
        `Attendance marked ${f.status} for ${
          student?.name || `Student #${studentId}`
        } on ${f.date}.`,
        "success"
      );

      await load();

      setF((previous) => ({
        ...previous,
        studentId: "",
        status: "PRESENT",
      }));
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeAttendance(id) {
    if (!window.confirm(`Delete attendance record #${id}?`)) {
      return;
    }

    setErr("");

    try {
      const record = a.find(
        (item) => item.attendanceId === id
      );

      await deleteAttendance(id);

      addNotification(
        `Attendance record #${id} for Student #${
          record?.studentId ?? "Unknown"
        } was deleted.`,
        "warning"
      );

      await load();
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete attendance."
      );
    }
  }

  return (
    <>
      <div className="pagehead">
        <span className="purple">DAILY TRACKING</span>
        <h1>Attendance</h1>
        <p>Record and review student attendance.</p>
      </div>

      {err && <div className="error">{err}</div>}

      <div className="twocol">
        <div className="panel">
          <div className="panelhead">
            <div>
              <h3>Record attendance</h3>
              <p>Student is validated through Student Service.</p>
            </div>
            <CalendarCheck2 />
          </div>

          <form onSubmit={save}>
            <label>
              Student
              <select
                value={f.studentId}
                onChange={(e) =>
                  setF({ ...f, studentId: e.target.value })
                }
                required
              >
                <option value="">Select student</option>
                {s.map((student) => (
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
              Date
              <div className="field">
                <input
                  type="date"
                  value={f.date}
                  onChange={(e) =>
                    setF({ ...f, date: e.target.value })
                  }
                  required
                />
              </div>
            </label>

            <label>
              Status
              <select
                value={f.status}
                onChange={(e) =>
                  setF({ ...f, status: e.target.value })
                }
              >
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </label>

            <button className="primary" disabled={saving}>
              <Plus />
              {saving ? "Saving..." : "Save attendance"}
            </button>
          </form>
        </div>

        <div className="panel tablepanel">
          <div className="panelhead">
            <h3>Attendance history</h3>
            <button
              type="button"
              className="tiny"
              onClick={load}
              disabled={loading}
              title="Refresh attendance"
            >
              <RefreshCw />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {a.map((record) => (
                  <tr key={record.attendanceId}>
                    <td>#{record.attendanceId}</td>
                    <td>Student #{record.studentId}</td>
                    <td>{record.date}</td>
                    <td>
                      <i
                        className={
                          record.status?.toUpperCase() === "PRESENT"
                            ? "status"
                            : "absent"
                        }
                      >
                        {record.status}
                      </i>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="tiny danger"
                        onClick={() =>
                          removeAttendance(record.attendanceId)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && a.length === 0 && (
                  <tr>
                    <td colSpan="5">No attendance records found.</td>
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
