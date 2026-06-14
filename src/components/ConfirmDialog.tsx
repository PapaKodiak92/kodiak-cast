import './ConfirmDialog.css';

type ConfirmationVariant = 'default' | 'danger';

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: ConfirmationVariant;
};

export function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  title,
  variant = 'default'
}: ConfirmDialogProps) {
  return (
    <div className="confirm-overlay" role="presentation">
      <section
        aria-describedby="confirm-dialog-message"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className={`confirm-dialog ${variant}`}
        role="alertdialog"
      >
        <div className="confirm-icon" aria-hidden="true">
          KC
        </div>

        <div className="confirm-copy">
          <p className="eyebrow">Confirm action</p>
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-message">{message}</p>
        </div>

        <div className="confirm-actions">
          <button className="secondary-button" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className="confirm-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
