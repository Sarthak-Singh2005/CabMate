const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function isAllowedMediaType(mimeType) {
  return typeof mimeType === "string" && ALLOWED_MIME_TYPES.has(mimeType);
}

function validateAttachment(attachment) {
  if (!attachment || typeof attachment !== "object") {
    return { valid: false, message: "Attachment is required." };
  }

  if (!attachment.url || !attachment.fileName || !attachment.mimeType) {
    return { valid: false, message: "Attachment details are incomplete." };
  }

  if (!isAllowedMediaType(attachment.mimeType)) {
    return { valid: false, message: "Only JPG, PNG, WEBP, GIF, and PDF files are allowed." };
  }

  return { valid: true };
}

module.exports = {
  ALLOWED_MIME_TYPES,
  isAllowedMediaType,
  validateAttachment,
};
