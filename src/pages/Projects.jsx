import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiArrowUp, FiHeart, FiLayers, FiMessageCircle, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

export default function Projects() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { projects, isLoading, error, loadApprovedProjects, toggleLike, addComment } = useProjectStore();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingActions, setLoadingActions] = useState({});

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    loadApprovedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDescription = useCallback((id) => {
    setExpandedDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleComments = useCallback((id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleLikeHandler = useCallback(async (projectId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingActions((prev) => ({ ...prev, [projectId]: 'like' }));
    await toggleLike(projectId);
    setLoadingActions((prev) => ({ ...prev, [projectId]: false }));
  }, [isAuthenticated, navigate, toggleLike]);

  const submitComment = useCallback(async (projectId, parentId = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!newComment[projectId]?.trim()) return;

    const text = newComment[projectId];
    setLoadingActions((prev) => ({ ...prev, [projectId]: 'comment' }));
    await addComment(projectId, text, parentId);
    setNewComment((prev) => ({ ...prev, [projectId]: '' }));
    setReplyingTo((prev) => ({ ...prev, [projectId]: null }));
    setLoadingActions((prev) => ({ ...prev, [projectId]: false }));
  }, [addComment, isAuthenticated, navigate, newComment]);

  const projectHasUserLiked = useCallback((project) => {
    if (!user) return false;
    return project.likes?.some((like) => String(like._id) === String(user.id));
  }, [user]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <main className="page">
        <section className="py-14 text-center">
          <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-2xl bg-linear-to-r from-amber-500 to-teal-500 shadow-lg" />
          <h2 className="text-2xl font-bold text-[var(--ink)] sm:text-3xl">Loading approved projects...</h2>
          <p className="mt-4 text-lg text-[var(--ink-soft)]">Discovering the latest member creations</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="py-2">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <span className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
            Projects Hub
          </span>
          <h1 className="text-4xl leading-[0.95] font-black text-[var(--ink)] sm:text-5xl lg:text-6xl">
            Approved Member Showcase
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)] sm:text-xl">
            Explore handpicked work from our community. Share feedback, discover ideas, and celebrate real builds.
          </p>
        </header>

        {error ? (
          <div className="border-y border-rose-300/70 py-8 text-center">
            <p className="text-lg font-semibold text-rose-800">{error}</p>
            <button
              onClick={loadApprovedProjects}
              className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        ) : projects.length ? (
          <div className="space-y-10">
            {projects.map((project) => {
              const id = String(project._id);
              const isDescriptionExpanded = expandedDescriptions[id];
              const isCommentsExpanded = expandedComments[id];
              const isLong = (project.description?.length || 0) > 220;
              const description = isLong && !isDescriptionExpanded
                ? `${project.description.slice(0, 220).trim()}...`
                : project.description;
              const hasUserLiked = projectHasUserLiked(project);
              const actionLoading = loadingActions[id];

              return (
                <article key={id} className="border-t border-[var(--line)] pt-10 first:border-t-0 first:pt-0">
                  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={project.submitter?.avatar || `https://placehold.co/40x40/9CA3AF/475569?text=${project.submitter?.name?.[0] || 'M'}`}
                              alt={project.submitter?.name ?? 'Member'}
                              className="h-full w-full rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--ink)]">{project.submitter?.name || 'Anonymous'}</p>
                            <p className="text-sm text-[var(--muted)]">
                              {project.submitter?.batch ? `Roll No. ${project.submitter.batch}` : 'Member'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Approved</span>
                      </div>

                      <h2 className="text-2xl leading-tight font-bold text-[var(--ink)]">{project.title}</h2>

                      <p id={`desc-${id}`} className="text-[15px] leading-7 text-[var(--ink-soft)]">
                        {description}
                      </p>

                      {isLong && (
                        <button
                          className="text-sm font-semibold text-teal-700 transition hover:text-teal-600"
                          onClick={() => toggleDescription(id)}
                          aria-expanded={isDescriptionExpanded}
                          aria-controls={`desc-${id}`}
                        >
                          {isDescriptionExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      {project.images && project.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {(project.images ?? []).slice(1, 4).map((image, idx) => (
                            <img
                              key={`${id}-${idx}`}
                              src={image}
                              alt={`${project.title} preview ${idx + 2}`}
                              className="aspect-square rounded-xl object-cover ring-2 ring-slate-200 transition hover:opacity-90 dark:ring-slate-700"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-4 text-sm text-[var(--muted)]">
                        <div className="flex flex-wrap items-center gap-4">
                          <span>Published {formatDate(project.createdAt)}</span>
                          <span>{project.likes?.length || 0} likes</span>
                          <span>{project.comments?.length || 0} comments</span>
                        </div>
                        <NavLink
                          to="/member-settings"
                          className="rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:from-amber-600 hover:to-orange-600"
                        >
                          Submit yours
                        </NavLink>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={() => toggleLikeHandler(id)}
                          disabled={actionLoading === 'like'}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                            hasUserLiked
                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                              : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-teal-300 hover:text-teal-700'
                          } ${actionLoading === 'like' ? 'cursor-not-allowed opacity-50' : ''}`}
                          aria-pressed={hasUserLiked}
                          aria-label={hasUserLiked ? 'Unlike project' : 'Like project'}
                        >
                          <FiHeart className={`h-4 w-4 ${hasUserLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                          {actionLoading === 'like' ? '...' : hasUserLiked ? 'Liked' : 'Like'}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-amber-300 hover:text-amber-700"
                          onClick={() => setReplyingTo((prev) => ({ ...prev, [id]: null }))}
                          aria-label="Add comment"
                        >
                          <FiMessageCircle className="h-4 w-4" />
                          Comment
                        </button>
                      </div>

                      <section aria-labelledby={`comments-title-${id}`}>
                        {project.comments && project.comments.length > 0 && (
                          <div className="space-y-3 border-t border-[var(--line)] pt-5">
                            <div className="flex items-center justify-between">
                              <h4 id={`comments-title-${id}`} className="text-base font-semibold text-[var(--ink)]">
                                Comments ({project.comments.length})
                              </h4>
                              {project.comments.length > 2 && (
                                <button
                                  onClick={() => toggleComments(id)}
                                  className="text-sm font-medium text-teal-700 transition hover:text-teal-600"
                                  aria-expanded={isCommentsExpanded}
                                >
                                  {isCommentsExpanded ? 'Show less' : `Show all (${project.comments.length})`}
                                </button>
                              )}
                            </div>

                            <div className="space-y-2.5">
                              {project.comments.slice(0, isCommentsExpanded ? undefined : 2).map((comment) => (
                                <div key={String(comment._id)} className="flex gap-3 border-l-2 border-amber-200 pl-3">
                                  <div className="h-9 w-9 flex-shrink-0">
                                    <img
                                      src={comment.user?.avatar || `https://placehold.co/36x36/9CA3AF/475569?text=${comment.user?.name?.[0] || 'U'}`}
                                      alt={comment.user?.name ?? 'User'}
                                      className="h-full w-full rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-semibold text-[var(--ink)]">
                                        {comment.user?.name || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-[var(--muted)]">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{comment.text}</p>

                                    {isAuthenticated && comment.replies?.length > 0 && (
                                      <div className="mt-2 text-xs text-[var(--muted)]">
                                        {comment.replies.length === 1 ? '1 reply' : `${comment.replies.length} replies`}
                                      </div>
                                    )}

                                    <button
                                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] transition hover:text-teal-700"
                                      onClick={() => setReplyingTo((prev) => ({ ...prev, [id]: String(comment._id) }))}
                                      aria-label="Reply to comment"
                                    >
                                      <FiArrowUp className="h-3 w-3 -rotate-90" />
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>

                      {(isAuthenticated || replyingTo[id]) && (
                        <div className="border-t border-[var(--line)] pt-5">
                          <div className="flex items-end gap-3">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                src={user?.avatar || `https://placehold.co/40x40/9CA3AF/475569?text=${user?.name?.[0] || 'U'}`}
                                alt={user?.name ?? 'User'}
                                className="h-full w-full rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                              />
                            </div>
                            <div className="flex-1">
                              {replyingTo[id] && (
                                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                                  Replying to
                                  <span className="font-semibold text-[var(--ink)]">
                                    {project.comments.find((c) => String(c._id) === replyingTo[id])?.user?.name}
                                  </span>
                                  <button
                                    onClick={() => setReplyingTo((prev) => ({ ...prev, [id]: null }))}
                                    className="text-[var(--muted)] underline underline-offset-2"
                                    aria-label="Cancel reply"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input
                                  value={newComment[id] || ''}
                                  onChange={(e) => setNewComment((prev) => ({ ...prev, [id]: e.target.value }))}
                                  placeholder={replyingTo[id] ? 'Write a reply...' : 'Write a comment...'}
                                  className="flex-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                                  disabled={actionLoading === 'comment'}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      submitComment(id, replyingTo[id]);
                                    }
                                  }}
                                  aria-label={replyingTo[id] ? 'Reply input' : 'Comment input'}
                                />
                                <button
                                  onClick={() => submitComment(id, replyingTo[id])}
                                  disabled={!newComment[id]?.trim() || actionLoading === 'comment'}
                                  className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="Post comment"
                                >
                                  {actionLoading === 'comment' ? 'Posting...' : 'Post'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isAuthenticated && (
                        <div className="border-t border-[var(--line)] pt-5 text-center">
                          <NavLink
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-teal-700 hover:to-cyan-800"
                          >
                            <FiUser className="h-4 w-4" />
                            Log in to like & comment
                          </NavLink>
                        </div>
                      )}
                    </div>

                    <div className="order-first lg:order-none">
                      <img
                        src={project.images?.[0] || 'https://placehold.co/600x400/EEF2FF/Violet?text=Project&font=roboto'}
                        alt={project.title}
                        className="aspect-[16/10] w-full rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-y border-dashed border-[var(--line)] py-14 text-center">
            <FiLayers className="mx-auto h-14 w-14 text-[var(--muted)]" />
            <h2 className="mt-5 text-2xl font-bold text-[var(--ink)]">No approved projects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[var(--ink-soft)]">
              Members can submit their work from settings. Approved projects will appear here for everyone to see,
              like, and comment on.
            </p>
            <NavLink
              to="/member-settings"
              className="mt-6 inline-block rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600"
            >
              Submit your first project
            </NavLink>
          </div>
        )}
      </section>
    </main>
  );
}
