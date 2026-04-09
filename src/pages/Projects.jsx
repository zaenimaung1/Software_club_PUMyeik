import { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiUser, FiArrowUp, FiLayers } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';

export default function Projects() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { projects, isLoading, error, loadApprovedProjects, toggleLike, addComment } = useProjectStore();
  const [expanded, setExpanded] = useState({});
  const [replyingTo, setReplyingTo] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingActions, setLoadingActions] = useState({});

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    loadApprovedProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpanded = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleLikeHandler = useCallback(async (projectId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingActions((prev) => ({ ...prev, [projectId]: 'like' }));
    await toggleLike(projectId);
    setLoadingActions((prev) => ({ ...prev, [projectId]: false }));
  }, [isAuthenticated, toggleLike, navigate]);

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
  }, [isAuthenticated, newComment, addComment, navigate]);

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
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-12 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white/80 p-12 text-center shadow-2xl backdrop-blur-md border border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-800/50 sm:p-16 lg:max-w-6xl">
          <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-2xl bg-linear-to-r from-violet-400 to-blue-500 shadow-lg sm:h-24 sm:w-24" />
          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Loading approved projects...</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Discovering the latest member creations</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-hero">
        <header className="mb-16 text-center">
          <span className="mx-auto mb-6 inline-block rounded-full bg-linear-to-r from-violet-500/20 to-blue-500/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-violet-700 backdrop-blur-sm border border-violet-200/50 shadow-lg dark:from-violet-500/30 dark:to-blue-500/30 dark:text-violet-300 dark:border-violet-800/50 sm:px-8 sm:py-3">
            Projects Hub
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white lg:text-5xl xl:text-6xl leading-[0.9] bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
            Approved Member Showcase
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-slate-600 leading-relaxed dark:text-slate-300 lg:text-2xl">
            Explore handpicked projects from our community. Like, comment, collaborate, and get inspired.
          </p>
        </header>

        {error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/50 dark:bg-rose-950/50">
            <p className="text-lg font-semibold text-rose-800 dark:text-rose-200">{error}</p>
            <button
              onClick={loadApprovedProjects}
              className="mt-4 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Try again
            </button>
          </div>
        ) : projects.length ? (
          <div className="-m-4 columns-1 gap-6 md:columns-2 xl:columns-3 *:mb-6 break-inside-avoid">
            {projects.map((project) => {
              const id = String(project._id);
              const isExpanded = expanded[id];
              const isLong = (project.description?.length || 0) > 220;
              const description = isLong && !isExpanded
                ? `${project.description.slice(0, 220).trim()}...`
                : project.description;

              const hasUserLiked = projectHasUserLiked(project);
              const actionLoading = loadingActions[id];

              return (
                <article key={id} className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/70 p-1 shadow-[0_20px_60px_rgba(76,29,149,0.08)] backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                  <div className="aspect-4/3 overflow-hidden bg-linear-to-br from-slate-50/80 to-slate-100/50 rounded-t-3xl shadow-inner sm:aspect-video">
                    <img
                      src={project.images?.[0] || 'https://placehold.co/600x400/EEF2FF/Violet?text=Project&font=roboto'}
                      alt={project.title}
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-6 p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-lg">
                          {project.submitter?.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {project.submitter?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {project.submitter?.batch ? `Batch ${project.submitter.batch}` : 'Member'}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300">
                        Approved
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                      {project.title}
                    </h2>

                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                      {description}
                    </p>

                    {isLong && (
                      <button
                        className="text-sm font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400"
                        onClick={() => toggleExpanded(id)}
                        aria-expanded={isExpanded}
                        aria-controls={`desc-${id}`}
                      >
                        {isExpanded ? 'Show less -' : 'Read more +'}
                      </button>
                    )}

                    {project.images && project.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-[2.4fr_1fr] lg:grid-cols-3">
                        {(project.images ?? []).slice(1, 4).map((image, idx) => (
                          <img
                            key={`${id}-${idx}`}
                            src={image}
                            alt={`${project.title} preview ${idx + 2}`}
                            className="aspect-square cursor-pointer rounded-2xl object-cover shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 sm:aspect-4/3 sm:h-auto lg:aspect-square"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
                      <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <span>Published {formatDate(project.createdAt)}</span>
                        <span>{project.likes?.length || 0} likes</span>
                        <span>{project.comments?.length || 0} comments</span>
                      </div>
                      <NavLink
                        to="/member-settings"
                        className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-violet-500 hover:to-purple-500 transition-all"
                      >
                        Submit yours
                      </NavLink>
                    </div>

                    {/* Like & Comment Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <button
                        onClick={() => toggleLikeHandler(id)}
                        disabled={actionLoading === 'like'}
                        className={`flex items-center justify-center gap-2 flex-1 rounded-2xl px-5 py-3 text-sm font-semibold transition-all sm:px-6 ${
                          hasUserLiked
                            ? 'bg-linear-to-r from-rose-500/10 to-pink-500/10 text-rose-600 hover:from-rose-500/20 hover:to-pink-500/20 border border-rose-200 dark:border-rose-800/50 dark:text-rose-400'
                            : 'border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-500/10'
                        } ${actionLoading === 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-pressed={hasUserLiked}
                        aria-label={hasUserLiked ? 'Unlike project' : 'Like project'}
                      >
                        <FiHeart className={`h-5 w-5 transition-colors ${hasUserLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                        {actionLoading === 'like' ? '...' : hasUserLiked ? 'Liked' : 'Like'}
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 flex-1 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50/50 hover:border-slate-300 border border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:border-slate-600 transition-all sm:px-6"
                        onClick={() => setReplyingTo((prev) => ({ ...prev, [id]: null }))}
                        aria-label="Add comment"
                      >
                        <FiMessageCircle className="h-5 w-5" />
                        Comment
                      </button>
                    </div>

                    {/* Comments Section */}
                    <section aria-labelledby={`comments-title-${id}`}>
                      {project.comments && project.comments.length > 0 && (
                        <div className="mt-8 space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <h4 id={`comments-title-${id}`} className="text-lg font-semibold text-slate-900 dark:text-white">
                              Comments ({project.comments.length})
                            </h4>
                            <button
                              onClick={() => toggleExpanded(id)}
                              className="sm:hidden text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 px-4 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/5"
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? 'Less' : 'More'}
                            </button>
                          </div>
                          <div className="space-y-4 max-h-64 overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 [&>div]:max-w-none">
                            {project.comments.slice(0, isExpanded ? undefined : 2).map((comment) => (
                              <div key={String(comment._id)} className="group/comment flex gap-4 p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 backdrop-blur-sm border border-slate-200/30 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 dark:border-slate-700/30 transition-all">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-800 shadow-sm dark:from-slate-800 dark:to-slate-700 dark:text-slate-200">
                                  {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                      {comment.user?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-200/50 rounded-full">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed dark:text-slate-200 line-clamp-3">
                                    {comment.text}
                                  </p>
                                  {isAuthenticated && comment.replies?.length > 0 && (
                                    <div className="mt-3 ml-14 p-3 bg-white/60 rounded-xl border border-slate-200/50 dark:bg-slate-900/60 dark:border-slate-800/50">
                                      <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {comment.replies.length === 1 ? '1 reply' : `${comment.replies.length} replies`}
                                      </p>
                                    </div>
                                  )}
                                  <button
                                    className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors"
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
                          {project.comments.length > 2 && (
                            <button
                              className="hidden sm:block w-full text-left text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 p-3 rounded-2xl hover:bg-violet-50/50 border border-violet-200/30 dark:border-violet-800/30 dark:hover:bg-violet-500/5 transition-all"
                              onClick={() => toggleExpanded(id)}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <span>Show less comments (−)</span>
                              ) : (
                                <span>Show all {project.comments.length} comments (+)</span>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </section>

                    {/* Add Comment Form */}
                    {(isAuthenticated || replyingTo[id]) && (
                      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-end gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-lg">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            {replyingTo[id] && (
                              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                Replying to <span className="font-semibold">{project.comments.find((c) => String(c._id) === replyingTo[id])?.user?.name}</span>
                                <button
                                  onClick={() => setReplyingTo((prev) => ({ ...prev, [id]: null }))}
                                  className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500"
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
                                className="flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                aria-label="Post comment"
                              >
                                {actionLoading === 'comment' ? (
                                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8a9.986 9.986 0 00-2.291 2z" />
                                  </svg>
                                ) : (
                                  'Post'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isAuthenticated && (
                      <div className="mt-8 pt-6 border-t border-slate-200 text-center dark:border-slate-700">
                        <NavLink
                          to="/login"
                          className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-violet-500 hover:to-purple-500 transition-all"
                        >
                          <FiUser className="h-4 w-4" />
                          Log in to like & comment
                        </NavLink>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border-4 border-dashed border-slate-200/50 bg-linear-to-br from-slate-50/70 to-white/50 p-16 text-center shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:from-slate-900/30 dark:to-slate-800/30">
            <FiLayers className="mx-auto h-16 w-16 text-slate-400" />
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              No approved projects yet
            </h2>
            <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Members can submit their work from settings. Approved projects will appear here for everyone to see, like, and comment on.
            </p>
            <NavLink
              to="/member-settings"
              className="mt-8 inline-block rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              Submit your first project
            </NavLink>
          </div>
        )}
      </section>
    </main>
  );
}
