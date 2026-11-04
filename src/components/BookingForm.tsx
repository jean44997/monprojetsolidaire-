import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/data/properties";
import { toast } from "sonner";

export function BookingForm({ propertyName }: { propertyName?: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "Information",
    message: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Veuillez renseigner votre nom et téléphone.");
      return;
    }
    const text =
      `Bonjour Monprojetsolidaire,%0A` +
      `Je vous contacte${propertyName ? ` au sujet de : *${propertyName}*` : ""}.%0A` +
      `Nom : ${form.name}%0A` +
      `Téléphone : ${form.phone}%0A` +
      (form.email ? `Email : ${form.email}%0A` : "") +
      `Intérêt : ${form.interest}%0A` +
      (form.message ? `Message : ${form.message}` : "");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    toast.success("Message prêt à être envoyé sur WhatsApp.");
  };

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet *</label>
          <input name="name" value={form.name} onChange={onChange} className={inputCls} required maxLength={100} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone *</label>
          <input name="phone" value={form.phone} onChange={onChange} className={inputCls} required maxLength={30} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls} maxLength={150} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Je suis intéressé(e) par</label>
        <select name="interest" value={form.interest} onChange={onChange} className={inputCls}>
          <option>Information</option>
          <option>Visite</option>
          <option>Achat</option>
          <option>Location</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea name="message" value={form.message} onChange={onChange} rows={4} className={inputCls} maxLength={500} />
      </div>
      <button type="submit" className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
        Envoyer ma demande
      </button>
    </form>
  );
}
