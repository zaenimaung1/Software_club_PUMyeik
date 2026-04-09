import { useCallback, useEffect, useState } from 'react'
import { FiBookOpen, FiCalendar, FiMessageSquare } from 'react-icons/fi'
import { api } from '../../api/client'

const empty = { title: '', content: '', date: '' }

export default function GallerySection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const truncateText = (text, maxLength = 180) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/blogs', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load knowledge posts')
    } finally {
      setLoading(false)
    }
  }, [token, onNotify])

  useEffect(() => {
    load()
  }, [load])



  return (
    <div className="space-y-5">
      
       <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
         <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
           <FiBookOpen className="h-3.5 w-3.5" />
           {items.length} posts
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {items.map((row) => (
              <article
                key={String(row._id)}
                className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {row.title}
                    </h3>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {truncateText(row.content, 150)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <FiCalendar className="mr-1 inline h-3.5 w-3.5" />
                    {row.date || '-'}
                  </span>
                </div>

                  <div className="mt-auto space-y-4 pt-5">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="truncate pr-4">
                      Author:{' '}
                      {typeof row.author === 'object' && row.author?.name
                        ? row.author.name
                        : '-'}
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <FiMessageSquare className="h-4 w-4" />
                      {row.comments?.length ?? 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
