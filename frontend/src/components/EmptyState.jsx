import { FileText } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><FileText /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
