import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBlogStore } from '../store/blogStore'
import { useEventStore } from '../store/eventStore'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import aboutPhoto from '../assets/img/photo_2026-04-07_14-12-52.jpg'
import carouselPhotoOne from '../assets/img/photo_2025-08-26_13-13-12.jpg'
import carouselPhotoTwo from '../assets/img/photo_2025-08-30_11-55-29.jpg'
import carouselPhotoThree from '../assets/img/photo_2026-04-07_14-12-52.jpg'

export default function Home() {
  const {
    blogs,
    isLoading: blogsLoading,
    error: blogsError,
    loadFromApi: loadBlogs,
  } = useBlogStore()
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    loadApprovedProjects,
  } = useProjectStore()
  const { loadFromApi: loadEvents } = useEventStore()
  const { loadStats, getAdminCount, getMemberCount } = useUserStore()
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      id: 'local-slide-1',
      image: carouselPhotoOne,
      caption: 'Build sessions where members turn ideas into working products.',
    },
    {
      id: 'local-slide-2',
      image: carouselPhotoTwo,
      caption: 'Club activities that keep the whole team learning together.',
    },
    {
      id: 'local-slide-3',
      image: carouselPhotoThree,
      caption: 'Hands-on collaboration inside the Software Club community.',
    },
  ]

  const featuredBlog = blogs[0]
  const secondaryBlogs = blogs.slice(1, 4)
  const knowledgePosts = blogs.slice(0, 3)
  const featuredProjects = projects.slice(0, 3)

  const truncateText = (text, maxLength = 180) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

  useEffect(() => {
    loadBlogs()
    loadEvents()
    loadApprovedProjects()
    loadStats()

    const refresh = () => {
      loadBlogs()
      loadApprovedProjects()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [loadApprovedProjects, loadBlogs, loadEvents])

  useEffect(() => {
    if (!slides.length) return undefined
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) return undefined
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 5200)
    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    if (!slides.length) return
    const next = ((index % slides.length) + slides.length) % slides.length
    setActiveSlide(next)
  }

  return (
    <main className="page home-page">
      <section className="hero hero-header">
        <div className="hero-content">
          <span className="eyebrow">Software Club</span>
          <h1>
            Discover the projects we build, and the people who build them.
          </h1>
          <p className="lead">
            We are a student-led community focused on real products, production
            skills, and collaborative learning. Join the next sprint and ship
            your idea with a supportive team.
          </p>
          <div className="hero-actions">
            <NavLink className="button primary" to="/register">
              Join the club
            </NavLink>
            <NavLink className="button" to="/projects">
              Explore projects
            </NavLink>
          </div>
          <div className="hero-metrics">
            <div>
              <h3>{getMemberCount()}</h3>
              <p>Active members</p>
            </div>
            <div>
              <h3>{getAdminCount()}</h3>
              <p>Active admins</p>
            </div>
            <div>
              <h3>4</h3>
              <p>Weekly sessions</p>
            </div>
          </div>
        </div>
        <div className="hero-carousel">
          <div className="carousel-card">
            <div className="carousel">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                aria-live="polite"
              >
                {slides.map((slide, index) => (
                  <figure
                    key={slide.id}
                    className="carousel-slide"
                    aria-hidden={index !== activeSlide}
                  >
                    <img src={slide.image} alt={slide.caption} loading="lazy" />
                  </figure>
                ))}
              </div>
              <div className="carousel-controls">
                <button
                  type="button"
                  className="carousel-btn"
                  onClick={() => goToSlide(activeSlide - 1)}
                  aria-label="Previous slide"
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="carousel-btn"
                  onClick={() => goToSlide(activeSlide + 1)}
                  aria-label="Next slide"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={
                    index === activeSlide
                      ? 'carousel-dot active'
                      : 'carousel-dot'
                  }
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-block">
        <div className="about-media">
          <img src={aboutPhoto} alt="Software Club members working together" />
        </div>
        <div className="about-copy">
          <span className="eyebrow">About the club</span>
          <h2>Purpose of the Software Club</h2>
          <p>
            We created the Software Club to help students learn by building real
            products together. Our purpose is to give members a friendly place
            to practice teamwork, problem-solving, and shipping projects that
            feel like the real industry.
          </p>
          <div className="about-meta">
            <article>
              <h3>Our purpose</h3>
              <p>
                Learn modern software skills, support each other, and create
                projects we are proud to show in portfolios.
              </p>
            </article>
            <article>
              <h3>Founded</h3>
              <p>
                Created in <span className="text-red-500">February 9, 2024</span>{' '}
                by students who wanted more hands-on work.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header with-actions">
          <div>
            <span className="eyebrow">Projects</span>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">Approved member projects</h2>
            <p className="mt-3 text-lg text-slate-600 leading-7 dark:text-slate-400">Handpicked projects showcasing real member work—approved for excellence by our admin team.</p>
          </div>
          <NavLink className="button ghost relative group" to="/projects">
            <span className="relative z-10 transition-all duration-300 group-hover:-translate-x-1">View all projects</span>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
          </NavLink>
        </div>
        
        {projectsLoading ? (
          <div className="grid gap-8 lg:grid-cols-3" role="status" aria-busy="true">
            {[0,1,2].map(i => (
              <div key={i} className="relative rounded-3xl bg-gradient-to-r from-slate-200/40 via-white/50 to-slate-200/20 p-1 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-sm dark:from-slate-800/60 dark:via-slate-900/30 dark:to-slate-800/20 dark:ring-slate-700/50">
                <div className="h-80 rounded-2xl bg-gradient-to-br from-slate-50/80 via-slate-200/60 to-slate-100/80 p-8 shadow-xl animate-pulse dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-900/60">
                  <div className="h-32 rounded-xl bg-gradient-to-r from-slate-300 to-slate-400 mb-6 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-400 rounded-lg animate-pulse" />
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projectsError ? (
          <div className="p-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="mx-auto mb-6 w-20 h-20 text-slate-400">
              <svg className="" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007V15.75H12z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2 dark:text-slate-100">Couldn&apos;t load projects</h3>
            <p className="text-slate-500 dark:text-slate-400">{projectsError}</p>
          </div>
        ) : featuredProjects.length ? (
          <div className="grid gap-8 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <article
                key={String(project._id)}
                className="group overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:shadow-slate-900/20 dark:hover:shadow-xl"
              >
                <div className="overflow-hidden rounded-t-2xl aspect-[16/9]">
                  <img
                    src={project.images?.[0] || 'https://placehold.co/600x400/6B7280/FFFFFF?text=Project'}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src={project.submitter?.avatar || `https://placehold.co/40x40/9CA3AF/475569?text=${project.submitter?.name?.[0] || 'M'}`}
                        alt={project.submitter?.name ?? 'Member'}
                        className="h-full w-full rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        by {project.submitter?.name ?? 'Member'}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {truncateText(project.description, 120)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      24
                    </span>
                    <NavLink 
                      to={`/projects/${project._id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      View →
                    </NavLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="mx-auto h-32 w-32 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-full w-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">No Projects Yet</h3>
            <p className="mt-4 max-w-md text-slate-600 dark:text-slate-300 mx-auto">
              Be the first to submit! Members can share their amazing work through settings.
            </p>
            <NavLink className="mt-8 inline-block button primary" to="/member-settings">
              Submit Your Project
            </NavLink>
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-header with-actions">
          <div>
            <h2>Latest blogs</h2>
            <p>Club announcements, meeting notes, and development updates.</p>
          </div>
          <NavLink className="button ghost" to="/blogs">
            View all blogs
          </NavLink>
        </div>
        {blogsLoading ? (
          <div className="story-grid" aria-busy="true">
            <div className="story-feature skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
            <div className="story-list">
              {[0, 1, 2].map((item) => (
                <div key={item} className="story-item skeleton-card">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-text" />
                </div>
              ))}
            </div>
          </div>
        ) : blogsError ? (
          <p className="muted">{blogsError}</p>
        ) : featuredBlog ? (
          <div className="story-grid">
            <article className="story-feature">
              <p className="muted">{featuredBlog.createdAt}</p>
              <h3>{featuredBlog.title}</h3>
              <p>{truncateText(featuredBlog.content, 260)}</p>
              <div className="story-meta">
                <span>{featuredBlog.author}</span>
                <NavLink className="button ghost" to="/blogs">
                  Read more
                </NavLink>
              </div>
            </article>
            <div className="story-list">
              {secondaryBlogs.map((blog) => (
                <article key={blog.id} className="story-item">
                  <p className="muted">{blog.createdAt}</p>
                  <h4>{blog.title}</h4>
                  <p>{truncateText(blog.content, 120)}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">No blog updates yet. Check back soon.</p>
        )}
      </section>

      <section>
        <div>
          <span className="eyebrow">Mentor spotlight</span>
          <h2>Meet the students leading the club.</h2>
          <p>
            Our mentors are experienced students who guide project teams, lead
            workshops, and help create a welcoming environment for everyone.
          </p>
        </div>
        <div className="mentor-grid">
          {[
            {
              name: 'Ko Zarni Maung',
              role: 'President',
              image: '/mentors/ko-zarni-maung.jpg',
            },
            {
              name: 'Ko Kyaw MgMg Thu',
              role: 'Co-president',
              image: '/mentors/ko-kyaw-mgmg-thu.jpg',
            },
            {
              name: 'Ko Nyo Myo Khant',
              role: 'Founder',
              image: '/mentors/ko-nyo-myo-khant.jpg',
            },
            {
              name: 'Ko Aung Thuya Kyaw',
              role: 'Mentor',
              image: '/mentors/ko-aung-thuya-kyaw.jpg',
            },
            {
              name: 'Ko Min Han Sit Naing',
              role: 'Mentor',
              image: '/mentors/ko-aung-thuya-kyaw.jpg',
            },
          ].map((mentor) => (
            <article key={mentor.name} className="mentor-card mentor-card--photo">
              <div className="mentor-photo">
                {mentor.image ? (
                  <img src={mentor.image} alt={mentor.name} loading="lazy" />
                ) : (
                  <span className="mentor-initial">{mentor.name[0]}</span>
                )}
              </div>
              <div className="mentor-details">
                <h3>{mentor.name}</h3>
                <p>{mentor.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

     <section className="section-block">
        <div className="section-header with-actions">
          <div>
            <h2>Knowledge Sharing</h2>
            <p>Club announcements, meeting notes, and development updates.</p>
          </div>
          <NavLink className="button ghost" to="/blogs">
            View all blogs
          </NavLink>
        </div>
        {blogsLoading ? (
          <div className="story-grid" aria-busy="true">
            <div className="story-feature skeleton-card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
            <div className="story-list">
              {[0, 1, 2].map((item) => (
                <div key={item} className="story-item skeleton-card">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-text" />
                </div>
              ))}
            </div>
          </div>
        ) : blogsError ? (
          <p className="muted">{blogsError}</p>
        ) : featuredBlog ? (
          <div className="story-grid">
            <article className="story-feature">
              <p className="muted">{featuredBlog.createdAt}</p>
              <h3>{featuredBlog.title}</h3>
              <p>{truncateText(featuredBlog.content, 260)}</p>
              <div className="story-meta">
                <span>{featuredBlog.author}</span>
                <NavLink className="button ghost" to="/blogs">
                  Read more
                </NavLink>
              </div>
            </article>
            <div className="story-list">
              {secondaryBlogs.map((blog) => (
                <article key={blog.id} className="story-item">
                  <p className="muted">{blog.createdAt}</p>
                  <h4>{blog.title}</h4>
                  <p>{truncateText(blog.content, 120)}</p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">No blog updates yet. Check back soon.</p>
        )}
      </section>
    </main>
  )
}

