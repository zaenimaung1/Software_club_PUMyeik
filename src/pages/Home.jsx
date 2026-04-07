import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBlogStore } from '../store/blogStore'
import { useEventStore } from '../store/eventStore'
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
  const { loadFromApi: loadEvents } = useEventStore()
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

  const truncateText = (text, maxLength = 180) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

  useEffect(() => {
    loadBlogs()
    loadEvents()

    const refresh = () => {
      loadBlogs()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [loadBlogs, loadEvents])

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
            <NavLink className="button" to="/events">
              See upcoming events
            </NavLink>
          </div>
          <div className="hero-metrics">
            <div>
              <h3>48+</h3>
              <p>Active members</p>
            </div>
            <div>
              <h3>12</h3>
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

      <section className="panel">
        <div className="section-header with-actions">
          <div>
            <span className="eyebrow">Knowledge</span>
            <h2>Admin knowledge for the whole club</h2>
            <p>
              Admins share tutorials, notes, and development tips here. Members
              and admins can react and comment on each knowledge post.
            </p>
          </div>
          <NavLink className="button ghost" to="/blogs">
            Open knowledge board
          </NavLink>
        </div>
        {blogsLoading ? (
          <div className="gallery-mosaic" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <article key={item} className="story-item skeleton-card">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
              </article>
            ))}
          </div>
        ) : blogsError ? (
          <p className="muted">{blogsError}</p>
        ) : knowledgePosts.length ? (
          <div className="gallery-mosaic">
            {knowledgePosts.map((post) => (
              <article key={post.id} className="story-item">
                <p className="muted">{post.createdAt}</p>
                <h3>{post.title}</h3>
                <p>{truncateText(post.content, 140)}</p>
                <div className="story-meta">
                  <span>{post.author}</span>
                  <span>{post.likes.length} reactions</span>
                </div>
                <div className="story-meta">
                  <span>{post.comments.length} comments</span>
                  <NavLink className="button ghost" to="/blogs">
                    Join discussion
                  </NavLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No knowledge posts yet. Admins can start sharing soon.</p>
        )}
      </section>
    </main>
  )
}



