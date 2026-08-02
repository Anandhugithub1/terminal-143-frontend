import React, { useState, useRef } from "react";

export default function ReportUserModal({
  open,
  onClose,
  username,
  onSubmit,
  sourceType,
  sourceService,
  sourceId,
  circleId,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);

  if (!open) return null;


const reasons = [
  { label: "Spam", value: "spam" },
  { label: "Fake profile", value: "fake_profile" },
  { label: "Harassment or abusive behavior", value: "harassment" },
  { label: "Hate speech", value: "hate_speech" },
  { label: "Nudity", value: "nudity" },
  { label: "Inappropriate photos", value: "inappropriate_photos" },
  { label: "Other", value: "other" }
];
  const handleSubmit = () => {
    if (!reason) return;

    onSubmit({
      reportedUsername: username,
      reason,
      description,
      sourceType,
      sourceService,
      sourceId,
      circleId,
    });

    setReason("");
    setDescription("");
    onClose();
  };

  // Start dragging
  const handleStart = (e) => {
    dragging.current = true;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
  };

  // Move sheet
  const handleMove = (e) => {
    if (!dragging.current) return;

    currentY.current = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  // Release drag
  const handleEnd = () => {
    dragging.current = false;

    const diff = currentY.current - startY.current;

    if (diff > 120) {
      onClose(); // close if dragged enough
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(0px)`;
    }
  };

  return (
    <div
      // z-[200]: matches the rest of the app's modal convention (see
      // shared/components/BottomSheetModal.jsx) and sits strictly above
      // BottomNav's z-50 (fixed, mounted alongside the page this modal opens
      // on top of). Equal z-index left stacking order to DOM position, and
      // the nav bar being fixed + later in the tree let it render over the
      // sheet's bottom edge — visually hiding the Cancel/Submit buttons even
      // though they existed in the DOM below.
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
     className="w-full max-w-lg bg-white rounded-t-3xl transition-transform max-h-[85vh] flex flex-col mb-[env(safe-area-inset-bottom)]"
      >
        {/* drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2 shrink-0"></div>

        {/* Scrollable content — header/reasons/description all scroll together
            here, so on a short viewport the sheet itself scrolls instead of
            silently overflowing max-h-[85vh] with no way to reach it (that's
            what was pushing Cancel/Submit off-screen below the sheet with
            nothing scrollable to bring them back into view). */}
        <div className="overflow-y-auto px-6">
          <h2 className="text-xl font-semibold text-center text-gray-900">
            Report User
          </h2>

          <p className="text-sm text-gray-500 text-center mt-1 mb-5">
            Help keep the community safe by reporting inappropriate behaviour.
          </p>

          {/* reasons */}
          <div className="space-y-3">
        {reasons.map((r) => {
    const selected = reason === r.value;

    return (
      <button
        key={r.value}
        onClick={() => setReason(r.value)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition
        ${
          selected
            ? "border-primary bg-primary/10"
            : "border-border-clr hover:bg-gray-50"
        }`}
      >
        <span className="text-sm font-medium text-gray-800">{r.label}</span>

        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center
          ${
            selected
              ? "border-primary bg-primary"
              : "border-gray-300"
          }`}
        >
          {selected && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
      </button>
    );
  })}
          </div>

          {/* description */}
          <textarea
            placeholder="Add more details (optional)"
            className="mt-5 w-full border border-border-clr bg-input rounded-xl p-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-focus"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* actions — outside the scroll area, always visible at the bottom
            of the sheet regardless of how tall the reasons list gets */}
        <div className="flex gap-3 p-6 pt-5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border-clr text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={!reason}
            onClick={handleSubmit}
            className={`flex-1 py-3 rounded-xl text-white font-medium transition
            ${
              reason
                ? "bg-primary hover:opacity-90"
                : "bg-primary/50 cursor-not-allowed"
            }`}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}