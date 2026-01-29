import React, { useEffect, useState } from "react";
import { api } from "./api";
import ContactForm from "./components/ContactForm.jsx";
import ContactList from "./components/ContactList.jsx";
import "./styles/global.css";

export default function App() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/contacts");
      setItems(data);
    } catch {
      setErr("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => {
    const { data } = await api.post("/contacts", payload);
    setItems([data, ...items]);
  };

  const update = async (id, payload) => {
    const { data } = await api.put(`/contacts/${id}`, payload);
    setItems(items.map(i => i.id === id ? data : i));
    setEditing(null);
  };

  const remove = async (id) => {
    await api.delete(`/contacts/${id}`);
    setItems(items.filter(i => i.id !== id));
  };

  const onSave = (payload) => {
    editing ? update(editing.id, payload) : create(payload);
  };

  return (
    <div style={{
      maxWidth: 850,
      margin: "40px auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Contact Book</h1>

      {err && <p style={{ color: "red" }}>{err}</p>}

      <ContactForm onSave={onSave} editing={editing} />

      <hr style={{ margin: "20px 0" }} />

      {loading
        ? <p>Loading...</p>
        : <ContactList items={items} onEdit={setEditing} onDelete={remove} />
      }
    </div>
  );
}
