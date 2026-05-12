import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "edu_planner_subjects";

const COLORS = [
  { bg: "#FFE0B2", accent: "#FF6D00", light: "#FFF3E0" },
  { bg: "#E1F5FE", accent: "#0288D1", light: "#E3F2FD" },
  { bg: "#E8F5E9", accent: "#2E7D32", light: "#F1F8E9" },
  { bg: "#F3E5F5", accent: "#7B1FA2", light: "#FCE4EC" },
  { bg: "#FFF9C4", accent: "#F9A825", light: "#FFFDE7" },
  { bg: "#FCE4EC", accent: "#C62828", light: "#FFF0F3" },
  { bg: "#E0F2F1", accent: "#00695C", light: "#E8F5E9" },
  { bg: "#EDE7F6", accent: "#4527A0", light: "#F3E5F5" },
];

let colorIndex = 0;
function getNextColor() {
  const c = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return c;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

export default function EducationPlanner() {
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore colorIndex based on saved data
        colorIndex = parsed.length % COLORS.length;
        return parsed;
      }
    } catch {}
    return [];
  });

  const [subjectName, setSubjectName] = useState("");
  const [hours, setHours] = useState(1);
  const [inputError, setInputError] = useState("");
  const [justAdded, setJustAdded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const totalHours = subjects.reduce((sum, s) => sum + s.hours, 0);

  function handleAdd() {
    const name = subjectName.trim();
    if (!name) {
      setInputError("Please enter a subject name.");
      inputRef.current?.focus();
      return;
    }
    if (subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setInputError("Subject already exists.");
      return;
    }
    const newSubject = {
      id: generateId(),
      name,
      hours,
      color: getNextColor(),
    };
    setSubjects((prev) => [...prev, newSubject]);
    setJustAdded(newSubject.id);
    setTimeout(() => setJustAdded(null), 600);
    setSubjectName("");
    setHours(1);
    setInputError("");
    inputRef.current?.focus();
  }

  function adjustHours(id, delta) {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, hours: Math.max(1, s.hours + delta) } : s
      )
    );
  }

  function removeSubject(id) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  function startEdit(s) {
    setEditingId(s.id);
    setEditName(s.name);
  }

  function saveEdit(id) {
    const name = editName.trim();
    if (!name) return;
    if (
      subjects.some(
        (s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      return;
    }
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
    setEditingId(null);
  }

  function clearAll() {
    if (subjects.length === 0) return;
    if (window.confirm("Clear all subjects?")) {
      setSubjects([]);
      colorIndex = 0;
    }
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function distributeHours(hours) {
    const base = Math.floor(hours / 7);
    const rem = hours % 7;
    return weekDays.map((d, i) => ({ day: d, h: base + (i < rem ? 1 : 0) }));
  }

  return (
    <div style={styles.root}>
      {/* Background decoration */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoIcon}>📚</span>
            <div>
              <h1 style={styles.title}>Study Planner</h1>
              <p style={styles.subtitle}>Organize. Focus. Achieve.</p>
            </div>
          </div>
          <div style={styles.statsBadge}>
            <span style={styles.statsNum}>{subjects.length}</span>
            <span style={styles.statsLabel}>Subjects</span>
            <span style={styles.statsDivider} />
            <span style={styles.statsNum}>{totalHours}</span>
            <span style={styles.statsLabel}>Hours/week</span>
          </div>
        </header>

        {/* Add Subject Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add New Subject</h2>
          <div style={styles.formRow}>
            <div style={styles.inputWrapper}>
              <input
                ref={inputRef}
                style={{
                  ...styles.input,
                  borderColor: inputError ? "#ef4444" : "#e2e8f0",
                }}
                placeholder="e.g. Mathematics, Physics..."
                value={subjectName}
                onChange={(e) => {
                  setSubjectName(e.target.value);
                  if (inputError) setInputError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              {inputError && <span style={styles.errorMsg}>{inputError}</span>}
            </div>

            <div style={styles.hoursControl}>
              <button
                style={styles.hourBtn}
                onClick={() => setHours((h) => Math.max(1, h - 1))}
              >
                −
              </button>
              <div style={styles.hoursDisplay}>
                <span style={styles.hoursNum}>{hours}</span>
                <span style={styles.hoursLabel}>hrs/wk</span>
              </div>
              <button
                style={styles.hourBtn}
                onClick={() => setHours((h) => h + 1)}
              >
                +
              </button>
            </div>

            <button style={styles.addBtn} onClick={handleAdd}>
              + Add
            </button>
          </div>
        </div>

        {/* Subject List */}
        {subjects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎯</div>
            <p style={styles.emptyText}>No subjects yet.</p>
            <p style={styles.emptyHint}>Add your first subject above to get started!</p>
          </div>
        ) : (
          <>
            <div style={styles.listHeader}>
              <h2 style={styles.cardTitle}>Your Study Schedule</h2>
              <button style={styles.clearBtn} onClick={clearAll}>
                Clear All
              </button>
            </div>

            <div style={styles.subjectGrid}>
              {subjects.map((s) => (
                <div
                  key={s.id}
                  style={{
                    ...styles.subjectCard,
                    backgroundColor: s.color.light,
                    borderColor: s.color.bg,
                    transform: justAdded === s.id ? "scale(1.03)" : "scale(1)",
                    transition: "transform 0.3s ease, box-shadow 0.2s",
                  }}
                >
                  {/* Color bar */}
                  <div
                    style={{
                      ...styles.colorBar,
                      backgroundColor: s.color.accent,
                    }}
                  />

                  {/* Subject name */}
                  <div style={styles.subjectTop}>
                    {editingId === s.id ? (
                      <input
                        style={styles.editInput}
                        value={editName}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(s.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <h3
                        style={styles.subjectName}
                        onClick={() => startEdit(s)}
                        title="Click to rename"
                      >
                        {s.name}
                      </h3>
                    )}
                    <button
                      style={styles.deleteBtn}
                      onClick={() => removeSubject(s.id)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>

                  {/* Hours adjuster */}
                  <div style={styles.adjusterRow}>
                    <button
                      style={{
                        ...styles.adjBtn,
                        backgroundColor: s.color.bg,
                        color: s.color.accent,
                      }}
                      onClick={() => adjustHours(s.id, -1)}
                      disabled={s.hours <= 1}
                    >
                      −
                    </button>
                    <div style={styles.hoursBox}>
                      <span
                        style={{ ...styles.hoursBoxNum, color: s.color.accent }}
                      >
                        {s.hours}
                      </span>
                      <span style={styles.hoursBoxLabel}>hrs / week</span>
                    </div>
                    <button
                      style={{
                        ...styles.adjBtn,
                        backgroundColor: s.color.bg,
                        color: s.color.accent,
                      }}
                      onClick={() => adjustHours(s.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Mini weekly bar */}
                  <div style={styles.weekRow}>
                    {distributeHours(s.hours).map(({ day, h }) => (
                      <div key={day} style={styles.dayCol}>
                        <div
                          style={{
                            ...styles.dayBar,
                            height: `${Math.min(32, h * 10 + 4)}px`,
                            backgroundColor: s.color.accent,
                            opacity: h === 0 ? 0.15 : 0.8,
                          }}
                        />
                        <span style={styles.dayLabel}>{day}</span>
                        {h > 0 && (
                          <span style={{ ...styles.dayHours, color: s.color.accent }}>
                            {h}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={styles.summary}>
              <h2 style={styles.cardTitle}>Weekly Overview</h2>
              <div style={styles.summaryBars}>
                {subjects.map((s) => (
                  <div key={s.id} style={styles.summaryRow}>
                    <span style={styles.summaryName}>{s.name}</span>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${Math.min(100, (s.hours / totalHours) * 100)}%`,
                          backgroundColor: s.color.accent,
                        }}
                      />
                    </div>
                    <span style={{ ...styles.summaryHrs, color: s.color.accent }}>
                      {s.hours}h
                    </span>
                    <span style={styles.summaryPct}>
                      {Math.round((s.hours / totalHours) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total study time</span>
                <span style={styles.totalHours}>{totalHours} hrs / week</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #faf0ff 50%, #fff5f0 100%)",
    fontFamily: "'Georgia', 'Cambria', serif",
    position: "relative",
    overflow: "hidden",
    padding: "0 0 60px 0",
  },
  bgBlob1: {
    position: "fixed",
    top: "-120px",
    right: "-120px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "fixed",
    bottom: "-80px",
    left: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,191,36,0.13) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "32px 20px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    fontSize: "42px",
    lineHeight: 1,
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e1b4b",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: "13px",
    color: "#7c6f9f",
    letterSpacing: "2px",
    textTransform: "uppercase",
    fontFamily: "sans-serif",
  },
  statsBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    border: "1px solid #e8e0ff",
    borderRadius: "40px",
    padding: "10px 20px",
    boxShadow: "0 2px 12px rgba(100,80,200,0.08)",
  },
  statsNum: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#4f46e5",
  },
  statsLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "sans-serif",
  },
  statsDivider: {
    width: "1px",
    height: "24px",
    background: "#e8e0ff",
    margin: "0 4px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 24px rgba(79,70,229,0.08)",
    border: "1px solid #ede9ff",
    marginBottom: "28px",
  },
  cardTitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e1b4b",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    fontFamily: "sans-serif",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  inputWrapper: {
    flex: "1 1 220px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "13px 18px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "15px",
    fontFamily: "inherit",
    color: "#1e1b4b",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8f7ff",
    boxSizing: "border-box",
  },
  errorMsg: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "5px",
    fontFamily: "sans-serif",
  },
  hoursControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8f7ff",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    padding: "8px 12px",
  },
  hourBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    border: "none",
    background: "#ede9ff",
    color: "#4f46e5",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  hoursDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "44px",
  },
  hoursNum: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#4f46e5",
    lineHeight: 1,
  },
  hoursLabel: {
    fontSize: "10px",
    color: "#9ca3af",
    fontFamily: "sans-serif",
    textTransform: "uppercase",
  },
  addBtn: {
    padding: "13px 26px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
    transition: "transform 0.15s, box-shadow 0.15s",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "20px",
    border: "2px dashed #ede9ff",
  },
  emptyIcon: {
    fontSize: "52px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#4f46e5",
    margin: "0 0 8px",
  },
  emptyHint: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
    fontFamily: "sans-serif",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  clearBtn: {
    padding: "6px 16px",
    borderRadius: "8px",
    border: "1px solid #fca5a5",
    background: "#fff5f5",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
  subjectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },
  subjectCard: {
    borderRadius: "18px",
    border: "1.5px solid",
    overflow: "hidden",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    position: "relative",
  },
  colorBar: {
    height: "5px",
    width: "100%",
  },
  subjectTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 8px",
  },
  subjectName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e1b4b",
    cursor: "pointer",
    flex: 1,
  },
  editInput: {
    flex: 1,
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e1b4b",
    border: "1px solid #c4b5fd",
    borderRadius: "8px",
    padding: "4px 8px",
    background: "white",
    fontFamily: "inherit",
    outline: "none",
  },
  deleteBtn: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.08)",
    color: "#6b7280",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    marginLeft: "8px",
    flexShrink: 0,
  },
  adjusterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "8px 16px",
  },
  adjBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "none",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    transition: "transform 0.1s",
  },
  hoursBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "64px",
  },
  hoursBoxNum: {
    fontSize: "26px",
    fontWeight: "700",
    lineHeight: 1,
  },
  hoursBoxLabel: {
    fontSize: "10px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "sans-serif",
  },
  weekRow: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 14px 14px",
    alignItems: "flex-end",
    gap: "2px",
  },
  dayCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    flex: 1,
  },
  dayBar: {
    width: "100%",
    maxWidth: "20px",
    borderRadius: "4px 4px 0 0",
    minHeight: "4px",
    transition: "height 0.3s ease",
  },
  dayLabel: {
    fontSize: "9px",
    color: "#9ca3af",
    fontFamily: "sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  dayHours: {
    fontSize: "9px",
    fontWeight: "700",
    fontFamily: "sans-serif",
  },
  summary: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 24px rgba(79,70,229,0.08)",
    border: "1px solid #ede9ff",
  },
  summaryBars: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  summaryName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e1b4b",
    width: "120px",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  barTrack: {
    flex: 1,
    height: "10px",
    background: "#f3f4f6",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.4s ease",
  },
  summaryHrs: {
    fontSize: "13px",
    fontWeight: "700",
    width: "30px",
    textAlign: "right",
    fontFamily: "sans-serif",
  },
  summaryPct: {
    fontSize: "12px",
    color: "#9ca3af",
    width: "36px",
    textAlign: "right",
    fontFamily: "sans-serif",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  totalLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontFamily: "sans-serif",
  },
  totalHours: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#4f46e5",
    fontFamily: "sans-serif",
  },
};
