import React from "react";

export default function ProductActions({
  product,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  isSubmitting = false,
  isDeleting = false,
  isExpandedView = false,
}) {
  const { id, status } = product;

  // Status Action Rules
  const canEdit = ["draft", "changes_required", "approved", "rejected"].includes(status);
  const canDelete = ["draft", "changes_required", "approved", "rejected"].includes(status);
  const canSubmit = status === "draft";
  const canResubmit = status === "changes_required";
  const canReapply = status === "rejected";
  const canReverify = status === "approved";

  const getSubmitLabel = () => {
    if (isSubmitting) return "Submitting...";
    if (canSubmit) return "Submit";
    if (canResubmit) return "Resubmit";
    if (canReapply) return "Re-apply";
    if (canReverify) return "Request Re-verification";
    return "Submit";
  };

  return (
    <div className="cw-actions-cell" onClick={(e) => e.stopPropagation()}>
      {!isExpandedView && onView && (
        <button
          type="button"
          className="cw-action-btn cw-action-view"
          onClick={() => onView(id)}
        >
          View
        </button>
      )}

      {canEdit && onEdit && (
        <button
          type="button"
          className="cw-action-btn cw-action-edit"
          onClick={() => onEdit(id)}
        >
          Edit
        </button>
      )}

      {canDelete && onDelete && (
        <button
          type="button"
          className="cw-action-btn cw-action-delete"
          disabled={isDeleting}
          onClick={(e) => onDelete(e, product)}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      )}

      {(canSubmit || canResubmit || canReapply || canReverify) && onSubmit && (
        <button
          type="button"
          className={`cw-action-btn ${
            canReverify ? "cw-action-reverify" : "cw-action-submit"
          }`}
          disabled={isSubmitting}
          onClick={(e) => onSubmit(e, id)}
        >
          {getSubmitLabel()}
        </button>
      )}
    </div>
  );
}