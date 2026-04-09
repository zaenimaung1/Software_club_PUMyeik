import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiImage,
  FiLayers,
  FiTrash2,
  FiXCircle,
  FiX,
  FiArrowLeft,
  FiArrowRightCircle,
  FiArrowRight,
} from 'react-icons/fi'
import { api } from '../../api/client'

export default function ProjectsSection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNote, setReviewNote] = useState('')
  const [reviewLoading, setReviewLoading] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      const data = await api(`/api/projects/admin/all?${params}`, { token })
      setItems(Array.isArray(data.items) ? data.items : [])
      setPagination(data.pagination || {})
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [onNotify, token, page])

  useEffect(() => {
    load()
  }, [load])

  const openModal = useCallback((url) => {
    if (url) {
      setSelectedImage(url)
      setShowModal(true)
    }
  }, [])

  const closeModal = () => {
    setShowModal(false)
    setSelectedImage('')
  }

  const handleDelete = async () => {
    if (!deleteId || !token) return
    setDeleteLoading(deleteId)
    try {
      await api(`/api/projects/${deleteId}`, { method: 'DELETE', token })
      onNotify('Project deleted successfully')
      load()
      setDeleteId(null)
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setDeleteLoading('')
    }
  }

  const handleReview = async () => {
    if (!editingId || !token) return
    setReviewLoading(editingId)
    try {
      await api(`/api/projects/${editingId}/review`, { 
        method: 'PATCH', 
        body: { status: reviewStatus, reviewNote: reviewNote.trim() || undefined }, 
        token 
      })
      onNotify(`Project ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
      load()
      closeReviewModal()
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Review failed')
    } finally {
      setReviewLoading('')
    }
  }

  const openReviewModal = useCallback((id) => {
    setEditingId(id)
    setReviewStatus('approved')
    setReviewNote('')
  }, [])

const closeReviewModal = useCallback(() => {
    setEditingId(null)
    setReviewStatus('approved')
    setReviewNote('')
    setReviewLoading('')
  }, [])

  const openProjectModal = useCallback((project) => {
    setSelectedProject(project)
    setCurrentImageIndex(0)
  }, [])

  const closeProjectModal = useCallback(() => {
    setSelectedProject(null)
    setCurrentImageIndex(0)
  }, [])

  const goToPrevImage = useCallback(() => {
    if (selectedProject?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      )
    }
  }, [selectedProject])

  const goToNextImage = useCallback(() => {
    if (selectedProject?.images?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      )
    }
  }, [selectedProject])

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
        <div className="flex flex-wrap items-center justify-end gap-3">
         
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <FiLayers className="h-3.5 w-3.5" />
              {items.length} / {pagination.total || 0} projects
            </div>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading projects...</p>
        ) : items.length ? (
          <div className="mt-6 space-y-4">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submitter</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Images</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submitted</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((item) => {
                  const id = String(item._id ?? '')
                  const isReviewLoading = reviewLoading === id
                  const isDeleteLoading = deleteLoading === id
                  const statusTone = item.status === 'approved' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : item.status === 'rejected'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'

                  return (
                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white max-w-[200px] truncate" title={item.title}>
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {item.submitter?.name || item.submitter?.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusTone}`}>
                          {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {item.images?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
title="View project details"
                          onClick={() => openProjectModal(item)}
                          disabled={!item}
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:bg-emerald-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
                              disabled={isReviewLoading}
                              onClick={() => openReviewModal(id)}
                            >
                              <FiCheckCircle className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium text-sm hover:bg-rose-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
                              disabled={isReviewLoading}
                              onClick={() => {
                                setReviewStatus('rejected')
                                openReviewModal(id)
                              }}
                            >
                              <FiXCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Delete project"
                          onClick={() => setDeleteId(id)}
                          disabled={isDeleteLoading}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 rounded-b-3xl dark:bg-slate-900 dark:border-slate-700 sm:px-6">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total || 0)} of {pagination.total || 0} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled={!pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                <FiArrowLeft />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Page {page} of {pagination.pages || 1}
              </span>
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled={!pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          No projects found.
        </p>
      )}
    </section>

{showModal && (
        <div 
          className="fixed inset-0 z-[49] bg-black/90 flex items-center justify-center p-4 md:p-8" 
          onClick={closeModal}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-200 transition-all z-10" 
            onClick={closeModal}
          >
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged project image" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

      {selectedProject && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto" 
          onClick={closeProjectModal}
        >
          <div 
            className="w-full max-w-4xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-700" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-xl font-bold z-10 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
              onClick={closeProjectModal}
            >
              <FiX className="h-6 w-6" />
            </button>
            
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={selectedProject.submitter?.photo || '/default-avatar.png'} 
                    alt={selectedProject.submitter?.name} 
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-100 dark:ring-emerald-900/30"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedProject.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Submitter:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedProject.submitter?.name || selectedProject.submitter?.email || 'Unknown'}
                      </span>
                    </div>
                    {selectedProject.submitter?.batch && (
                      <span className="px-3 py-1 bg-violet-100 text-xs font-semibold rounded-full text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        Batch {selectedProject.submitter.batch}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Submitted {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'Unknown'}
                    {selectedProject.updatedAt && ` • Updated ${new Date(selectedProject.updatedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              
              {/* Status */}
              <div className="mt-6">
                <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                  selectedProject.status === 'approved' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                    : selectedProject.status === 'rejected'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                }`}>
                  {selectedProject.status === 'approved' ? 'Approved' : selectedProject.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedProject.description && (
              <div className="p-8 pt-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 dark:text-white">Description</h3>
                <p className="text-slate-700 leading-relaxed dark:text-slate-300 whitespace-pre-wrap">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {/* Images Gallery */}
            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 dark:text-white">Project Images ({selectedProject.images.length})</h3>
                <div className="space-y-6">
                  {/* Main Image */}
                  <div className="relative group">
                    <img 
                      src={selectedProject.images[currentImageIndex]} 
                      alt={`Project image ${currentImageIndex + 1}`} 
                      className="w-full h-96 md:h-[400px] object-cover rounded-2xl shadow-xl"
                    />
                    {/* Nav Arrows */}
                    {selectedProject.images.length > 1 && (
                      <>
                        <button
                          onClick={goToPrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all backdrop-blur-sm dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                          <FiArrowLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={goToNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all backdrop-blur-sm dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                          <FiArrowRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {currentImageIndex + 1} / {selectedProject.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnails */}
                  {selectedProject.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                      {selectedProject.images.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-4 transition-all ${
                            idx === currentImageIndex 
                              ? 'border-violet-500 ring-4 ring-violet-500/30 shadow-xl' 
                              : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`Thumbnail ${idx + 1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Info */}
            {(selectedProject.reviewNote || selectedProject.reviewedBy || selectedProject.reviewedAt) && (
              <div className="p-8 pt-4 border-t border-slate-200 bg-amber-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">Review Information</h3>
                <div className="space-y-3">
                  {selectedProject.reviewNote && (
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Note: </span>
                      <p className="text-slate-700 dark:text-slate-300">"{selectedProject.reviewNote}"</p>
                    </div>
                  )}
                  {selectedProject.reviewedBy && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed by: </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedProject.reviewedBy.name}</span>
                    </div>
                  )}
                  {selectedProject.reviewedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed on: </span>
                      <span>{new Date(selectedProject.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Project</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => setDeleteId(null)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 min-w-[100px] rounded-xl bg-slate-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 disabled:opacity-50"
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading === deleteId}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 min-w-[100px] bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white shadow-sm px-4 py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleDelete}
                  disabled={deleteLoading === deleteId}
                >
                  {deleteLoading === deleteId ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Project</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={closeReviewModal}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Decision
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800"
                  disabled={reviewLoading === editingId}
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Review Note (optional)
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={4}
                  placeholder="Explain your decision (visible to member)..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-800"
                  disabled={reviewLoading === editingId}
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 min-w-[100px] rounded-xl bg-slate-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={closeReviewModal}
                  disabled={reviewLoading === editingId}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`flex-1 min-w-[100px] rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                    reviewStatus === 'approved'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                  onClick={handleReview}
                  disabled={reviewLoading === editingId}
                >
                  {reviewLoading === editingId ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {reviewStatus === 'approved' ? <FiCheckCircle className="h-4 w-4" /> : <FiXCircle className="h-4 w-4" />}
                      {reviewStatus === 'approved' ? 'Approve' : 'Reject'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
