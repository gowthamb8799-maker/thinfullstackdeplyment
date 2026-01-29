import React from "react";

export default function ContactList({ items, onEdit, onDelete }) {
  if (!items.length) return <p>No contacts yet.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
      {items.map(c => (
        <li key={c.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <strong>{c.name}</strong>
          <div>{c.email}</div>
          <div>{c.phone}</div>

          <button onClick={() => onEdit(c)} style={{ marginRight: 8 }}>Edit</button>
          <button onClick={() => onDelete(c.id)} style={{ background: "#fdd" }}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
