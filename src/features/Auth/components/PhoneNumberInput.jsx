import { useEffect, useRef } from "react";
import intlTelInput from "intl-tel-input/intlTelInputWithUtils";
import "intl-tel-input/styles";

// The app's current region-gated markets (same list shown in the
// "Available in" section lower on the registration form), plus the app's
// other supported UI languages (Chinese, Russian, Korean) that aren't part
// of that region-gate list, and the US. Pinned to the top of the country
// dropdown in this explicit order, so most users never have to scroll past
// ~240 alphabetical countries to find their own. Doesn't limit which
// country CAN be selected/searched — see `countryOrder` in the
// intlTelInput() call below, which only re-sorts the list; every other
// country is still present and searchable.
const PRIORITY_COUNTRY_ORDER = [
  "th",
  "cn",
  "ru",
  "kr",
  "ph",
  "my",
  "id",
  "kh",
  "us",
  "vn",
];

// intl-tel-input is vanilla JS (updated as recently as yesterday at the
// time this was written — actively maintained, unlike every React-native
// phone-input package with a real searchable country dropdown, which
// turned out to be either years-stale or missing search entirely).
//
// It doesn't just attach behavior to the <input> — it physically moves it:
// `telInputEl.before(wrapper)` then `wrapper.appendChild(telInputEl)`
// relocates the input into a new `.iti` wrapper div it creates (see
// intlTelInputWithUtils.mjs). If that <input> is rendered directly as
// this component's JSX, React still believes it owns that node's position
// in the tree — the next time React re-renders/unmounts around it (e.g.
// RegisterForm re-rendering on an unrelated keystroke), it tries to
// remove the input from where it originally placed it, but the node has
// since been moved elsewhere by intl-tel-input → "Failed to execute
// 'removeChild' on 'Node': the node to be removed is not a child of this
// node." React and an imperative DOM-mutating library can't both own the
// same element.
//
// Fix: give React a single, permanently-empty container div to render
// (something it mounts once and never has a reason to diff into again),
// and build the actual <input> + intl-tel-input instance entirely inside
// useEffect via plain DOM APIs. React never sees the input as part of its
// own tree, so it never tries to reconcile a node that isn't where it
// left it.
export default function PhoneNumberInput({
  value,
  onChange,
  onValidityChange,
  placeholder,
  disabled,
  defaultCountry = "th",
}) {
  const containerRef = useRef(null);
  const itiRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const input = document.createElement("input");
    input.type = "tel";
    input.className = "py-3";
    if (placeholder) input.placeholder = placeholder;
    if (disabled) input.disabled = true;
    container.appendChild(input);

    const iti = intlTelInput(input, {
      initialCountry: defaultCountry,
      separateDialCode: true,
      countrySearch: true,
      countryOrder: PRIORITY_COUNTRY_ORDER,
      uiTranslations: {
        searchPlaceholder: "Search for country or code",
      },
      // formatAsYouType (default true) plus the number.mjs formatting
      // utils bundled in intlTelInputWithUtils — no separate async
      // utils fetch needed for validation/formatting.
    });
    itiRef.current = iti;

    const handleChange = () => {
      // getNumber() returns E.164 (e.g. "+66812345678") once the number
      // is complete enough to parse; while still typing (or on an
      // invalid/partial number) it can return "" — fall back to the
      // raw input text in that case so the field never appears to
      // silently discard what was typed.
      const e164 = iti.getNumber();
      onChangeRef.current(e164 || input.value);
      // isValidNumber() checks the digits against the selected country's
      // real length/pattern rules (via the bundled utils), so an
      // all-zeros or too-short/too-long entry like "00000000" reports
      // false instead of silently passing through as a plausible number.
      // Empty input isn't "invalid" yet — required-ness is a separate
      // check the form does on submit.
      onValidityChangeRef.current?.(
        input.value === "" ? null : iti.isValidNumber()
      );
    };

    input.addEventListener("input", handleChange);
    input.addEventListener("countrychange", handleChange);

    return () => {
      input.removeEventListener("input", handleChange);
      input.removeEventListener("countrychange", handleChange);
      iti.destroy();
      itiRef.current = null;
      // iti.destroy() removes the .iti wrapper it built but leaves the
      // original <input> behind in whatever position it ended up in —
      // clear the container ourselves so a remount starts from empty
      // rather than accumulating stale nodes.
      container.replaceChildren();
    };
    // defaultCountry only applies at construction time (initialCountry) —
    // changing it after mount would require re-initializing the whole
    // widget, which isn't a case this component needs to support.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // placeholder/disabled are applied once at construction (above); syncing
  // them live would need re-reaching into the DOM node intl-tel-input has
  // since wrapped, which is exactly the kind of React/DOM tug-of-war this
  // component exists to avoid. Neither prop changes after mount in this
  // form, so it isn't a real gap.

  useEffect(() => {
    if (!itiRef.current) return;
    // Keep the widget in sync if `value` is cleared/reset externally
    // (e.g. a form reset) without the user typing — setNumber("") is a
    // no-op if the field already matches, so this doesn't fight typing.
    if (!value) {
      itiRef.current.setNumber("");
    }
  }, [value]);

  return <div ref={containerRef} />;
}
