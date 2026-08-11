// src/shared/api/getErrorMessage.js
// Single source of truth for turning an axios error into a translated,
// user-facing string. The backend is not fully uniform yet (most services
// return {error: msg}, a couple return {message: msg} or {success:false,
// message: msg}) so this reads all three shapes rather than assuming one.
import i18n from '../../i18n/i18n';

// Backend error message -> errors.json key. Matched by substring so minor
// wording differences (e.g. an interpolated field name) still resolve.
const MESSAGE_KEY_MAP = [
  [/profile already exists/i, 'profileAlreadyExists'],
  [/profile not found/i, 'profileNotFound'],
  [/required$/i, 'missingRequiredField'],
  [/invalid date of birth/i, 'invalidDob'],
  [/must be at least 18/i, 'underAge'],
  [/only one photo allowed/i, 'photoLimitSingle'],
  [/max \d+ photos allowed/i, 'photoLimitMulti'],
  [/each photo must have a valid url/i, 'photoInvalidUrl'],
  [/gender required to update/i, 'genderRequiredForUpdate'],
  [/no updatable fields/i, 'noUpdatableFields'],
  [/recently restored your account/i, 'restoreCooldown'],
  [/name required/i, 'circleNameRequired'],
  [/circle not found/i, 'circleNotFound'],
  [/already a member/i, 'alreadyMember'],
  [/not a member of this circle/i, 'notAMember'],
  [/this circle is not private/i, 'circleNotPrivate'],
  [/this circle is private/i, 'circleIsPrivate'],
  [/join request not found/i, 'requestNotFound'],
  [/join request already resolved/i, 'requestAlreadyResolved'],
  [/cannot remove the circle owner|cannot change the owner/i, 'cannotRemoveOwner'],
  [/moderators cannot remove other moderators|only the owner can/i, 'cannotActOnModerator'],
  [/user is blocked/i, 'userBlocked'],
  [/sender profile not found/i, 'senderProfileNotFound'],
  [/missing a valid date of birth/i, 'missingDobForRequest'],
  [/support tickets within 24 hours/i, 'supportTicketLimit'],
  [/invalid moderation action/i, 'invalidModerationAction'],
  [/rating must be 1-5/i, 'ratingRange'],
  [/text must be 5-300 chars/i, 'reviewTextLength'],
  [/password did not conform with policy|password.*not long enough/i, 'passwordTooShort'],
  [/invalid verification code|invalid code provided/i, 'invalidOtp'],
  [/attempt limit exceeded/i, 'tooManyRequests'],
];

const STATUS_KEY_MAP = {
  400: 'badRequest',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'notFound',
  409: 'conflict',
  429: 'tooManyRequests',
};

function keyForBackendMessage(message) {
  if (typeof message !== 'string') return null;
  const hit = MESSAGE_KEY_MAP.find(([pattern]) => pattern.test(message));
  return hit ? hit[1] : null;
}

function keyForStatus(status) {
  if (!status) return null;
  if (STATUS_KEY_MAP[status]) return STATUS_KEY_MAP[status];
  if (status >= 500) return 'server';
  return null;
}

// getErrorMessage(err, fallbackKey?) -> translated string
// fallbackKey lets a call site pick a more specific default (an errors.json
// key) than the generic one when nothing else matches.
export function getErrorMessage(err, fallbackKey = 'generic') {
  const t = i18n.t.bind(i18n);

  const data = err?.response?.data;
  const backendMessage =
    (typeof data?.error === 'string' && data.error) ||
    (typeof data?.message === 'string' && data.message) ||
    null;

  const messageKey = keyForBackendMessage(backendMessage);
  if (messageKey) return t(`errors:${messageKey}`);

  const status = err?.response?.status;
  // 401 defaults to "session expired," which is wrong for a call site like
  // login where a 401 just means bad credentials and there was never a
  // session to expire. An explicit fallbackKey signals that case — honor it
  // instead of the generic status mapping.
  const statusKey = status === 401 && fallbackKey !== 'generic' ? null : keyForStatus(status);
  if (statusKey) return t(`errors:${statusKey}`);

  if (err?.code === 'ECONNABORTED') return t('errors:timeout');
  if (!err?.response && (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK')) {
    return t('errors:network');
  }

  // No mapped key and no backend message we recognize — surface the
  // backend's own text if it gave us one (better than a generic string),
  // otherwise fall back to the caller's choice or the generic message.
  if (backendMessage) return backendMessage;
  return t(`errors:${fallbackKey}`);
}
