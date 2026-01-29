import React, { useState, useEffect } from "react";

export default function ContactForm({ onSave, editing }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setEmail(editing.email || "");
      setPhone(editing.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [editing]);

  const submit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, email, phone });
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 400 }}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
      <button type="submit">{editing ? "Update" : "Add"}</button>
    </form>
  );
}
