import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const handledHighlightLocationKey = useRef("");

  const [menuMessageId, setMenuMessageId] = useState("");
  const [editingMessageId, setEditingMessageId] = useState("");
  const [editText, setEditText] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768,
  );
  const [sheetMessageId, setSheetMessageId] = useState("");
  const isRideGroup = location.state?.chatSource?.isRideGroup;
  const [conversationInfo, setConversationInfo] = useState(null);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [savingGroup, setSavingGroup] = useState(false);
  const isGroupConversation =
    isRideGroup || conversationInfo?.type === "ride_group";
  const isGroupOwner =
    String(conversationInfo?.ownerId?._id || conversationInfo?.ownerId || "") ===
    String(currentUser);

  const isOwn = (msg) => String(msg.sender?._id) === String(currentUser);

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!viewingImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setViewingImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingImage]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data.messages);
      setCurrentUser(data.currentUser);
      setConversationInfo(data.conversation || null);
    } catch (err) {
      console.error(err);
    }
  }, [id]);
  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchMessages();
    }, 0);

    return () => clearTimeout(fetchTimer);
  }, [fetchMessages]);

  useEffect(() => {
    const handleIncoming = (message) => {
      if (String(message.conversationId) !== id) return;

      setMessages((prev) => [...prev, message]);
    };

    const handleEdited = (updatedMessage) => {
      if (String(updatedMessage.conversationId) !== id) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    };

    const handleDeleted = ({ messageId, conversationId }) => {
      if (conversationId && String(conversationId) !== id) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, deleted: true, text: "", edited: false }
            : msg,
        ),
      );
    };

    socket.on("chat:message", handleIncoming);
    socket.on("messageEdited", handleEdited);
    socket.on("messageDeleted", handleDeleted);
    return () => {
      socket.off("chat:message", handleIncoming);
      socket.off("messageEdited", handleEdited);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [id]);

  useEffect(() => {
    if (
      !location.state?.highlightLatestMessage ||
      !messages.length ||
      !currentUser ||
      handledHighlightLocationKey.current === location.key
    ) {
      return;
    }

    const targetMessage =
      [...messages]
        .reverse()
        .find(
          (message) => String(message.sender?._id) !== String(currentUser),
        ) ||
      messages[messages.length - 1];

    if (!targetMessage?._id) return;

    handledHighlightLocationKey.current = location.key;

    const scrollTimer = setTimeout(() => {
      setHighlightedMessageId(targetMessage._id);
      document
        .getElementById(`message-${targetMessage._id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const clearTimer = setTimeout(() => {
      setHighlightedMessageId("");
    }, 4000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [
    location.key,
    location.state?.highlightLatestMessage,
    messages,
    currentUser,
  ]);

  const sendMessage = async () => {
    try {
      setLoading(true);
      const trimmedText = text.trim();
      if (!trimmedText && selectedFiles.length === 0) {
        return;
      }

      const formData = new FormData();
      formData.append("conversationId", id);
      if (trimmedText) {
        formData.append("text", trimmedText);
      }
      selectedFiles.forEach((file) => {
        formData.append("files", file);
        console.log(`[Chat Upload] Adding file: ${file.name} (${file.type})`);
      });

      console.log(`[Chat] Sending message with ${selectedFiles.length} file(s)`);
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log(`[Chat] Response status: ${res.status}`);
      const data = await res.json();
      console.log(`[Chat] Response data:`, data);

      if (!res.ok) {
        throw new Error(data?.message || "Unable to send message");
      }

      setMessages((prev) => [...prev, data.newMessage]);
      setText("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("[Chat Error]", err);
      alert(err.message || "Unable to send this message.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setSelectedFiles([]);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));
    if (invalidFile) {
      alert("Only JPG, PNG, WEBP, GIF, and PDF files are allowed.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const startEdit = (msg) => {
    setMenuMessageId("");
    setSheetMessageId("");
    setEditingMessageId(msg._id);
    setEditText(msg.text);
  };

  const cancelEdit = () => {
    setEditingMessageId("");
    setEditText("");
  };

  const saveEdit = async (msgId) => {
    try {
      setEditing(true);
      const cleaned = editText.trim();
      if (!cleaned) return;

      const res = await fetch(
        `${API_BASE_URL}/api/chat/message/${msgId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: cleaned }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === msgId ? data.message : msg,
          ),
        );
      }
      setEditingMessageId("");
      setEditText("");
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/chat/message/${deleteTargetId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === deleteTargetId
              ? { ...msg, deleted: true, text: "", edited: false }
              : msg,
          ),
        );
      }
      setDeleteTargetId("");
    } catch (err) {
      console.error(err);
    }
  };

  const openGroupInfo = () => {
    setGroupNameDraft(conversationInfo?.groupName || "Ride Group");
    const ownerId = String(
      conversationInfo?.ownerId?._id || conversationInfo?.ownerId || "",
    );
    setGroupMemberIds(
      (conversationInfo?.participants || [])
        .map((participant) => String(participant._id || participant))
        .filter((participantId) => participantId !== ownerId),
    );
    setGroupInfoOpen(true);
  };

  const toggleGroupMember = (memberId) => {
    setGroupMemberIds((members) =>
      members.includes(memberId)
        ? members.filter((id) => id !== memberId)
        : [...members, memberId],
    );
  };

  const saveGroupInfo = async () => {
    try {
      setSavingGroup(true);
      const res = await fetch(`${API_BASE_URL}/api/chat/group/conversation/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: groupNameDraft,
          passengerIds: groupMemberIds,
        }),
      });
      await res.json();
      if (!res.ok) return;
      setGroupInfoOpen(false);
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGroup(false);
    }
  };

  const handleBack = () => {
    const chatSource = location.state?.chatSource;

    if (chatSource?.pathname) {
      navigate(
        `${chatSource.pathname}${chatSource.search || ""}${chatSource.hash || ""}`,
        {
          state: {
            ...chatSource.returnState,
            highlightChatSourceId: chatSource.highlightId,
            highlightChatSourceType: chatSource.highlightType,
            activeTab: chatSource.activeTab,
          },

        },
      );
      return;
    }
    navigate(-1);
  };

  const downloadAttachment = async (url, fileName) => {
    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`Attachment download failed: ${response.status}`);

      const downloadUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (err) {
      console.error("Failed to download chat attachment", err);
    }
  };

  const longPressTimeout = { current: null };
  const startLongPress = (msg) => {
    if (!isOwn(msg) || isMobile) return;
    longPressTimeout.current = setTimeout(() => {
      setSheetMessageId(msg._id);
    }, 500);
  };
  const clearLongPress = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-top">
        <button className="btnform" onClick={handleBack}>
          Back
        </button>
        <h1 className="chat-header">
          {isGroupConversation
            ? conversationInfo?.groupName || "Ride Group Chat"
            : "CabMate Chat"}
        </h1>
        {isGroupConversation && (
          <button
            className="group-info-button"
            type="button"
            onClick={openGroupInfo}
          >
            Group info
          </button>
        )}
        <p>
          {isGroupConversation
            ? `${conversationInfo?.participants?.length || 0} participants • Only selected, accepted passengers can access this group.`
            : "These conversations are private and can only be seen and accessed by you and the other participant."}
        </p>
      </div>
      {groupInfoOpen && (
        <div className="popup" onClick={() => setGroupInfoOpen(false)}>
          <div
            className="popup-container group-creator"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Group info</h2>
            {isGroupOwner ? (
              <>
                <label htmlFor="edit-group-name">Group name</label>
                <input
                  id="edit-group-name"
                  value={groupNameDraft}
                  maxLength={80}
                  onChange={(event) => setGroupNameDraft(event.target.value)}
                />
                <div className="group-member-list">
                  <p className="group-member-option">You (Admin)</p>
                  {(conversationInfo?.eligibleParticipants || []).map((user) => {
                    const userId = String(user._id || user);
                    return (
                      <label className="group-member-option" key={userId}>
                        <input
                          type="checkbox"
                          checked={groupMemberIds.includes(userId)}
                          onChange={() => toggleGroupMember(userId)}
                        />
                        <span>{user.name || "Passenger"}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="group-member-list">
                {(conversationInfo?.participants || []).map((user) => {
                  const userId = String(user._id || user);
                  const ownerId = String(
                    conversationInfo?.ownerId?._id ||
                    conversationInfo?.ownerId ||
                    "",
                  );
                  const displayName =
                    userId === String(currentUser)
                      ? "You"
                      : user.name || "Group member";

                  return (
                    <p className="group-member-option" key={userId}>
                      {displayName}
                      {userId === ownerId ? " (Admin)" : ""}
                    </p>
                  );
                })}
              </div>
            )}
            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={() => setGroupInfoOpen(false)}
              >
                Close
              </button>
              {isGroupOwner && (
                <button
                  className="popup-btn confirm-btn"
                  disabled={savingGroup}
                  onClick={saveGroupInfo}
                >
                  {savingGroup ? "Saving..." : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="chat-box">
        {messages.map((msg) => {
          const own = isOwn(msg);
          const isEditing = editingMessageId === msg._id;

          return (
            <div
              key={msg._id}
              id={`message-${msg._id}`}
              className={`${own ? "my-message" : "other-message"} ${highlightedMessageId === msg._id
                ? "message-notification-highlight"
                : ""
                } ${msg.deleted ? "deleted-message" : ""}`}
              onMouseEnter={() => own && !isMobile && !msg.deleted && setMenuMessageId(msg._id)}
              onMouseLeave={() => own && !isMobile && setMenuMessageId("")}
              onTouchStart={() => own && isMobile && !msg.deleted && startLongPress(msg)}
              onTouchEnd={clearLongPress}
              onTouchMove={clearLongPress}
            >
              {isEditing ? (
                <div className="edit-message-box">
                  <input
                    className="edit-message-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div className="edit-message-actions">
                    <button
                      className="btnform edit-save"
                      disabled={editing}
                      onClick={() => saveEdit(msg._id)}
                    >
                      {editing ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btnform edit-cancel"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : msg.deleted ? (
                <p className="deleted-message-text">This message was deleted</p>
              ) : (
                <>
                  {msg.text && <p>{msg.text}</p>}

                  {msg.attachments?.length > 0 && (
                    <div className="message-attachments">
                      {msg.attachments.map((attachment, index) => {
                        const filename = attachment.url.split("/").pop();
                        const source = attachment.url.startsWith("http")
                          ? attachment.url
                          : `${API_BASE_URL}/api/chat/attachments/${encodeURIComponent(filename)}`;
                        const isImage = attachment.mimeType?.startsWith("image/");

                        return isImage ? (
                          <button
                            key={`${attachment.url}-${index}`}
                            type="button"
                            className="message-attachment-image-button"
                            onClick={() =>
                              setViewingImage({
                                url: source,
                                fileName: attachment.fileName || "image",
                              })
                            }
                            aria-label={`View ${attachment.fileName || "shared image"}`}
                          >
                            <img
                              src={source}
                              crossOrigin="use-credentials"
                              alt={attachment.fileName || "Shared image"}
                              className="message-attachment-image"
                              loading="lazy"
                            />
                          </button>
                        ) : (
                          <button
                            key={`${attachment.url}-${index}`}
                            onClick={() => {
                              const fullUrl = attachment.url.startsWith("http")
                                ? attachment.url
                                : `${API_BASE_URL}/api/chat/attachments/${encodeURIComponent(filename)}`;
                              console.log(`[Chat PDF] Opening PDF:`);
                              console.log(`  File: ${attachment.fileName}`);
                              console.log(`  Size: ${attachment.size} bytes`);
                              console.log(`  URL from DB: ${attachment.url}`);
                              console.log(`  API_BASE_URL: ${API_BASE_URL}`);
                              console.log(`  Full URL: ${fullUrl}`);
                              setViewingPdf({
                                url: fullUrl,
                                fileName: attachment.fileName || "attachment.pdf",
                              });
                            }}
                            className="message-attachment-file-card"
                            type="button"
                          >
                            <span className="attachment-file-icon">📄</span>
                            <span className="attachment-file-name">{attachment.fileName || "PDF"}</span>
                            <span className="attachment-file-size">{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : ""}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <small>
                    {own ? "- You" : msg.sender.name}
                    {msg.edited ? " • Edited" : ""}
                  </small>

                  {own && !isMobile && menuMessageId === msg._id && (
                    <div className="message-menu">
                      <button
                        className="message-menu-item"
                        onClick={() => startEdit(msg)}
                      >
                        Edit
                      </button>
                      <button
                        className="message-menu-item danger"
                        onClick={() => setDeleteTargetId(msg._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {deleteTargetId && (
        <div className="popup" onClick={() => setDeleteTargetId("")}>
          <div className="popup-container" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this message?</h2>
            <p>This action cannot be undone.</p>
            <div className="popup-buttons">
              <button
                className="popup-btn cancel-btn"
                onClick={() => setDeleteTargetId("")}
              >
                Cancel
              </button>
              <button
                className="popup-btn confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {sheetMessageId && (() => {
        const sheetMsg = messages.find((m) => m._id === sheetMessageId);
        if (!sheetMsg) return null;
        return (
          <div className="bottom-sheet-overlay" onClick={() => setSheetMessageId("")}>
            <div
              className="bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="bottom-sheet-item"
                onClick={() => startEdit(sheetMsg)}
              >
                Edit
              </button>
              <button
                className="bottom-sheet-item danger"
                onClick={() => {
                  setSheetMessageId("");
                  setDeleteTargetId(sheetMsg._id);
                }}
              >
                Delete
              </button>
              <button
                className="bottom-sheet-item cancel"
                onClick={() => setSheetMessageId("")}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      <div className="chat-input-section">
        <div className="chat-input-wrap">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message..."
          />

          <div className="attachment-picker">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/*,application/pdf"
              multiple
              onChange={handleFileSelection}
              hidden
            />
            <button
              type="button"
              className="chat-file-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Attach
            </button>
          </div>
        </div>

        <button disabled={loading} onClick={sendMessage}>
          {loading ? "Sending...." : "Send"}
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files-bar">
          {selectedFiles.map((file, index) => (
            <span key={`${file.name}-${index}`} className="selected-file-pill">
              {file.name}
            </span>
          ))}
        </div>
      )}

      {viewingPdf && (
        <div className="pdf-viewer-overlay" onClick={() => setViewingPdf(null)}>
          <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h2>PDF Preview</h2>
              <button
                className="pdf-close-btn"
                onClick={() => setViewingPdf(null)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="pdf-viewer-content">
              <object
                data={viewingPdf.url}
                type="application/pdf"
                width="100%"
                height="100%"
                className="pdf-object"
              >
                <div className="pdf-fallback">
                  <p>PDF could not be displayed. Please download to view.</p>
                  <a
                    href={viewingPdf.url}
                    download={viewingPdf.fileName}
                    className="pdf-download-link"
                    onClick={(event) => {
                      event.preventDefault();
                      downloadAttachment(viewingPdf.url, viewingPdf.fileName);
                    }}
                  >
                    ⬇ Download PDF
                  </a>
                </div>
              </object>
            </div>
            <div className="pdf-viewer-footer">
              <a
                href={viewingPdf.url}
                download={viewingPdf.fileName}
                className="pdf-download-btn"
                onClick={(event) => {
                  event.preventDefault();
                  downloadAttachment(viewingPdf.url, viewingPdf.fileName);
                }}
              >
                ⬇ Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div
          className="pdf-viewer-overlay"
          onClick={() => setViewingImage(null)}
          role="presentation"
        >
          <div
            className="image-viewer-modal"
            role="dialog"
            aria-modal="true"
            aria-label={viewingImage.fileName}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pdf-viewer-header">
              <h2>{viewingImage.fileName}</h2>
              <button
                className="pdf-close-btn"
                onClick={() => setViewingImage(null)}
                type="button"
                aria-label="Close image preview"
              >
                ✕
              </button>
            </div>
            <div className="image-viewer-content">
              <img
                src={viewingImage.url}
                crossOrigin="use-credentials"
                alt={viewingImage.fileName}
              />
            </div>
            <div className="pdf-viewer-footer">
              <a
                href={viewingImage.url}
                download={viewingImage.fileName}
                className="pdf-download-btn"
                onClick={(event) => {
                  event.preventDefault();
                  downloadAttachment(viewingImage.url, viewingImage.fileName);
                }}
              >
                Download image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
